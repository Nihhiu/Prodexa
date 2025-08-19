package com.nihhiu.prodexa.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.switchmaterial.SwitchMaterial
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.repository.DashboardSettingsRepository
import com.nihhiu.prodexa.data.DashboardItem

class DashboardSettingsAdapter(
    private val items: List<DashboardItem>,
) : RecyclerView.Adapter<DashboardSettingsAdapter.DashboardSettingsViewHolder>() {

    class DashboardSettingsViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val icon: ImageView = itemView.findViewById(R.id.feature_icon)
        val name: TextView = itemView.findViewById(R.id.feature_name)
        val switch: SwitchMaterial = itemView.findViewById(R.id.feature_switch)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DashboardSettingsViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_settings_general_dashboard, parent, false)
        return DashboardSettingsViewHolder(view)
    }

    override fun onBindViewHolder(holder: DashboardSettingsViewHolder, position: Int) {
        val item = items[position]
        holder.name.setText(item.name)
        holder.icon.setImageResource(item.icon ?: R.drawable.ic_settings_empty)

        val repo = DashboardSettingsRepository(holder.itemView.context)

        holder.switch.setOnCheckedChangeListener(null)
        holder.switch.isChecked = repo.isItemEnabled(item.id)

        holder.switch.setOnCheckedChangeListener { _, isChecked ->
            repo.saveItemEnabled(item.id, isChecked)
        }

        holder.switch.setUseMaterialThemeColors(false)
        holder.switch.trackDrawable = ContextCompat.getDrawable(holder.itemView.context, R.drawable.switch_track_selector)
    }

    override fun getItemCount() = items.size
}