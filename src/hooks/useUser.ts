import { useContext } from 'react';
import { UserContext, type UserContextValue } from '../context/UserContext';

/**
 * Access the current user profile info and helpers.
 *
 * Must be used inside a `<UserProvider>`.
 */
export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a <UserProvider>');
  }
  return ctx;
}
