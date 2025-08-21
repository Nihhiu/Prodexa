package com.nihhiu.prodexa.storage

import android.app.Fragment
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.OpenableColumns
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.net.toUri
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.documentfile.provider.DocumentFile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.util.concurrent.ConcurrentHashMap

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

    suspend fun getDisplayName(context: Context, uri: Uri, fallback: String): String =
        withContext(Dispatchers.IO) {
            var name: String? = null
            try {
                context.contentResolver.query(
                    uri,
                    arrayOf(android.provider.OpenableColumns.DISPLAY_NAME),
                    null,
                    null,
                    null
                )?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val nameIdx = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                        if (nameIdx >= 0) name = cursor.getString(nameIdx)
                    }
                }
            } catch (_: Exception) {}
            name ?: fallback
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

    fun getAppExternalCsvDir(context: Context): File {
        val dir = context.getExternalFilesDir("csv") ?: File(context.filesDir, "csv")
        return dir
    }

    fun getFileForFeature(context: Context, feature: String): File =
        File(getAppExternalCsvDir(context), fileNameForFeature(feature))

    fun getFallbackUriForFeature(context: Context, feature: String) =
        getFileForFeature(context, feature).toUri()
}