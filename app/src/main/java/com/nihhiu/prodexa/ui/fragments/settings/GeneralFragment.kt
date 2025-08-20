package com.nihhiu.prodexa.ui.fragments.settings

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.adapter.DashboardSettingsAdapter
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.data.DashboardSortMode
import com.nihhiu.prodexa.repository.SettingsGeneralRepository
import kotlinx.coroutines.launch

class GeneralFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var sortSelected: LinearLayout

    private lateinit var repo: SettingsGeneralRepository

    override fun onAttach(context: Context) {
        super.onAttach(context)
        repo = SettingsGeneralRepository(context.applicationContext)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_settings_general, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        /**
        USERNAME
         **/
        usernameSetup(view)

        /**
        RECYCLER VIEW
         **/
        recyclerViewSetup(view)

        /**
        DASHBOARD SORT
         **/
        dashboardSortSetup(view)
    }

    /**
    SETUP
     **/
    private fun usernameSetup(view: View){
        val usernameTv = view.findViewById<TextView>(R.id.username)
        val usernameBt = view.findViewById<LinearLayout>(R.id.username_container)

        viewLifecycleOwner.lifecycleScope.launch {
            usernameTv.text = repo.getUsername()
        }

        usernameBt.setOnClickListener {
            showUsernameDialog(usernameTv)
        }
    }

    private fun recyclerViewSetup(view: View) {
        recyclerView = view.findViewById(R.id.feature_list)

        viewLifecycleOwner.lifecycleScope.launch {
            val data: List<DashboardItem> = repo.getAllItems() // usa repo

            recyclerView.layoutManager = LinearLayoutManager(requireContext())
            recyclerView.adapter = DashboardSettingsAdapter(data, repo, viewLifecycleOwner.lifecycleScope)
        }
    }

    private fun dashboardSortSetup(view: View){
        sortSelected = view.findViewById(R.id.dashboard_sort_button)

        updateSelectedDashboardSortText()

        sortSelected.setOnClickListener {
            showDashboardSortDialog()
        }
    }

    /**
    HELPERS
     **/
    private fun showUsernameDialog(usernameTv: TextView) {
        val context = requireContext()

        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_username, null)
        val textInputLayout = dialogView.findViewById<TextInputLayout>(R.id.username_text_input_layout)
        val input = dialogView.findViewById<TextInputEditText>(R.id.username_input_edit_text)
        
        viewLifecycleOwner.lifecycleScope.launch {
            val username = repo.getUsername()
            input.setText(username)
        }

        val dialog = AlertDialog.Builder(context)
            .setTitle(R.string.settings_configurations_general_username_title)
            .setView(dialogView)
            .setPositiveButton(R.string.confirm, null)
            .setNegativeButton(R.string.cancel, null)
            .create()

        dialog.show()

        setupValidationListener(dialog, input, textInputLayout, usernameTv)
    }

    private fun setupValidationListener(
        dialog: AlertDialog,
        input: TextInputEditText,
        textInputLayout: TextInputLayout,
        usernameTv: TextView
    ) {
        val context = dialog.context
        val positiveButton = dialog.getButton(AlertDialog.BUTTON_POSITIVE)

        positiveButton.setOnClickListener {
            val rawText = input.text.toString()
            val trimmedText = rawText.trim()
            textInputLayout.error = null

            when {
                trimmedText.isEmpty() -> {
                    textInputLayout.error = context.getString(R.string.settings_configurations_general_username_error_empty)
                }
                trimmedText.length < 2 -> {
                    textInputLayout.error = context.getString(R.string.settings_configurations_general_username_error_too_short)
                }
                trimmedText.length > 40 -> {
                    textInputLayout.error = context.getString(R.string.settings_configurations_general_username_error_too_long)
                }
                !trimmedText.matches(Regex("""^[^,"\n\r]{2,40}$""")) -> {
                    textInputLayout.error = context.getString(R.string.settings_configurations_general_username_error_invalid_chars)
                }
                else -> {
                    // CSV Validation
                    val safeText = trimmedText.replace(",", "").replace("\"", "")
                    usernameTv.text = safeText

                    viewLifecycleOwner.lifecycleScope.launch {
                        repo.saveUsername(safeText)
                    }

                    dialog.dismiss()
                }
            }
        }
    }

    private fun updateSelectedDashboardSortText(){
        viewLifecycleOwner.lifecycleScope.launch {
            val currentMode = repo.getSortMode()
            val selectedText = when(currentMode){
                DashboardSortMode.DEFAULT -> R.string.settings_configurations_general_dashboard_sort_default
                DashboardSortMode.NAME_ASCENDING -> R.string.settings_configurations_general_dashboard_sort_name_ascending
                DashboardSortMode.NAME_DESCENDING -> R.string.settings_configurations_general_dashboard_sort_name_descending
            }
            sortSelected.findViewById<TextView>(R.id.dashboard_sort_mode).text = getString(selectedText)
        }
    }

    private fun showDashboardSortDialog(){
        val options = listOf(
            DashboardSortMode.DEFAULT to R.string.settings_configurations_general_dashboard_sort_default,
            DashboardSortMode.NAME_ASCENDING to R.string.settings_configurations_general_dashboard_sort_name_ascending,
            DashboardSortMode.NAME_DESCENDING to R.string.settings_configurations_general_dashboard_sort_name_descending
        )

        val dialogItems = options.map { getString(it.second) }.toTypedArray()

        AlertDialog.Builder(requireContext())
            .setTitle(R.string.settings_configurations_general_dashboard_sort_title)
            .setItems(dialogItems) { _, which ->
                val selectedMode = options[which].first
                viewLifecycleOwner.lifecycleScope.launch {
                    repo.saveSortMode(selectedMode)
                    updateSelectedDashboardSortText()
                }
            }.show()
    }
}
