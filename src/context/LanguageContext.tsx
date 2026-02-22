import React, { createContext, useCallback, useEffect, useState } from 'react';
import {
  applyLanguagePreference,
  initI18n,
  LANGUAGE_PREFERENCES,
  type LanguageCode,
  type LanguagePreference,
} from '../i18n';

export interface LanguageContextValue {
  /** Current active language code ('pt' | 'en'). */
  language: LanguageCode;
  /** Current language preference ('system' | 'pt' | 'en'). */
  languagePreference: LanguagePreference;
  /** Change the language preference (persists to AsyncStorage). */
  setLanguagePreference: (preference: LanguagePreference) => void;
  /** Whether i18n has finished initialising. */
  ready: boolean;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [language, setLanguageState] = useState<LanguageCode>('pt');
  const [languagePreference, setLanguagePreferenceState] =
    useState<LanguagePreference>('system');

  useEffect(() => {
    let active = true;

    initI18n().then((initialState) => {
      if (!active) return;
      setLanguageState(initialState.language);
      setLanguagePreferenceState(initialState.preference);
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const setLanguagePreference = useCallback((preference: LanguagePreference) => {
    if (!LANGUAGE_PREFERENCES.includes(preference)) return;

    applyLanguagePreference(preference).then((resolvedLanguage) => {
      setLanguageState(resolvedLanguage);
      setLanguagePreferenceState(preference);
    });
  }, []);

  if (!ready) return null;

  return (
    <LanguageContext.Provider
      value={{
        language,
        languagePreference,
        setLanguagePreference,
        ready,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
