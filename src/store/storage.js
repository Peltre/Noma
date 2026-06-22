// The heart of this app; where all data lives happily

import { MMKV } from 'react-native-mmkv'; // Wrapper for data persistance

export const storage = new MMKV({ id: 'noma-storage' });

// Helper functions to help store, retrieve & remove data
// (JSON) objs
export const saveData = (key, value) => {
    storage.set(key, JSON.stringify(value))
};

export const loadData = (key) => {
    const value = storage.getString(key);
    if (!value) return null;
    return JSON.parse(value);
};

export const removeData = (key) => {
    storage.delete(key);
};