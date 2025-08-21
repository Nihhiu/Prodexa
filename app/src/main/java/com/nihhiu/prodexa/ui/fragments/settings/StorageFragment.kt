package com.nihhiu.prodexa.ui.fragments.settings

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.nihhiu.prodexa.R
import com.nihhiu.prodexa.adapter.DashboardStorageAdapter
import com.nihhiu.prodexa.data.DashboardItem
import com.nihhiu.prodexa.repository.SettingsGeneralRepository
import com.nihhiu.prodexa.storage.StorageRepository
import kotlinx.coroutines.launch

class StorageFragment : Fragment() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var repoSettings: SettingsGeneralRepository

    private var pendingItem: DashboardItem? = null
    private lateinit var openDocLauncher: ActivityResultLauncher<Array<String>>

    private lateinit var adapter: DashboardStorageAdapter
    private val uriDisplayMap = mutableMapOf<String, String>()
    private var itemsList: List<DashboardItem> = emptyList()

    override fun onAttach(context: Context) {
        super.onAttach(context)
        repoSettings = SettingsGeneralRepository(context.applicationContext)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_settings_storage, container, false)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        openDocLauncher = registerForActivityResult(
            ActivityResultContracts.OpenDocument()
        ) { uri ->
            val item = pendingItem ?: return@registerForActivityResult
            pendingItem = null

            if (uri != null) {
                try {
                    val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                    requireContext().contentResolver.takePersistableUriPermission(uri, flags)
                } catch (e: Exception) {
                    Log.e("StorageFragment", "Persist permission failed", e)
                }

                viewLifecycleOwner.lifecycleScope.launch {
                    val mimeType = requireContext().contentResolver.getType(uri)
                    val displayName = StorageRepository.getDisplayName(requireContext(), uri, "No file imported")

                    val isCsv = displayName.endsWith(".csv", ignoreCase = true) ||
                            (mimeType?.contains("csv") == true) ||
                            mimeType == "text/plain"

                    if (!isCsv) {
                        Log.e("StorageFragment", "isn't a CSV")
                        return@launch
                    }

                    StorageRepository.persistUriForFeature(requireContext(), item.id, uri)

                    uriDisplayMap[item.id] = displayName
                    val idx = itemsList.indexOfFirst { it.id == item.id }
                    if (idx >= 0) adapter.notifyItemChanged(idx)
                }
            }
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.feature_list)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())

        viewLifecycleOwner.lifecycleScope.launch {
            itemsList = repoSettings.getAllItems()

            for (item in itemsList) {
                val persisted = StorageRepository.getPersistedUriForFeature(requireContext(), item.id)
                val displayName = if (persisted != null) {
                    StorageRepository.getDisplayName(requireContext(), persisted, "No file imported")
                } else {
                    "No file imported"
                }
                uriDisplayMap[item.id] = displayName
            }

            adapter = DashboardStorageAdapter(
                itemsList,
                uriDisplayMap,
                onItemClick = { clicked ->
                    pendingItem = clicked
                    openDocLauncher.launch(arrayOf("text/*"))
                }
            )

            recyclerView.adapter = adapter
        }
    }
}
