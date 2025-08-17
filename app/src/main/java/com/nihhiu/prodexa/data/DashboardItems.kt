package com.nihhiu.prodexa.data

import com.nihhiu.prodexa.R

data class DashboardItem(
    val id: String,
    val name: Int,
    val icon: Int?,
    val navActionId: Int?,
    val enabled: Boolean = true
)

enum class DashboardSortMode{
    DEFAULT,
    NAME_ASCENDING,
    NAME_DESCENDING
}

val DashboardItems = listOf(
    DashboardItem(
        id = "tasks",
        name = R.string.dashboard_tasks,
        icon = null,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "diary",
        name = R.string.dashboard_diary,
        icon = null,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "calendar",
        name = R.string.dashboard_calendar,
        icon = null,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "habits",
        name = R.string.dashboard_habits,
        icon = null,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "wallet",
        name = R.string.dashboard_wallet,
        icon = null,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "notes",
        name = R.string.dashboard_notes,
        icon = null,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "countdown",
        name = R.string.dashboard_countdown,
        icon = null,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "grocery",
        name = R.string.dashboard_grocery,
        icon = null,
        navActionId = null,
        enabled = true
    )
)