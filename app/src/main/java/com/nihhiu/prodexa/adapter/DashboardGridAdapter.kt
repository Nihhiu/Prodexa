package com.nihhiu.prodexa.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.ui.fragments.overlay.FullscreenOverlayDialogFragment

class DashboardGridAdapter(
    private val items: List<DashboardItem>,
    private val parentFragment: Fragment? = null
) : RecyclerView.Adapter<DashboardGridAdapter.DashboardViewHolder>() {

    class DashboardViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val Name: TextView = itemView.findViewById(R.id.item_name)
        val Icon: ImageView = itemView.findViewById(R.id.item_icon)
        val Button: View = itemView.findViewById(R.id.item_button)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DashboardViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_dashboard, parent, false)
        return DashboardViewHolder(view)
    }

    override fun onBindViewHolder(holder: DashboardViewHolder, position: Int) {
        val item = items[position]
        holder.Name.setText(item.name)
        holder.Icon.setImageResource(item.icon ?: R.drawable.ic_settings_empty)

        holder.Button.setOnClickListener {
            val pos = holder.bindingAdapterPosition
            if (pos == RecyclerView.NO_POSITION) return@setOnClickListener

            val clicked = items[pos]

            when {
                clicked.navActionId != null -> {
                    try {
                        val overlay = FullscreenOverlayDialogFragment.newForNavGraph(
                            navGraphId = clicked.navActionId,
                            title = holder.Name.text.toString()
                        )

                        val fm = parentFragment?.parentFragmentManager
                            ?: (holder.itemView.context as? FragmentActivity)?.supportFragmentManager

                        if (fm != null) {
                            overlay.show(fm, "fullscreen_overlay")
                        } else {
                            throw IllegalArgumentException("FragmentManager not available.")
                        }
                    } catch (e: IllegalArgumentException) {
                        Toast.makeText(
                            holder.itemView.context,
                            "Navigation action not found.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }

                else -> {
                    Toast.makeText(
                        holder.itemView.context,
                        "Feature not implemented yet. :(",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    override fun getItemCount(): Int = items.size
}

