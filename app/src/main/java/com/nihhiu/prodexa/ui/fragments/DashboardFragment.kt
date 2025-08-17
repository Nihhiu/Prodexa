package com.nihhiu.prodexa.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.adapter.DashboardGridAdapter
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.repository.DashboardSettingsRepository

class DashboardFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_dashboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val recyclerView = view.findViewById<RecyclerView>(R.id.recyclerView)

        val data: List<DashboardItem> = DashboardSettingsRepository(requireContext()).getEnabledItems()

        recyclerView.layoutManager = GridLayoutManager(requireContext(), 3)
        recyclerView.adapter = DashboardGridAdapter(data)
    }
}