import { Directory, File } from 'expo-file-system';
import { getFeatureFile, type FeatureFileResult } from '../config/storage';
import { syncToCloud } from './cloudSync';
import { enqueuePendingSync } from './syncQueue';
import type { ShoppingItem } from '../screens/dashboard/components';

// ─── CSV Column Order ──────────────────────────────────────────────────
// id, name, quantity, store, price, addedBy
// ────────────────────────────────────────────────────────────────────────

const CSV_HEADER = 'id,name,quantity,store,price,addedBy';
const CACHE_TTL_MS = 45_000;

let cachedItems: ShoppingItem[] | null = null;
let lastCacheUpdateAt = 0;

const hasValidCache = (): boolean => {
  if (!cachedItems) return false;
  return Date.now() - lastCacheUpdateAt < CACHE_TTL_MS;
};

const setItemsCache = (items: ShoppingItem[]): void => {
  cachedItems = items;
  lastCacheUpdateAt = Date.now();
};

export const invalidateItemsCache = (): void => {
  cachedItems = null;
  lastCacheUpdateAt = 0;
};

const isFolderConflictError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();

  return (
    message.includes('folder with the same name')
    || (message.includes('same name') && message.includes('folder'))
  );
};

/**
 * Get a File reference to the shopping list CSV.
 */
const getCSVFileResult = async (): Promise<FeatureFileResult> => {
  return getFeatureFile('shoppingList');
};

/**
 * Escape a value for CSV format.
 * Wraps in double-quotes if the value contains commas, quotes, or newlines.
 */
const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Parse a single CSV line, handling quoted fields.
 */
const parseCSVLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  fields.push(current);
  return fields;
};

/**
 * Serialize a ShoppingItem to a CSV row string.
 */
const itemToCSVRow = (item: ShoppingItem): string => {
  return [
    escapeCSV(item.id),
    escapeCSV(item.name),
    escapeCSV(item.quantity),
    escapeCSV(item.store),
    escapeCSV(item.price),
    escapeCSV(item.addedBy),
  ].join(',');
};

/**
 * Parse a CSV row string to a ShoppingItem.
 */
const csvRowToItem = (row: string): ShoppingItem | null => {
  const fields = parseCSVLine(row);
  if (fields.length < 6) return null;

  return {
    id: fields[0],
    name: fields[1],
    quantity: fields[2],
    store: fields[3],
    price: fields[4],
    addedBy: fields[5],
  };
};

/**
 * Ensure the CSV file exists with a header row.
 */
export const ensureCSVFile = async (): Promise<void> => {
  const { file, directory, isSAF } = await getCSVFileResult();

  if (file.exists) {
    return;
  }

  // SAF paths (content://) require Directory.createFile instead of File.create
  if (isSAF) {
    const fileName = file.uri.split('/').pop() ?? 'shopping_list.csv';
    const created = directory.createFile(fileName, 'text/csv');
    created.write(CSV_HEADER + '\n');
    return;
  }

  // Local paths: use File.create with folder-conflict recovery
  const createFileWithHeader = () => {
    file.create();
    file.write(CSV_HEADER + '\n');
  };

  try {
    createFileWithHeader();
  } catch (error) {
    if (!isFolderConflictError(error)) {
      throw error;
    }

    const conflictingDirectory = new Directory(file.uri);
    if (conflictingDirectory.exists) {
      conflictingDirectory.delete();
    }

    createFileWithHeader();
  }
};

/**
 * Read all items from the CSV file.
 */
export const readAllItems = async (
  options?: { forceRefresh?: boolean },
): Promise<ShoppingItem[]> => {
  if (!options?.forceRefresh && hasValidCache()) {
    return [...(cachedItems ?? [])];
  }

  const { file } = await getCSVFileResult();

  if (!file.exists) {
    setItemsCache([]);
    return [];
  }

  const content = await file.text();
  const lines = content.split('\n').filter(line => line.trim().length > 0);

  // Skip the header row
  const dataLines = lines.slice(1);
  const items: ShoppingItem[] = [];
  const seenIds = new Set<string>();
  let duplicateCount = 0;

  for (const line of dataLines) {
    const item = csvRowToItem(line);
    if (item) {
      if (seenIds.has(item.id)) {
        duplicateCount += 1;
        continue;
      }
      seenIds.add(item.id);
      items.push(item);
    }
  }

  if (duplicateCount > 0) {
    console.warn(`[csvStorage] Ignored ${duplicateCount} duplicated item id(s) while reading CSV.`);
  }

  setItemsCache(items);
  return items;
};

/**
 * Write all items to the CSV file (full rewrite).
 */
const writeAllItems = async (items: ShoppingItem[]): Promise<void> => {
  await ensureCSVFile();
  const { file } = await getCSVFileResult();
  const rows = items.map(itemToCSVRow);
  const content = [CSV_HEADER, ...rows].join('\n') + '\n';
  file.write(content);
  setItemsCache(items);

  // Sync to cloud if in cloud mode; queue for retry if it fails
  try {
    await syncToCloud('shoppingList');
  } catch (err) {
    console.warn('[csvStorage] Cloud sync after write failed, queuing for retry:', err);
    await enqueuePendingSync('shoppingList');
  }
};

/**
 * Add a single item to the CSV file (append a row).
 */
export const addItemToCSV = async (item: ShoppingItem): Promise<void> => {
  await ensureCSVFile();
  const { file } = await getCSVFileResult();
  const content = await file.text();
  const newContent = content.trimEnd() + '\n' + itemToCSVRow(item) + '\n';
  file.write(newContent);

  if (cachedItems) {
    setItemsCache([...cachedItems, item]);
  } else {
    invalidateItemsCache();
  }

  // Sync to cloud if in cloud mode; queue for retry if it fails
  try {
    await syncToCloud('shoppingList');
  } catch (err) {
    console.warn('[csvStorage] Cloud sync after add failed, queuing for retry:', err);
    await enqueuePendingSync('shoppingList');
  }
};

/**
 * Remove a single item from the CSV file by its ID.
 */
export const removeItemFromCSV = async (id: string): Promise<void> => {
  const items = await readAllItems();
  const filtered = items.filter(item => item.id !== id);
  await writeAllItems(filtered);
};

/**
 * Remove multiple items from the CSV file by their IDs.
 * Used when finishing shopping mode (removing checked/purchased items).
 */
export const removeItemsFromCSV = async (ids: Set<string>): Promise<void> => {
  const items = await readAllItems();
  const filtered = items.filter(item => !ids.has(item.id));
  await writeAllItems(filtered);
};
