// Etiquetas de movimientos: opcionales y elegidas por la persona
// (Comida, Transporte…). Distintas de `category`, que es interna
// (msi, card_payment, goal, interest).
import { createPersistedStore } from './createPersistedStore';

// Semilla para un usuario nuevo; después la lista es lo que esté
// guardado. `builtin` sólo dice "vino con la app".
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

export const useTagsStore = createPersistedStore({
    slices: { tags: 'tags' },
    defaults: { tags: defaultTags },
    actions: (set, get) => ({
        // Se crea desde "+ Nueva" en Nuevo movimiento.
        addTag: async ({ label, icon }) => {
            if (!label || !label.trim()) return { error: 'Ponle un nombre a la etiqueta.' };
            const trimmed = label.trim();
            if (get().tags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) return { error: 'Ya existe una etiqueta con ese nombre.' };
            const newTag = { id: Date.now().toString(), label: trimmed, icon: icon || 'other', builtin: false };
            set((s) => ({ tags: [...s.tags, newTag] }));
            return newTag;
        },
    }),
});