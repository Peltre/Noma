// Ajustes: nombre, moneda y banderas de onboarding.
import { createPersistedStore } from './createPersistedStore';

const defaultSettings = {
    userName: 'Usuario',
    currency: 'MXN',
    onboardingCompleted: false,
    showTour: false,
};

export const useSettingsStore = createPersistedStore({
    slices: { settings: 'settings' },
    defaults: { settings: defaultSettings },
    // Ajustes nuevos que no existían cuando la persona guardó. Sólo
    // produce un objeto nuevo si falta alguno (si no, se reescribiría
    // el storage en cada arranque).
    migrate: (loaded) =>
        Object.keys(defaultSettings).every((k) => k in loaded.settings)
            ? loaded
            : { ...loaded, settings: { ...defaultSettings, ...loaded.settings } },
    actions: (set) => ({
        updateSettings: async (changes) => set((s) => ({ settings: { ...s.settings, ...changes } })),
    }),
});