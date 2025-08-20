package com.nihhiu.prodexa.storage

import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.util.concurrent.ConcurrentHashMap
import androidx.core.net.toUri

object StorageRepository {

    /**
    CONFIG / UTIL
     **/
    private const val PREFS = "storage"
    private const val PREF_URI_PREFIX = "uri_"
    private const val DEFAULT_MIME = "text/csv"

    private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = PREFS)

    private val mutexMap = ConcurrentHashMap<String, Mutex>()

    private fun mutexFor(feature: String) = mutexMap.getOrPut(feature) { Mutex() }

    fun fileNameForFeature(feature: String): String {
        val cleaned = feature.trim().lowercase().replace("\\s+".toRegex(), "_")
        return "$cleaned.csv"
    }

    suspend fun persistUriForFeature(context: Context, feature: String, uri: Uri) {
        val key = stringPreferencesKey(PREF_URI_PREFIX + feature)
        context.dataStore.edit { preferences ->
            preferences[key] = uri.toString()
        }
    }

    suspend fun getPersistedUriForFeature(context: Context, feature: String): Uri? {
        val key = stringPreferencesKey(PREF_URI_PREFIX + feature)
        val preferences = context.dataStore.data.first()
        val uriString = preferences[key] ?: return null
        return try {
            uriString.toUri()
        } catch (e: Exception) {
            null
        }
    }

    suspend fun clearPersistedUriForFeature(context: Context, feature: String) {
        val key = stringPreferencesKey(PREF_URI_PREFIX + feature)
        context.dataStore.edit { preferences ->
            preferences.remove(key)
        }
    }

    fun takePersistablePermission(context: Context, uri: Uri) {
        try {
            val flags = (android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
                    or android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            context.contentResolver.takePersistableUriPermission(uri, flags)
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    /**
    CSV
     **/
    suspend fun writeStringToUriAtomically(context: Context, targetUri: Uri, content: String) {
        withContext(Dispatchers.IO) {
            val temp = File.createTempFile("tmp_csv_", ".tmp", context.cacheDir)
            temp.outputStream().buffered().use { it.write(content.toByteArray(Charsets.UTF_8)) }

            context.contentResolver.openOutputStream(targetUri, "wt")?.use { out ->
                FileInputStream(temp).use { fis ->
                    fis.copyTo(out)
                }
            } ?: throw IOException("Failed to open output stream to $targetUri")

            temp.delete()
        }
    }

    suspend fun readStringFromUri(context: Context, uri: Uri): String = withContext(Dispatchers.IO) {
        context.contentResolver.openInputStream(uri)?.bufferedReader(Charsets.UTF_8)?.use { it.readText() } ?: ""
    }

    /**
    FILES
     **/
    suspend fun createFileInTree(context: Context, treeUri: Uri, displayName: String, mimeType: String = DEFAULT_MIME): Uri? =
        withContext(Dispatchers.IO) {
            val pickedDir = DocumentFile.fromTreeUri(context, treeUri) ?: return@withContext null
            val existing = pickedDir.findFile(displayName)
            if (existing != null) {
                existing.uri
            } else {
                pickedDir.createFile(mimeType, displayName)?.uri
            }
        }

    suspend fun findFileInTree(context: Context, treeUri: Uri, displayName: String): Uri? =
        withContext(Dispatchers.IO) {
            val pickedDir = DocumentFile.fromTreeUri(context, treeUri) ?: return@withContext null
            pickedDir.findFile(displayName)?.uri
        }

    suspend fun openOnCreateFileInTree(context: Context, treeUri: Uri, displayName: String, mimeType: String = DEFAULT_MIME): Uri? {
        val found = findFileInTree(context, treeUri, displayName)
        return found ?: createFileInTree(context, treeUri, displayName, mimeType)
    }

    suspend fun ensureFeatureUri(
        context: Context,
        feature: String,
        treeUriToCreateInside: Uri? = null
    ): Uri? {
        // ✅ Agora usa a versão suspend do DataStore
        getPersistedUriForFeature(context, feature)?.let { return it }

        val fname = fileNameForFeature(feature)
        if (treeUriToCreateInside != null) {
            val created = openOnCreateFileInTree(context, treeUriToCreateInside, fname)
            if (created != null) {
                persistUriForFeature(context, feature, created)
            }
            return created
        }

        return null
    }

    suspend fun writeCsvForFeature(context: Context, feature: String, targetUri: Uri, csvContent: String) {
        val m = mutexFor(feature)
        m.withLock {
            writeStringToUriAtomically(context, targetUri, csvContent)
        }
    }

    suspend fun readCsvForFeature(context: Context, feature: String): String? {
        val uri = getPersistedUriForFeature(context, feature) ?: return null
        return mutexFor(feature).withLock {
            readStringFromUri(context, uri)
        }
    }

    suspend fun appendLineToCsvForFeature(context: Context, feature: String, csvLine: String, ensureNewLine: Boolean = true) {
        val uri = getPersistedUriForFeature(context, feature) ?: throw IOException("No URI for feature $feature")
        val m = mutexFor(feature)
        m.withLock {
            val existing = readStringFromUri(context, uri)
            val newContent = StringBuilder(existing)
            if (existing.isNotEmpty() && !existing.endsWith("\n")) newContent.append("\n")
            newContent.append(csvLine)
            if (ensureNewLine) newContent.append("\n")
            writeStringToUriAtomically(context, uri, newContent.toString())
        }
    }

    suspend fun listFilesInTree(context: Context, treeUri: Uri): List<DocumentFile> = withContext(Dispatchers.IO) {
        val pickedDir = DocumentFile.fromTreeUri(context, treeUri)
        pickedDir?.listFiles()?.toList() ?: emptyList()
    }

    suspend fun deleteFile(context: Context, fileUri: Uri): Boolean = withContext(Dispatchers.IO) {
        val df = DocumentFile.fromSingleUri(context, fileUri) ?: return@withContext false
        df.delete()
    }

    suspend fun renameFile(context: Context, fileUri: Uri, newDisplayName: String): Boolean = withContext(Dispatchers.IO) {
        val df = DocumentFile.fromSingleUri(context, fileUri) ?: return@withContext false
        df.renameTo(newDisplayName)
    }

    suspend fun migrateLocalFileToUri(context: Context, localFileName: String, targetUri: Uri) {
        withContext(Dispatchers.IO) {
            val local = File(context.filesDir, localFileName)
            if (!local.exists()) throw IOException("Local file not found: $localFileName")

            context.contentResolver.openOutputStream(targetUri, "wt")?.use { out ->
                FileInputStream(local).use { fis ->
                    fis.copyTo(out)
                }
            } ?: throw IOException("Couldn't open output stream to $targetUri")
        }
    }
}