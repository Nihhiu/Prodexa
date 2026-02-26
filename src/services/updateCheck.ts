import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ─── Constants ─────────────────────────────────────────────────────────
const GITHUB_REPO = 'Nihhiu/Prodexa';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

const AUTO_UPDATE_KEY = '@prodexa/auto_update_check';
const LAST_UPDATE_CHECK_KEY = '@prodexa/last_update_check';

/** Minimum interval between automatic checks (7 days in ms). */
const MIN_CHECK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

// ─── Types ─────────────────────────────────────────────────────────────
export interface UpdateCheckResult {
  hasUpdate: boolean;
  latestVersion: string | null;
  error?: string;
}

// ─── Auto-update preference ────────────────────────────────────────────

export const getAutoUpdateCheck = async (): Promise<boolean> => {
  try {
    const raw = await AsyncStorage.getItem(AUTO_UPDATE_KEY);
    if (raw === null) return false;
    return JSON.parse(raw) === true;
  } catch {
    return false;
  }
};

export const setAutoUpdateCheck = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(AUTO_UPDATE_KEY, JSON.stringify(enabled));
};

// ─── Last check timestamp ──────────────────────────────────────────────

const getLastCheckTimestamp = async (): Promise<number> => {
  try {
    const raw = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
    if (!raw) return 0;
    return Number(raw) || 0;
  } catch {
    return 0;
  }
};

const setLastCheckTimestamp = async (): Promise<void> => {
  await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, String(Date.now()));
};

// ─── Check for updates ─────────────────────────────────────────────────

/**
 * Fetch the latest release tag from GitHub and compare with the current version.
 */
export const checkForUpdate = async (
  currentVersion: string,
): Promise<UpdateCheckResult> => {
  try {
    const response = await axios.get<{ tag_name: string }>(GITHUB_API_URL, {
      timeout: 10_000,
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    const latestTag = response.data.tag_name.replace(/^v/, '');
    await setLastCheckTimestamp();

    if (latestTag !== currentVersion) {
      return { hasUpdate: true, latestVersion: latestTag };
    }

    return { hasUpdate: false, latestVersion: latestTag };
  } catch {
    return { hasUpdate: false, latestVersion: null, error: 'network' };
  }
};

/**
 * Perform an automatic update check if enough time has passed since the last one.
 * Returns null if the check was skipped (too recent).
 */
export const autoCheckForUpdate = async (
  currentVersion: string,
): Promise<UpdateCheckResult | null> => {
  const enabled = await getAutoUpdateCheck();
  if (!enabled) return null;

  const lastCheck = await getLastCheckTimestamp();
  if (Date.now() - lastCheck < MIN_CHECK_INTERVAL_MS) return null;

  return checkForUpdate(currentVersion);
};

// ─── Helpers ───────────────────────────────────────────────────────────

export const getGitHubRepoUrl = (): string => GITHUB_REPO_URL;
