package com.nihhiu.prodexa.repository

import android.content.Context
import androidx.datastore.preferences.SharedPreferencesMigration
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.data.DashboardItems
import com.nihhiu.prodexa.data.DashboardSortMode
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map


private val Context.settingsDataStore by preferencesDataStore(
    name = "settings_general",
    produceMigrations = { ctx ->
        listOf(SharedPreferencesMigration(ctx, "settings_general"))
    }
)

class SettingsGeneralRepository(private val context: Context) {

    private val dataStore = context.settingsDataStore

    /**
     * Keys
     **/
    private val USERNAME_KEY = stringPreferencesKey("username")
    private val SORT_KEY = stringPreferencesKey("sort_mode")

    private val defaultOrder = listOf("tasks", "diary", "calendar", "habits", "wallet", "notes", "countdown", "grocery")

    /**
     * USERNAME
     **/
    suspend fun saveUsername(username: String) {
        dataStore.edit { prefs ->
            prefs[USERNAME_KEY] = username
        }
    }

    val usernameFlow: Flow<String> = dataStore.data
        .map { prefs -> prefs[USERNAME_KEY] ?: "USERNAME ERROR" }

    suspend fun getUsername(): String {
        return usernameFlow.first()
    }

    /**
     * DASHBOARD LIST
     **/
    suspend fun saveItemEnabled(itemId: String, enabled: Boolean) {
        val key = booleanPreferencesKey(itemId)
        dataStore.edit { prefs ->
            prefs[key] = enabled
        }
    }

    suspend fun isItemEnabled(itemId: String): Boolean {
        val key = booleanPreferencesKey(itemId)
        return dataStore.data.map { prefs -> prefs[key] ?: true }.first()
    }

    fun isItemEnabledFlow(itemId: String): Flow<Boolean> {
        val key = booleanPreferencesKey(itemId)
        return dataStore.data.map { prefs -> prefs[key] ?: true }
    }

    suspend fun getEnabledItems(): List<DashboardItem> {
        val enabledList = DashboardItems
            .map { it.copy(enabled = isItemEnabled(it.id)) }
            .filter { it.enabled }

        return when (getSortMode()) {
            DashboardSortMode.DEFAULT -> sortByDefault(enabledList)
            DashboardSortMode.NAME_ASCENDING -> enabledList.sortedBy { context.getString(it.name) }
            DashboardSortMode.NAME_DESCENDING -> enabledList.sortedByDescending { context.getString(it.name) }
        }
    }

    suspend fun getAllItems(): List<DashboardItem> {
        return DashboardItems.sortedBy { context.getString(it.name) }
    }

    /**
     * SORT
     **/
    suspend fun saveSortMode(mode: DashboardSortMode) {
        dataStore.edit { prefs ->
            prefs[SORT_KEY] = mode.name
        }
    }

    val sortModeFlow: Flow<DashboardSortMode> = dataStore.data
        .map { prefs ->
            val name = prefs[SORT_KEY] ?: DashboardSortMode.DEFAULT.name
            safeValueOfSortMode(name)
        }

    suspend fun getSortMode(): DashboardSortMode {
        return sortModeFlow.first()
    }

    private fun sortByDefault(items: List<DashboardItem>): List<DashboardItem> {
        return items.sortedBy { defaultOrder.indexOf(it.id) }
    }

    private fun safeValueOfSortMode(name: String): DashboardSortMode {
        return try {
            DashboardSortMode.valueOf(name)
        } catch (e: Exception) {
            DashboardSortMode.DEFAULT
        }
    }
}