import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const languageRef = useRef<LanguageCode>('pt');
  const languagePreferenceRef = useRef<LanguagePreference>('system');
  const requestIdRef = useRef(0);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    languagePreferenceRef.current = languagePreference;
  }, [languagePreference]);

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
    if (preference === languagePreferenceRef.current) return;

    const previousPreference = languagePreferenceRef.current;
    const requestId = ++requestIdRef.current;

    setLanguagePreferenceState(preference);

    void applyLanguagePreference(preference)
      .then((resolvedLanguage) => {
        if (requestId !== requestIdRef.current) return;
        setLanguageState(resolvedLanguage);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setLanguagePreferenceState(previousPreference);
        setLanguageState(languageRef.current);
      });
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      languagePreference,
      setLanguagePreference,
      ready,
    }),
    [language, languagePreference, setLanguagePreference, ready],
  );

  if (!ready) return null;

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
};
