import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile, Paths } from 'expo-file-system';
import {
  type StorageFeature,
  SHOPPING_LIST_FILENAME,
  getCloudFileUriForFeature,
  setCloudFileUriForFeature,
  setCloudFileNameForFeature,
  clearCloudFileUriForFeature,
  clearCloudFileNameForFeature,
  getStorageModeForFeature,
  getFeatureFile,
} from '../config/storage';

// ─── Cloud File Picker ─────────────────────────────────────────────────

/**
 * Open the system document picker to select a CSV file.
 * On Android, this shows cloud providers (Google Drive, OneDrive, etc.)
 * via the Storage Access Framework.
 *
 * Uses `copyToCacheDirectory: false` to get the original content:// URI
 * so we can write back to the same file later.
 */
export const pickCloudFile = async (): Promise<{ uri: string; name: string } | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'text/plain', 'application/csv'],
      copyToCacheDirectory: false,
    });

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    return { uri: asset.uri, name: asset.name };
  } catch (error) {
    console.warn('[cloudSync] Failed to pick cloud file:', error);
    return null;
  }
};

// ─── Cloud File Read/Write ─────────────────────────────────────────────

/**
 * Read content from a cloud file URI (content:// or file://).
 * Uses the expo-file-system File class which handles SAF content URIs.
 */
export const readFromCloudUri = async (uri: string): Promise<string> => {
  const cloudFile = new ExpoFile(uri);
  return cloudFile.text();
};

/**
 * Write content to a cloud file URI (content:// or file://).
 * Uses the expo-file-system File class which handles SAF content URIs.
 */
export const writeToCloudUri = (uri: string, content: string): void => {
  const cloudFile = new ExpoFile(uri);
  cloudFile.write(content);
};

// ─── Sync Operations ───────────────────────────────────────────────────

/**
 * Sync from cloud to local cache.
 * Downloads the cloud file content and writes it to the local cache file.
 *
 * @returns `true` if sync was performed, `false` if skipped (not in cloud mode).
 */
export const syncFromCloud = async (feature: StorageFeature): Promise<boolean> => {
  try {
    const mode = await getStorageModeForFeature(feature);
    if (mode !== 'cloudFile') return false;

    const cloudUri = await getCloudFileUriForFeature(feature);
    if (!cloudUri) return false;

    const cloudContent = await readFromCloudUri(cloudUri);
    const { file } = await getFeatureFile(feature);

    // Write cloud content to local cache
    if (!file.exists) {
      file.create();
    }
    file.write(cloudContent);

    return true;
  } catch (error) {
    console.warn('[cloudSync] Failed to sync from cloud:', error);
    throw error;
  }
};

/**
 * Sync from local cache to cloud.
 * Reads the local cache file and writes its content to the cloud file.
 *
 * @returns `true` if sync was performed, `false` if skipped.
 */
export const syncToCloud = async (feature: StorageFeature): Promise<boolean> => {
  try {
    const mode = await getStorageModeForFeature(feature);
    if (mode !== 'cloudFile') return false;

    const cloudUri = await getCloudFileUriForFeature(feature);
    if (!cloudUri) return false;

    const { file } = await getFeatureFile(feature);
    if (!file.exists) return false;

    const localContent = await file.text();
    writeToCloudUri(cloudUri, localContent);

    return true;
  } catch (error) {
    console.warn('[cloudSync] Failed to sync to cloud:', error);
    throw error;
  }
};

// ─── Setup & Teardown ──────────────────────────────────────────────────

/**
 * Pick a cloud file and set it up for a feature.
 * Downloads the initial content from the cloud file to the local cache.
 */
export const setupCloudFile = async (
  feature: StorageFeature,
): Promise<{ success: boolean; fileName?: string; error?: string }> => {
  const picked = await pickCloudFile();
  if (!picked) return { success: false };

  try {
    // Store cloud file URI and display name
    await setCloudFileUriForFeature(feature, picked.uri);
    await setCloudFileNameForFeature(feature, picked.name);

    // Download cloud content to local cache (always in app document storage)
    const cloudContent = await readFromCloudUri(picked.uri);
    const cacheFileName = feature === 'shoppingList' ? SHOPPING_LIST_FILENAME : `${feature}.csv`;
    const cacheFile = new ExpoFile(Paths.document, cacheFileName);

    if (!cacheFile.exists) {
      cacheFile.create();
    }
    cacheFile.write(cloudContent);

    return { success: true, fileName: picked.name };
  } catch (error) {
    // Clean up on failure
    await clearCloudFileUriForFeature(feature);
    await clearCloudFileNameForFeature(feature);

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[cloudSync] Failed to setup cloud file:', error);
    return { success: false, error: message };
  }
};

/**
 * Disconnect a cloud file from a feature.
 * Clears the stored cloud URI and name but keeps local cached data.
 */
export const disconnectCloudFile = async (feature: StorageFeature): Promise<void> => {
  await clearCloudFileUriForFeature(feature);
  await clearCloudFileNameForFeature(feature);
};
