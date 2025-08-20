package com.nihhiu.prodexa.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.adapter.DashboardGridAdapter
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.repository.SettingsGeneralRepository
import kotlinx.coroutines.launch

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
        recyclerView.layoutManager = GridLayoutManager(requireContext(), 3)

        val repo = SettingsGeneralRepository(requireContext())

        // carregar assincronamente e então setar o adapter (ou atualizar um adapter existente)
        viewLifecycleOwner.lifecycleScope.launch {
            val data: List<DashboardItem> = repo.getEnabledItems() // suspend
            recyclerView.adapter = DashboardGridAdapter(data)
        }
    }

}