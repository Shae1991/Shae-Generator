import React, { useState, useEffect } from 'react';
import { idbSaveData, idbGetAllData } from '../utils/fileUtils';

const IDB_KEYS = ['imageHistory', 'savedPrompts', 'trainedModels'];

const getStorageDetails = (key: string): { storeName: string | null; isIdb: boolean } => {
    for (const idbKey of IDB_KEYS) {
        if (key.startsWith(idbKey)) {
            return { storeName: idbKey, isIdb: true };
        }
    }
    return { storeName: null, isIdb: false };
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [{ storeName, isIdb }] = useState(() => getStorageDetails(key));
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isInitialized, setIsInitialized] = useState(false);

    // Effect for loading data from the appropriate storage
    useEffect(() => {
        let isMounted = true;
        
        const load = async () => {
            let valueToSet: T | null = null;

            if (isIdb && storeName) {
                try {
                    // Pass storeName and the full user-specific key
                    const data = await idbGetAllData(storeName, key);
                    valueToSet = data as T | null;
                } catch (error) {
                    console.error(`Error loading from IndexedDB for key ${key}:`, error);
                }
            } else { // Use localStorage
                try {
                    const item = window.localStorage.getItem(key);
                    if (item !== null) {
                        valueToSet = JSON.parse(item);
                    }
                } catch (error) {
                    console.error(`Error loading from localStorage for key ${key}:`, error);
                }
            }
            if (isMounted) {
                setStoredValue(valueToSet !== null ? valueToSet : initialValue);
                setIsInitialized(true);
            }
        };

        load();

        return () => { isMounted = false; };
    }, [key, storeName, isIdb]); // Not including initialValue to prevent re-running if it's a new array literal on each render

    // Effect for saving data to the appropriate storage
    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        const save = async () => {
            if (isIdb && storeName) {
                 if (Array.isArray(storedValue)) {
                    try {
                        // Pass storeName, the full user-specific key, and the data
                        await idbSaveData(storeName, key, storedValue);
                    } catch (error) {
                        console.error(`Error saving to IndexedDB for key ${key}:`, error);
                    }
                }
            } else { // Use localStorage
                try {
                    window.localStorage.setItem(key, JSON.stringify(storedValue));
                } catch (error) {
                    console.error(`Error saving to localStorage for key ${key}:`, error);
                }
            }
        };
        
        save();

    }, [key, storedValue, storeName, isIdb, isInitialized]);

    return [storedValue, setStoredValue];
}