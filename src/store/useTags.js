// Custom hook to manage transaction tags — a fully optional way to
// label a movement (e.g. "Comida", "Transporte") for a future
// breakdown by tag. Deliberately separate from `category`
// (constants/categories.js), which is internal/app-generated (msi,
// card_payment, goal) and was removed as something a person has to
// pick — tags are the opposite: always optional, always person-
// picked, and never block registering a transaction.
import { useState, useEffect } from 'react';
import { saveData, loadData, removeData } from './storage';

const TAGS_KEY = 'tags';

// Seeded once for a new user; after that this list is just whatever
// is saved (edits/additions persist, the app never re-seeds on top).
// `builtin: true` only means "came with the app" — it doesn't behave
// any differently from a tag the person creates themselves.
const defaultTags = [
    { id: 'food', label: 'Comida', icon: 'food', builtin: true },
    { id: 'transport', label: 'Transporte', icon: 'transport', builtin: true },
    { id: 'supermarket', label: 'Súper', icon: 'supermarket', builtin: true },
    { id: 'health', label: 'Salud', icon: 'health', builtin: true },
    { id: 'entertainment', label: 'Ocio', icon: 'entertainment', builtin: true },
    { id: 'clothing', label: 'Ropa', icon: 'clothing', builtin: true },
    { id: 'home', label: 'Hogar', icon: 'home', builtin: true },
    { id: 'services', label: 'Servicios', icon: 'services', builtin: true },
    { id: 'education', label: 'Educación', icon: 'education', builtin: true },
    { id: 'other', label: 'Otro', icon: 'other', builtin: true },
];

export function useTags() {
    const [tags, setTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const saved = await loadData(TAGS_KEY);
            setTags(saved || defaultTags);
            setTagsLoading(false);
        };
        load();
    }, []);

    // Created inline from TransactionScreen's "+ Nueva" chip. Name is
    // the only required input; icon defaults to the generic "other"
    // glyph if the person doesn't pick one from the palette.
    const addTag = async ({ label, icon }) => {
        if (!label || !label.trim()) {
            return { error: 'Ponle un nombre a la etiqueta.' };
        }
        const trimmed = label.trim();
        const exists = tags.some(t => t.label.toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            return { error: 'Ya existe una etiqueta con ese nombre.' };
        }
        const newTag = { id: Date.now().toString(), label: trimmed, icon: icon || 'other', builtin: false };
        const updated = [...tags, newTag];
        setTags(updated);
        await saveData(TAGS_KEY, updated);
        return newTag;
    };

    // Same shape as resetSettings: a reset user is a new user, and a
    // new user starts with the seeded defaultTags, not an empty list.
    // Without this, "Borrar todos los datos" in Settings left custom
    // tags sitting in storage even though every other piece of data
    // was wiped.
    const resetTags = async () => {
        await removeData(TAGS_KEY);
        setTags(defaultTags);
    };

    return { tags, tagsLoading, addTag, resetTags };
}