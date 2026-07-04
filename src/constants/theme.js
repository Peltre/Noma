// Noma Design System — tokens
// (Colors used to live here as a fixed light-mode palette. The app
// moved to the theme system in constants/themes.js — see useTheme()
// — so it was removed. FontSize/Radius/Spacing/Shadow below are
// still shared across every theme.)

export const FontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    hero: 44,
};

export const Radius = {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 36,
    full: 999,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const Shadow = {
    card: {
        shadowColor: '#0F0E0C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    float: {
        shadowColor: '#0F0E0C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
    },
};