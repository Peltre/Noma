// The heart of this app; where all data lives happily

import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper functions to help store, retrieve & remove data (JSON) objs.
// All three swallow their own errors (storage full, corrupted value,
// device restriction, etc.) instead of throwing — an unhandled
// rejection here would otherwise crash the screen that called it.
// saveData/removeData return true/false so a caller COULD check if it
// cares, but none currently do; the important part is they don't blow
// up the app.

export const saveData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[storage] Failed to save "${key}":`, error);
    return false;
  }
};

export const loadData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    // Covers both a failed read and a corrupted (non-JSON) value —
    // either way, falling back to null lets callers use their
    // defaults instead of crashing on startup.
    console.error(`[storage] Failed to load "${key}":`, error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[storage] Failed to remove "${key}":`, error);
    return false;
  }
};