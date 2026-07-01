// Theme hook. Reads/writes through the existing settings store, so the
// chosen theme persists the same way as any other preference.
import { useFinance } from './FinanceContext';
import { Themes, THEME_NAMES, DEFAULT_THEME } from '../constants/themes';

export function useTheme() {
    const { settings, updateSettings } = useFinance();

    const themeName = Themes[settings?.theme] ? settings.theme : DEFAULT_THEME;
    const theme = Themes[themeName];

    const setTheme = (name) => {
        if (!Themes[name]) return;
        updateSettings({ theme: name });
    };

    return { theme, themeName, setTheme, themeNames: THEME_NAMES, themes: Themes };
}