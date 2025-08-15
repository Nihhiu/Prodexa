package com.nihhiu.prodexa.data

import com.nihhiu.prodexa.R

data class MenuItem (
    val name: Int,
    val navActionId: Int? = null,
    val link: String? = null
)

data class SettingsItems (
    val title: Int,
    val items: List<MenuItem>
) {
    companion object {
        fun createList(): List<SettingsItems> {
            return listOf(
                SettingsItems(
                    title = R.string.settings_configurations,
                    items = listOf(
                        MenuItem(
                            name = R.string.settings_configurations_general,
                            navActionId = R.navigation.settings_general_nav_graph
                        ),
                        MenuItem(
                            name = R.string.settings_configurations_appearance,
                            navActionId = R.navigation.settings_appearance_nav_graph
                        ),
                        MenuItem(
                            name = R.string.settings_configurations_notifications,
                            navActionId = R.navigation.settings_notification_nav_graph
                        )
                    )
                ),
                SettingsItems(
                    title = R.string.settings_support,
                    items = listOf(
                        MenuItem(
                            name = R.string.settings_support_watchAds,
                            navActionId = null
                        ),
                        MenuItem(
                            name = R.string.settings_support_listenToMusic,
                            link = "https://www.youtube.com/Nihhiu"
                        ),
                        MenuItem(
                            name = R.string.settings_support_otherLinks,
                            link = "https://linktr.ee/nihhiu"
                        )
                    )
                ),
                SettingsItems(
                    title = R.string.settings_privacy,
                    items = listOf(
                        MenuItem(
                            name = R.string.settings_privacy_privacyPolicy,
                            link = "https://github.com/Nihhiu/Prodexa/blob/main/app/src/main/assets/privacy%20policy.md"
                        ),
                        MenuItem(
                            name = R.string.settings_privacy_storage,
                            navActionId = R.navigation.settings_storage_nav_graph
                        )
                    )
                )
            )
        }
    }
}