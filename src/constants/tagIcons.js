// Icon registry for tags — maps a tag's stored `icon` key to its
// component. Centralized here (not inside useTags.js, which only
// handles data) so both the tag chips in TransactionScreen and the
// icon palette shown when creating a new tag read from the same
// single list — no separate "icon library" to keep in sync.
import {
    IconTagFood, IconTagTransport, IconTagCart, IconTagHealth,
    IconTagEntertainment, IconTagClothing, IconTagHome, IconTagServices,
    IconTagEducation, IconTagOther,
} from '../components/Icons';

const TAG_ICONS = {
    food: IconTagFood,
    transport: IconTagTransport,
    supermarket: IconTagCart,
    health: IconTagHealth,
    entertainment: IconTagEntertainment,
    clothing: IconTagClothing,
    home: IconTagHome,
    services: IconTagServices,
    education: IconTagEducation,
    other: IconTagOther,
};

// Same 10 keys double as the icon picker for a custom tag.
export const TAG_ICON_OPTIONS = Object.keys(TAG_ICONS);

export function getTagIcon(key) {
    return TAG_ICONS[key] || IconTagOther;
}