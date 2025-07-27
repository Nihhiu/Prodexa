package com.nihhiu.prodexa

import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.NavOptions
import androidx.navigation.fragment.NavHostFragment

class MainActivity : AppCompatActivity() {
    private lateinit var navController: NavController

    private val destinationMap = mapOf(
        R.id.nav_home to R.id.navigation_home,
        R.id.nav_dashboard to R.id.navigation_dashboard,
        R.id.nav_settings to R.id.navigation_settings
    )

    private val iconEmptyMap = mapOf(
        R.id.nav_home to R.drawable.ic_house_empty,
        R.id.nav_dashboard to R.drawable.ic_dashboard_empty,
        R.id.nav_settings to R.drawable.ic_settings_empty
    )

    private val iconFullMap = mapOf(
        R.id.nav_home to R.drawable.ic_house_filled,
        R.id.nav_dashboard to R.drawable.ic_dashboard_filled,
        R.id.nav_settings to R.drawable.ic_settings_filled
    )

    private val fadeOptions = NavOptions.Builder()
        .setEnterAnim(R.anim.fade_in)
        .setExitAnim(R.anim.fade_out)
        .setPopEnterAnim(R.anim.fade_in)
        .setPopExitAnim(R.anim.fade_out)
        .build()

    private val destinationToViewId = destinationMap.entries
        .associate { (viewId, destId) -> destId to viewId }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val navHost = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHost.navController

        destinationMap.keys.forEach { viewId ->
            findViewById<ImageView>(viewId).setOnClickListener {
                val target = destinationMap[viewId]!!
                if (navController.currentDestination?.id != target) {
                    navController.navigate(target, null, fadeOptions)
                }

                updateIcons(viewId)
            }
        }

        navController.addOnDestinationChangedListener { _, destination, _ ->
            val viewId = destinationToViewId[destination.id] ?: R.id.nav_home
            updateIcons(viewId)
        }

        updateIcons(R.id.nav_home)
    }

    //TODO: Add transição de telas
    //TODO: Add ripple effect
    //TODO: temas

    private fun updateIcons(selectedViewId: Int) {
        iconEmptyMap.keys.forEach { viewId ->
            val iv = findViewById<ImageView>(viewId)
            val iconRes = if (viewId == selectedViewId)
                iconFullMap[viewId] else iconEmptyMap[viewId]
            iv.setImageResource(iconRes!!)
        }
    }
}
