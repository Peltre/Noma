// Noma theme registry (v2).
// Every theme exposes the same semantic tokens, so any screen that
// reads `theme.xxx` instead of `Colors.xxx` works with all three
// without extra changes.
//
// Fixed meaning across themes (does not change with the palette):
//   moneyIn  income / debit account in the allocation bar
//   moneyOut expense (icon) / credit card debt / this month's spend
//            in the allocation bar
//   brand    dominant brand color: primary CTA, avatar, active tab
//   savings  savings account in the allocation bar — a blue that
//            hasn't been used anywhere else in the palette, so it
//            reads as distinct and a little more lively than a
//            plain neutral, without competing with brand.
// An expense amount in text always uses `ink` (neutral), never
// moneyOut. A single expense should not read as an alert.

export const Themes = {
    arena: {
        label: 'Arena',
        description: 'Cálido y terroso, de día',
        statusBarStyle: 'dark', // value for expo-status-bar <StatusBar style="..." />

        bg: '#F6F1E7',
        surface: '#FFFFFF',
        border: '#E6DCC8',

        ink: '#3A2E22',
        inkSoft: 'rgba(58,46,34,0.4)',
        muted: '#8F8268',

        brand: '#C17C3A',
        brandSoft: 'rgba(193,124,58,0.14)',
        brandOn: '#FFFFFF',

        moneyIn: '#4F7C7A',
        moneyInSoft: 'rgba(79,124,122,0.12)',
        moneyOut: '#C17C3A',
        moneyOutSoft: 'rgba(193,124,58,0.14)',

        savings: '#3E7CB8',
        savingsSoft: 'rgba(62,124,184,0.14)',

        cashTone: '#D9C7A3',
    },

    medianoche: {
        label: 'Medianoche',
        description: 'El mismo desierto, de noche',
        statusBarStyle: 'light',

        bg: '#11151D',
        surface: '#1B1F28',
        border: 'rgba(255,255,255,0.08)',

        ink: '#ECEEE7',
        inkSoft: 'rgba(236,238,231,0.4)',
        muted: '#8E9099',

        brand: '#5FC9BD',
        brandSoft: 'rgba(95,201,189,0.16)',
        brandOn: '#11151D',

        moneyIn: '#5FC9BD',
        moneyInSoft: 'rgba(95,201,189,0.14)',
        moneyOut: '#CC9A5C',
        moneyOutSoft: 'rgba(204,154,92,0.16)',

        savings: '#5B9EF0',
        savingsSoft: 'rgba(91,158,240,0.18)',

        cashTone: '#4A4C52',
    },

    brasa: {
        label: 'Brasa',
        description: 'Desierto nocturno, versión cálida',
        statusBarStyle: 'light',

        bg: '#1E160F',
        surface: '#2A1F17',
        border: 'rgba(255,255,255,0.07)',

        ink: '#F2E6D6',
        inkSoft: 'rgba(242,230,214,0.4)',
        muted: '#9C8E78',

        brand: '#D9763E',
        brandSoft: 'rgba(217,118,62,0.18)',
        brandOn: '#1E160F',

        moneyIn: '#6F8A77',
        moneyInSoft: 'rgba(111,138,119,0.16)',
        moneyOut: '#D9763E',
        moneyOutSoft: 'rgba(217,118,62,0.16)',

        savings: '#5A93C4',
        savingsSoft: 'rgba(90,147,196,0.18)',

        cashTone: '#4A3C2C',
    },
};

export const THEME_NAMES = Object.keys(Themes);
export const DEFAULT_THEME = 'medianoche';