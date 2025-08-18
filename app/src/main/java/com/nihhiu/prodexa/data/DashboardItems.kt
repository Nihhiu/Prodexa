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
        icon = R.drawable.ic_tasks,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "diary",
        name = R.string.dashboard_diary,
        icon = R.drawable.ic_diary,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "calendar",
        name = R.string.dashboard_calendar,
        icon = R.drawable.ic_calendar,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "habits",
        name = R.string.dashboard_habits,
        icon = R.drawable.ic_habit,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "wallet",
        name = R.string.dashboard_wallet,
        icon = R.drawable.ic_wallet,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "notes",
        name = R.string.dashboard_notes,
        icon = R.drawable.ic_notes,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "countdown",
        name = R.string.dashboard_countdown,
        icon = R.drawable.ic_countdown,
        navActionId = null,
        enabled = true
    ),
    DashboardItem(
        id = "grocery",
        name = R.string.dashboard_grocery,
        icon = R.drawable.ic_grocery,
        navActionId = R.navigation.dashboard_grocery_nav_graph,
        enabled = true
    )
)