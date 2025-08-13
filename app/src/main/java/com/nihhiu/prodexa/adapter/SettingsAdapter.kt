package com.nihhiu.prodexa.adapter

import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.data.SettingsItems
import android.view.LayoutInflater
import androidx.recyclerview.widget.LinearLayoutManager
import com.nihhiu.prodexa.R

class SettingsAdapter (
    private val categories: List<SettingsItems>,
    private val parentFragment: Fragment
) : RecyclerView.Adapter<SettingsAdapter.CategoryViewHolder>() {

    inner class CategoryViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val Title: TextView = itemView.findViewById(R.id.title)
        val Items: RecyclerView = itemView.findViewById(R.id.items)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoryViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_category, parent, false)
        return CategoryViewHolder(view)
    }

    override fun onBindViewHolder(holder: CategoryViewHolder, position: Int) {
        val category = categories[position]

        holder.Title.setText(category.title)

        val itemsAdapter = CategoryItemsAdapter(category.items, parentFragment)
        holder.Items.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = itemsAdapter
            isNestedScrollingEnabled = false
        }
    }

    override fun getItemCount(): Int = categories.size

}