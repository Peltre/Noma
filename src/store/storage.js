// The heart of this app; where all data lives happily

import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper functions to help store, retrieve & remove data
// (JSON) objs
export const saveData = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const loadData = async (key) => {
  const value = await AsyncStorage.getItem(key);
  if (!value) return null;
  return JSON.parse(value);
};

export const removeData = async (key) => {
  await AsyncStorage.removeItem(key);
};