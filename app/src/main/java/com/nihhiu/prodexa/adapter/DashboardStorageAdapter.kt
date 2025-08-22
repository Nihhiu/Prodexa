package com.nihhiu.prodexa.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.storage.StorageRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class DashboardStorageAdapter(
    private val items: List<DashboardItem>,
    private val uriDisplayMap: Map<String, String>,
    private val onItemClick: (DashboardItem) -> Unit
) : RecyclerView.Adapter<DashboardStorageAdapter.ItemViewHolder>() {

    inner class ItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val itemName: TextView = itemView.findViewById(R.id.feature_name)
        val itemUri: TextView = itemView.findViewById(R.id.uri_saved)
        val itemIcon: ImageView = itemView.findViewById(R.id.feature_icon)
        val editButton: FrameLayout = itemView.findViewById(R.id.ic_edit_path)
        val removeButton: FrameLayout = itemView.findViewById(R.id.ic_remove_path)
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

        holder.editButton.setOnClickListener {
            val pos = holder.bindingAdapterPosition
            if (pos != RecyclerView.NO_POSITION) {
                onItemClick(items[pos])
            }
        }

        holder.removeButton.setOnClickListener {
            val pos = holder.bindingAdapterPosition
            if (pos != RecyclerView.NO_POSITION) {
                val featureId = items[pos].id
                CoroutineScope(Dispatchers.IO).launch {
                    StorageRepository.clearPersistedUriForFeature(holder.itemView.context, featureId)

                    withContext(Dispatchers.Main) {
                        holder.itemUri.setText(R.string.settings_configurations_storage_dashboard_error_file_not_found)
                    }
                }
            }
        }
    }

    override fun getItemCount(): Int = items.size
}

