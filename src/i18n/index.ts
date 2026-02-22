import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import pt from './locales/pt.json';
import en from './locales/en.json';

const STORAGE_KEY_LANGUAGE = '@prodexa/language';

/** Supported language codes. */
export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

/** Language preference options shown to the user. */
export const LANGUAGE_PREFERENCES = ['system', 'pt', 'en'] as const;
export type LanguagePreference = (typeof LANGUAGE_PREFERENCES)[number];

/** Readable labels for each language (always in its own language). */
export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  pt: 'Português',
  en: 'English',
};

function resolveSystemLanguage(): LanguageCode {
  const deviceLocales = Localization.getLocales();
  if (deviceLocales.length > 0) {
    const code = deviceLocales[0].languageCode as string;
    if (SUPPORTED_LANGUAGES.includes(code as LanguageCode)) {
      return code as LanguageCode;
    }
  }

  return 'pt';
}

function normalizePreference(value: string | null): LanguagePreference {
  if (!value) return 'system';
  if (LANGUAGE_PREFERENCES.includes(value as LanguagePreference)) {
    return value as LanguagePreference;
  }
  return 'system';
}

function resolveLanguageForPreference(preference: LanguagePreference): LanguageCode {
  if (preference === 'system') {
    return resolveSystemLanguage();
  }
  return preference;
}

export interface InitialLanguageState {
  preference: LanguagePreference;
  language: LanguageCode;
}

/**
 * Resolve the initial language:
 * 1. User preference in AsyncStorage
 * 2. Device locale (if supported)
 * 3. Fallback to 'pt'
 */
async function getInitialLanguageState(): Promise<InitialLanguageState> {
  let preference: LanguagePreference = 'system';

  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_LANGUAGE);
    preference = normalizePreference(saved);
  } catch {
    // no-op
  }

  return {
    preference,
    language: resolveLanguageForPreference(preference),
  };
}

/** Persist chosen language. */
export async function persistLanguagePreference(
  preference: LanguagePreference,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, preference);
  } catch {
    // no-op
  }
}

/** Apply preference and return the active resolved language. */
export async function applyLanguagePreference(
  preference: LanguagePreference,
): Promise<LanguageCode> {
  const resolvedLanguage = resolveLanguageForPreference(preference);
  await i18n.changeLanguage(resolvedLanguage);
  await persistLanguagePreference(preference);
  return resolvedLanguage;
}

// Initialise i18next (async – resolves before first render via LanguageProvider)
export async function initI18n(): Promise<InitialLanguageState> {
  const initialState = await getInitialLanguageState();

  await i18n.use(initReactI18next).init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
    lng: initialState.language,
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
  });

  return initialState;
}

export default i18n;
