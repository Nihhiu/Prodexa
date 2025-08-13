package com.nihhiu.prodexa.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.adapter.SettingsAdapter
import com.nihhiu.prodexa.data.SettingsItems

class SettingsFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_settings, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        recyclerView = view.findViewById(R.id.category_list)
        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        val categories = SettingsItems.createList()

        recyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = SettingsAdapter(categories, this@SettingsFragment)
        }
    }
}