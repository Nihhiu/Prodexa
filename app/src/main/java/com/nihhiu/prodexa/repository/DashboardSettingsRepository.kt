package com.nihhiu.prodexa.repository

import android.content.Context
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.data.DashboardItems
import com.nihhiu.prodexa.data.DashboardSortMode
import androidx.core.content.edit

class DashboardSettingsRepository(private val context: Context) {

    private val prefs = context.getSharedPreferences("dashboard_prefs", Context.MODE_PRIVATE)

    fun saveItemEnabled(itemId: String, enabled: Boolean) {
        prefs.edit { putBoolean(itemId, enabled) }
    }

    fun isItemEnabled(itemId: String): Boolean {
        return prefs.getBoolean(itemId, true)
    }

    fun getEnabledItems(): List<DashboardItem> {
        val enabledList = DashboardItems
            .map { it.copy(enabled = isItemEnabled(it.id)) }
            .filter { it.enabled }

        return when (getSortMode()) {
            DashboardSortMode.DEFAULT -> sortByDefault(enabledList)
            DashboardSortMode.NAME_ASCENDING -> enabledList.sortedBy { context.getString(it.name) }
            DashboardSortMode.NAME_DESCENDING -> enabledList.sortedByDescending { context.getString(it.name) }
        }
    }

    private val SORT_KEY = "sort_mode"
    private val defaultOrder = listOf("tasks", "diary", "calendar", "habits", "wallet", "notes", "countdown", "grocery")

    fun saveSortMode(mode: DashboardSortMode) {
        prefs.edit { putString(SORT_KEY, mode.name) }
    }

    fun getSortMode(): DashboardSortMode {
        val name = prefs.getString(SORT_KEY, DashboardSortMode.DEFAULT.name)
        return DashboardSortMode.valueOf(name!!)
    }

    private fun sortByDefault(items: List<DashboardItem>): List<DashboardItem> {
        return items.sortedBy { defaultOrder.indexOf(it.id) }
    }
}