package com.nihhiu.prodexa.ui.fragments.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.adapter.DashboardSettingsAdapter
import com.nihhiu.prodexa.adapter.SettingsAdapter
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.data.DashboardSortMode
import com.nihhiu.prodexa.data.SettingsItems
import com.nihhiu.prodexa.repository.DashboardSettingsRepository

class GeneralFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var sortSelected: LinearLayout

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
    private fun recyclerViewSetup(view: View) {
        recyclerView = view.findViewById(R.id.feature_list)
        val data: List<DashboardItem> = DashboardSettingsRepository(requireContext()).getAllItems()

        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = DashboardSettingsAdapter(data)
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
    private fun updateSelectedDashboardSortText(){
        val currentMode = DashboardSettingsRepository(requireContext()).getSortMode()
        val selectedText = when(currentMode){
            DashboardSortMode.DEFAULT -> R.string.settings_configurations_general_dashboard_sort_default
            DashboardSortMode.NAME_ASCENDING -> R.string.settings_configurations_general_dashboard_sort_name_ascending
            DashboardSortMode.NAME_DESCENDING -> R.string.settings_configurations_general_dashboard_sort_name_descending
        }
        sortSelected.findViewById<TextView>(R.id.dashboard_sort_mode).text = getString(selectedText)
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
                DashboardSettingsRepository(requireContext()).saveSortMode(selectedMode)
                updateSelectedDashboardSortText()
            }.show()
    }
}