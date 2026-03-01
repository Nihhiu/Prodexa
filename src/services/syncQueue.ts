import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import { syncToCloud } from './cloudSync';
import { type StorageFeature } from '../config/storage';

// ─── Pending Sync Queue ────────────────────────────────────────────────
// Persists features that failed to sync to AsyncStorage so they survive
// app restarts. When connectivity is restored (or the app returns to the
// foreground) the queue is automatically processed.
// ────────────────────────────────────────────────────────────────────────

const PENDING_SYNC_KEY = '@prodexa/pending_cloud_sync';

// In-memory mirror kept in sync with AsyncStorage for fast reads.
let pendingFeatures: Set<StorageFeature> = new Set();
let isProcessing = false;
let listenerInitialised = false;

// ─── AsyncStorage helpers ──────────────────────────────────────────────

const loadPendingFromStorage = async (): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StorageFeature[];
      pendingFeatures = new Set(parsed);
    }
  } catch {
    // Storage read failed — start with empty set
    pendingFeatures = new Set();
  }
};

const persistPending = async (): Promise<void> => {
  try {
    const arr = Array.from(pendingFeatures);
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(arr));
  } catch {
    // Best-effort persistence
  }
};

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Mark a feature as needing cloud sync.
 * Called when `syncToCloud` fails (e.g. device is offline).
 */
export const enqueuePendingSync = async (feature: StorageFeature): Promise<void> => {
  pendingFeatures.add(feature);
  await persistPending();
  console.info(`[syncQueue] Enqueued pending sync for "${feature}"`);
};

/**
 * Check whether a given feature has a pending sync.
 */
export const hasPendingSync = (feature: StorageFeature): boolean => {
  return pendingFeatures.has(feature);
};

/**
 * Try to process all pending syncs.
 * Silently skips features that still fail (they remain in the queue).
 */
export const processPendingSync = async (): Promise<void> => {
  if (isProcessing || pendingFeatures.size === 0) return;

  isProcessing = true;

  const featuresToProcess = Array.from(pendingFeatures);

  for (const feature of featuresToProcess) {
    try {
      const synced = await syncToCloud(feature);
      if (synced) {
        pendingFeatures.delete(feature);
        console.info(`[syncQueue] Successfully synced pending "${feature}"`);
      }
    } catch {
      // Still offline or sync still failing — keep in queue
      console.warn(`[syncQueue] Pending sync for "${feature}" still failing, will retry later`);
    }
  }

  await persistPending();
  isProcessing = false;
};

// ─── Listeners ─────────────────────────────────────────────────────────

/**
 * Initialise network and app-state listeners that automatically
 * process the pending sync queue when connectivity is restored or
 * the user returns to the app.
 *
 * Safe to call multiple times — only the first call registers listeners.
 */
export const initSyncQueueListeners = async (): Promise<void> => {
  if (listenerInitialised) return;
  listenerInitialised = true;

  // Load any pending syncs persisted from a previous session
  await loadPendingFromStorage();

  // 1. Network connectivity change
  NetInfo.addEventListener((state: NetInfoState) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      void processPendingSync();
    }
  });

  // 2. App returns to foreground
  const handleAppState = (nextState: AppStateStatus) => {
    if (nextState === 'active') {
      void processPendingSync();
    }
  };

  AppState.addEventListener('change', handleAppState);

  // 3. Process anything already pending right now
  void processPendingSync();
};
