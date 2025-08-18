package com.nihhiu.prodexa.adapter

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.data.MenuItem
import androidx.core.net.toUri
import androidx.navigation.findNavController
import com.nihhiu.prodexa.R
import androidx.navigation.fragment.findNavController
import com.nihhiu.prodexa.ui.fragments.overlay.FullscreenOverlayDialogFragment

class CategoryItemsAdapter (
    private val items: List<MenuItem>,
    private val parentFragment: Fragment
) : RecyclerView.Adapter<CategoryItemsAdapter.ItemViewHolder>() {

    inner class ItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val itemName: TextView = itemView.findViewById(R.id.item_name)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_menu, parent, false)
        return ItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
        val item = items[position]
        holder.itemName.setText(item.name)

        holder.itemView.setOnClickListener {
            val pos = holder.bindingAdapterPosition
            if (pos == RecyclerView.NO_POSITION) return@setOnClickListener

            val clicked = items[pos]

            when {
                clicked.link != null -> {
                    try {
                        val uri = Uri.parse(clicked.link)
                        val intent = Intent(Intent.ACTION_VIEW, uri)
                        holder.itemName.context.startActivity(intent)
                    } catch (e: ActivityNotFoundException) {
                        Toast.makeText(
                            holder.itemName.context,
                            "No application can open this link.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }

                clicked.navActionId != null -> {
                    try {
                        val overlay = FullscreenOverlayDialogFragment.newForNavGraph(
                            navGraphId = clicked.navActionId,
                            title = holder.itemName.text.toString()
                        )
                        overlay.show(parentFragment.parentFragmentManager, "fullscreen_overlay")

                    } catch (e: IllegalArgumentException) {
                        Toast.makeText(
                            holder.itemName.context,
                            "Navigation action not found.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }

                else -> {
                    Toast.makeText(
                        holder.itemView.context,
                        "Functionality not implemented yet. :(",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    override fun getItemCount(): Int = items.size
}