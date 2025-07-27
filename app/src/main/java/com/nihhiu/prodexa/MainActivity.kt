package com.nihhiu.prodexa

import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
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

    //FIXME: quando uso "back" não altera o icon selecionado
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val navHostFragment = supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        destinationMap.keys.forEach { viewId ->
            findViewById<ImageView>(viewId).apply {
                setOnClickListener {
                    val targetDestination = destinationMap[viewId]!!
                    if (navController.currentDestination?.id != targetDestination) {
                        navController.navigate(targetDestination)
                    }
                    updateIcons(viewId)
                }
            }
        }

        updateIcons(R.id.nav_home)
    }

    //TODO: Add melhor sombra
    //TODO: Add transição de telas
    //TODO: Add ripple effect
    //TODO: temas

    private fun updateIcons(selectedViewId: Int) {
        iconEmptyMap.keys.forEach { viewId ->
            val imageView = findViewById<ImageView>(viewId)
            val iconRes = if (viewId == selectedViewId) iconFullMap[viewId] else iconEmptyMap[viewId]
            imageView.setImageResource(iconRes!!)
        }
    }
}
