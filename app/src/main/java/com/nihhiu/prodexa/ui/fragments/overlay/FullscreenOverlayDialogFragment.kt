package com.nihhiu.prodexa.ui.fragments.overlay

import android.content.DialogInterface
import android.os.Bundle
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import com.nihhiu.prodexa.MainActivity
import com.nihhiu.prodexa.R
import android.app.Dialog
import android.graphics.drawable.ColorDrawable
import android.view.*
import androidx.activity.OnBackPressedCallback
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.NavHostFragment
import com.google.android.material.appbar.MaterialToolbar

class FullscreenOverlayDialogFragment : DialogFragment(R.layout.fragment_fullscreen_overlay) {

    companion object {
        private const val ARG_NAV_GRAPH = "arg_nav_graph"
        private const val ARG_FRAGMENT_CLASS = "arg_fragment_class"
        private const val ARG_FRAGMENT_ARGS = "arg_fragment_args"
        private const val ARG_TITLE = "arg_title"

        /** factory for nav graph mode */
        fun newForNavGraph(navGraphId: Int, title: String? = null): FullscreenOverlayDialogFragment {
            val f = FullscreenOverlayDialogFragment()
            f.arguments = Bundle().apply {
                putInt(ARG_NAV_GRAPH, navGraphId)
                title?.let { putString(ARG_TITLE, it) }
            }
            return f
        }

        /** factory for single fragment mode */
        fun newForFragment(fragmentClassName: String, fragmentArgs: Bundle? = null, title: String? = null): FullscreenOverlayDialogFragment {
            val f = FullscreenOverlayDialogFragment()
            f.arguments = Bundle().apply {
                putString(ARG_FRAGMENT_CLASS, fragmentClassName)
                fragmentArgs?.let { putBundle(ARG_FRAGMENT_ARGS, it) }
                title?.let { putString(ARG_TITLE, it) }
            }
            return f
        }
    }

    private var navHostFragment: NavHostFragment? = null
    private var childFragment: Fragment? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setStyle(STYLE_NORMAL, R.style.Theme_Prodexa_FullScreenDialog)

        // Intercept back pressed so we can try to navigate the inner stack first
        requireActivity().onBackPressedDispatcher.addCallback(this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (!handleInnerBack()) {
                        // no inner back -> dismiss
                        dismiss()
                    }
                }
            })
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        // Use default dialog but we'll make it full-screen in onStart
        return super.onCreateDialog(savedInstanceState)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val toolbar = view.findViewById<MaterialToolbar>(R.id.overlay_toolbar)
        arguments?.getString(ARG_TITLE)?.let { toolbar.title = it }

        toolbar.setNavigationOnClickListener {
            if (!handleInnerBack()) dismiss()
        }

        // if already added (e.g. after rotation), don't add again
        if (childFragmentManager.findFragmentById(R.id.overlay_container) != null) return

        // Prefer navGraph mode if provided
        val navGraphId = arguments?.getInt(ARG_NAV_GRAPH, 0) ?: 0
        if (navGraphId != 0) {
            val nh = NavHostFragment.create(navGraphId, arguments?.getBundle(ARG_FRAGMENT_ARGS))
            childFragmentManager.beginTransaction()
                .replace(R.id.overlay_container, nh, "overlay_navhost")
                .setPrimaryNavigationFragment(nh)
                .commit()
            navHostFragment = nh
            return
        }

        // else fallback to fragment class mode
        val fragmentClassName = arguments?.getString(ARG_FRAGMENT_CLASS)
        if (!fragmentClassName.isNullOrEmpty()) {
            val frag = childFragmentManager.fragmentFactory.instantiate(requireContext().classLoader, fragmentClassName)
            frag.arguments = arguments?.getBundle(ARG_FRAGMENT_ARGS)
            childFragmentManager.beginTransaction()
                .replace(R.id.overlay_container, frag, "overlay_inner")
                .commit()
            childFragment = frag
        } else {
            // Nothing provided: optional fallback UI or dismiss
            dismissAllowingStateLoss()
        }
    }

    override fun onStart() {
        super.onStart()
        // Make dialog truly fullscreen
        dialog?.window?.apply {
            setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            setBackgroundDrawable(ColorDrawable(android.graphics.Color.TRANSPARENT))
            // optionally adjust status bar nav bar behavior here
        }
    }

    override fun onDismiss(dialog: DialogInterface) {
        super.onDismiss(dialog)
    }

    /**
     * Try to handle back inside the overlay:
     * - If it's a nested NavHostFragment: try navController.navigateUp()
     * - Else, if childFragmentManager can pop back stack, do that.
     * Return true if handled (i.e. consumed the back press), false otherwise.
     */
    private fun handleInnerBack(): Boolean {
        // first nested NavHost
        navHostFragment?.let { nh ->
            val navController = nh.navController
            if (navController.previousBackStackEntry != null) {
                return navController.popBackStack()
            }
            return false
        }

        // then child fragment manager's back stack
        if (childFragmentManager.backStackEntryCount > 0) {
            childFragmentManager.popBackStack()
            return true
        }

        // if the child fragment itself implements a custom back handling interface, check it
        val active = childFragmentManager.findFragmentById(R.id.overlay_container)
        if (active is OnOverlayBackPressed) {
            if ((active as OnOverlayBackPressed).onBackPressed()) return true
        }

        return false
    }

    interface OnOverlayBackPressed {
        /**
         * Return true if the back was handled by the child fragment.
         */
        fun onBackPressed(): Boolean
    }
}