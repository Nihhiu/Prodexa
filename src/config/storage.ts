import { Paths, File, Directory } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Feature Storage Types ─────────────────────────────────────────────
export type StorageFeature = 'shoppingList';

const FEATURE_STORAGE_PATHS_KEY = '@prodexa/feature_storage_paths';

const FEATURE_FILE_NAMES: Record<StorageFeature, string> = {
  shoppingList: 'shopping_list.csv',
};

// ─── Feature Storage Persistence ───────────────────────────────────────

const getFeatureStoragePaths = async (): Promise<Partial<Record<StorageFeature, string>>> => {
  try {
    const raw = await AsyncStorage.getItem(FEATURE_STORAGE_PATHS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    return parsed as Partial<Record<StorageFeature, string>>;
  } catch {
    return {};
  }
};

const setFeatureStoragePaths = async (
  paths: Partial<Record<StorageFeature, string>>,
): Promise<void> => {
  await AsyncStorage.setItem(FEATURE_STORAGE_PATHS_KEY, JSON.stringify(paths));
};

/**
 * Get the configured storage path for a feature.
 */
export const getStoragePathForFeature = async (
  feature: StorageFeature,
): Promise<string | null> => {
  const paths = await getFeatureStoragePaths();
  return paths[feature] ?? null;
};

/**
 * Set storage path for a feature.
 */
export const setStoragePathForFeature = async (
  feature: StorageFeature,
  path: string,
): Promise<void> => {
  const paths = await getFeatureStoragePaths();
  paths[feature] = path;
  await setFeatureStoragePaths(paths);
};

/**
 * Clear storage path for a feature.
 */
export const clearStoragePathForFeature = async (feature: StorageFeature): Promise<void> => {
  const paths = await getFeatureStoragePaths();
  delete paths[feature];
  await setFeatureStoragePaths(paths);
};

// ─── File Configuration ────────────────────────────────────────────────

/**
 * The default base URI for app data files.
 */
export const getDefaultBaseUri = (): string => Paths.document.uri;

export const SHOPPING_LIST_FILENAME = FEATURE_FILE_NAMES.shoppingList;

export interface FeatureFileResult {
  file: File;
  directory: Directory;
  isSAF: boolean;
}

/**
 * Build a file reference for a feature using feature-specific path,
 * falling back to app local document storage.
 *
 * For SAF (content://) directories, lists directory contents to find
 * the existing file by name so that writes overwrite it instead of
 * creating duplicates with a "(1)" suffix.
 */
export const getFeatureFile = async (feature: StorageFeature): Promise<FeatureFileResult> => {
  const featurePath = await getStoragePathForFeature(feature);
  const fileName = FEATURE_FILE_NAMES[feature];

  if (!featurePath) {
    return {
      file: new File(Paths.document, fileName),
      directory: Paths.document,
      isSAF: false,
    };
  }

  const featureDirectory = new Directory(featurePath);
  const isSAF = featurePath.startsWith('content://');

  // For SAF content URIs, `new File(directory, name)` builds a URI that
  // may not match the real document URI the system created, so
  // `file.exists` returns false and `createFile` generates duplicates.
  // Listing the directory and matching by name gives us the actual File.
  if (isSAF) {
    try {
      const entries = featureDirectory.list();
      for (const entry of entries) {
        if (entry instanceof File) {
          const decoded = decodeURIComponent(entry.uri);
          const entryName = decoded.split('/').pop()?.split('%2F').pop();
          if (entryName === fileName) {
            return { file: entry, directory: featureDirectory, isSAF: true };
          }
        }
      }
    } catch (error) {
      console.warn('[getFeatureFile] Failed to list SAF directory:', error);
    }
  }

  return {
    file: new File(featureDirectory, fileName),
    directory: featureDirectory,
    isSAF,
  };
};

// ─── File Info Utilities ───────────────────────────────────────────────

export interface StorageFileInfo {
  exists: boolean;
  sizeBytes: number;
  itemCount: number;
  path: string;
}

/**
 * Get info about the storage file for a given feature.
 */
export const getFeatureFileInfo = async (
  feature: StorageFeature,
): Promise<StorageFileInfo> => {
  const { file } = await getFeatureFile(feature);
  const fallbackPath = `${getDefaultBaseUri().replace(/\/$/, '')}/${FEATURE_FILE_NAMES[feature]}`;

  try {
    if (!file.exists) {
      return {
        exists: false,
        sizeBytes: 0,
        itemCount: 0,
        path: fallbackPath,
      };
    }

    const content = await file.text();
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const itemCount = Math.max(0, lines.length - 1);

    return {
      exists: true,
      sizeBytes: file.size ?? 0,
      itemCount,
      path: file.uri ?? fallbackPath,
    };
  } catch {
    return {
      exists: false,
      sizeBytes: 0,
      itemCount: 0,
      path: fallbackPath,
    };
  }
};

/**
 * Get info about the shopping list CSV file.
 */
export const getShoppingListCSVFileInfo = async (): Promise<StorageFileInfo> => {
  return getFeatureFileInfo('shoppingList');
};
