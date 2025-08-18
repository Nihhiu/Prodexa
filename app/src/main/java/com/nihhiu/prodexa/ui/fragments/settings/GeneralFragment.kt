package com.nihhiu.prodexa.ui.fragments.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.adapter.DashboardSettingsAdapter
import com.nihhiu.prodexa.adapter.SettingsAdapter
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.data.SettingsItems
import com.nihhiu.prodexa.repository.DashboardSettingsRepository

class GeneralFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_settings_general, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.feature_list)
        val data: List<DashboardItem> = DashboardSettingsRepository(requireContext()).getAllItems()

        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = DashboardSettingsAdapter(data)
    }
}