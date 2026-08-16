// Custom hook to handle general app settings
import { useState, useEffect } from "react";
import { saveData, loadData, removeData } from "./storage";

const SETTINGS_KEY = 'settings';

const defaultSettings = {
    userName: 'Usuario',
    currency: 'MXN',
    onboardingCompleted: false,
    // 'medianoche' is just the starting default — any theme in
    // constants/themes.js is choosable from Settings.
    theme: 'medianoche',
};

export function useSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const saved = await loadData(SETTINGS_KEY);
            if (saved) setSettings({ ...defaultSettings, ...saved });
            setIsLoading(false)
        };
        load()
    }, []);

    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        await saveData(SETTINGS_KEY, updated);
    };

    const resetSettings = async () => {
        await removeData(SETTINGS_KEY);
        setSettings(defaultSettings);
    };

    return { settings, isLoading, updateSettings, resetSettings };
}