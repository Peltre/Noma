// Custom hook to handle general app settings

import { useState, useEffect } from "react";
import { saveData, loadData } from "./storage";

const SETTINGS_KEY = 'settings';

const defaultSettings = {
    userName: 'Usuario',
    currency: 'MXN',
};

export function useSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const saved = await loadData(SETTINGS_KEY);
            if (saved) setSettings(saved);
            setIsLoading(false)
        };
        load()
    }, []);

    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        await saveData(SETTINGS_KEY, updated);
    };

    return { settings, isLoading, updateSettings };
}