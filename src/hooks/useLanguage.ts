import { useContext } from 'react';
import {
  LanguageContext,
  type LanguageContextValue,
} from '../context/LanguageContext';

/**
 * Access the current language and helpers.
 *
 * Must be used inside a `<LanguageProvider>`.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a <LanguageProvider>');
  }
  return ctx;
}
