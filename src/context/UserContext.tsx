import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const STORAGE_KEY_USER_NAME = '@prodexa/userName';

export interface UserContextValue {
  name: string;
  setName: (name: string) => void;
  ready: boolean;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [name, setNameState] = useState('');
  const [ready, setReady] = useState(false);
  const nameRef = useRef('');

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY_USER_NAME)
      .then((savedName) => {
        if (!active) return;
        setNameState(savedName ?? '');
      })
      .finally(() => {
        if (!active) return;
        setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const setName = useCallback((nextName: string) => {
    if (nextName === nameRef.current) return;

    const previousName = nameRef.current;
    setNameState(nextName);

    const persist = nextName.trim().length
      ? AsyncStorage.setItem(STORAGE_KEY_USER_NAME, nextName)
      : AsyncStorage.removeItem(STORAGE_KEY_USER_NAME);

    persist.catch(() => {
      setNameState(previousName);
    });
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      name,
      setName,
      ready,
    }),
    [name, ready, setName],
  );

  if (!ready) return null;

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
