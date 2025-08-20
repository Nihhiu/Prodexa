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
import com.nihhiu.prodexa.repository.SettingsGeneralRepository
import com.nihhiu.prodexa.data.DashboardItem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class DashboardSettingsAdapter(
    private val items: List<DashboardItem>,
    private val repo: SettingsGeneralRepository,
    private val externalScope: CoroutineScope? = null
) : RecyclerView.Adapter<DashboardSettingsAdapter.DashboardSettingsViewHolder>() {

    class DashboardSettingsViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val icon: ImageView = itemView.findViewById(R.id.feature_icon)
        val name: TextView = itemView.findViewById(R.id.feature_name)
        val switch: SwitchMaterial = itemView.findViewById(R.id.feature_switch)
        var enabledJob: Job? = null
    }

    private val scope: CoroutineScope = externalScope ?: MainScope()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DashboardSettingsViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_settings_general_dashboard, parent, false)
        return DashboardSettingsViewHolder(view)
    }

    override fun onBindViewHolder(holder: DashboardSettingsViewHolder, position: Int) {
        val item = items[position]
        holder.name.setText(item.name)
        holder.icon.setImageResource(item.icon ?: R.drawable.ic_settings_empty)

        holder.enabledJob?.cancel()

        holder.switch.setOnCheckedChangeListener(null)
        holder.switch.isChecked = item.enabled

        holder.enabledJob = scope.launch {
            repo.isItemEnabledFlow(item.id)
                .collect { enabled ->
                    withContext(Dispatchers.Main) {
                        holder.switch.setOnCheckedChangeListener(null)
                        holder.switch.isChecked = enabled

                        holder.switch.setOnCheckedChangeListener { _, isChecked ->
                            scope.launch {
                                repo.saveItemEnabled(item.id, isChecked)
                            }
                        }
                    }
                }
        }

        holder.switch.setUseMaterialThemeColors(false)
        holder.switch.trackDrawable = ContextCompat.getDrawable(holder.itemView.context, R.drawable.switch_track_selector)
    }

    override fun onViewRecycled(holder: DashboardSettingsViewHolder) {
        holder.enabledJob?.cancel()
        holder.enabledJob = null
        super.onViewRecycled(holder)
    }

    override fun onDetachedFromRecyclerView(recyclerView: RecyclerView) {
        if (externalScope == null) {
            scope.coroutineContext[Job]?.cancel()
        }
        super.onDetachedFromRecyclerView(recyclerView)
    }

    override fun getItemCount() = items.size
}