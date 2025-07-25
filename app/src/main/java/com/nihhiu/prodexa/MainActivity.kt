package com.nihhiu.prodexa

import android.os.Bundle
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.nihhiu.prodexa.ui.theme.ProdexaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottom_navigation)
        val container = findViewById<FrameLayout>(R.id.container)

        // Personalização adicional via código
        bottomNav.itemIconSize = 34
        bottomNav.itemPaddingTop = 8

        // Listener de navegação
        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.settings -> {
                    // Carregar fragmento settings
                    true
                }
                R.id.home -> {
                    // Carregar fragmento home
                    true
                }
                R.id.dashboard -> {
                    // Carregar fragmento perfil
                    true
                }
                else -> false
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    ProdexaTheme {
        Greeting("Android")
    }
}