package com.nihhiu.prodexa.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.data.DashboardItem

class DashboardStorageAdapter(
    private val items: List<DashboardItem>,
    private val uriDisplayMap: Map<String, String>,
    private val onItemClick: (DashboardItem) -> Unit
) : RecyclerView.Adapter<DashboardStorageAdapter.ItemViewHolder>() {

    inner class ItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val itemName: TextView = itemView.findViewById(R.id.feature_name)
        val itemUri: TextView = itemView.findViewById(R.id.uri_saved)
        val itemIcon: ImageView = itemView.findViewById(R.id.feature_icon)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_settings_storage_dashboard, parent, false)
        return ItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
        val item = items[position]
        holder.itemName.setText(item.name)
        holder.itemIcon.setImageResource(item.icon ?: R.drawable.ic_settings_empty)

        holder.itemUri.text = uriDisplayMap[item.id] ?: ""

        holder.itemView.setOnClickListener {
            val pos = holder.bindingAdapterPosition
            if (pos != RecyclerView.NO_POSITION) {
                onItemClick(items[pos])
            }
        }
    }

    override fun getItemCount(): Int = items.size
}

