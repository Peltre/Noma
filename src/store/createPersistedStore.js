// Fábrica de stores con persistencia.
//
// Un store de zustand por dominio (dinero, ahorros, fondos, etiquetas,
// ajustes). Cada "slice" (accounts, transactions…) se guarda en su
// propia clave de AsyncStorage —las MISMAS claves que la app usaba
// antes— así que no hay migración de datos al cambiar de sistema.
//
// Qué resuelve frente al patrón anterior (useState + saveData en cada
// acción): las acciones escriben con `set(state => …)` y leen con
// `get()`, que siempre son el estado actual. Dos acciones seguidas se
// aplican una sobre otra en vez de pisarse, y la persistencia vive en
// UN lugar (el subscribe de abajo) en vez de en 47.
//
// Uso:
//   const useMoneyStore = createPersistedStore({
//       slices: { accounts: 'accounts' },      // slice → clave en storage
//       defaults: { accounts: [] },
//       migrate: (loaded) => loaded,           // opcional, corre una vez al cargar
//       actions: (set, get) => ({ addAccount(...) { … } }),
//   });
import { create } from 'zustand';
import { loadData, saveData, removeData } from './storage';

export function createPersistedStore({ slices, defaults, migrate, actions }) {
    const entries = Object.entries(slices);

    const useStore = create((set, get) => ({
        ...defaults,
        hydrated: false,
        ...actions(set, get),
    }));

    // Mientras se carga, el subscribe no debe escribir: guardaría los
    // defaults encima de los datos reales.
    let persisting = false;
    let prev = useStore.getState();
    useStore.subscribe((state) => {
        if (persisting) {
            for (const [slice, key] of entries) {
                if (state[slice] !== prev[slice]) saveData(key, state[slice]);
            }
        }
        prev = state;
    });

    const hydrate = async () => {
        const loaded = {};
        for (const [slice, key] of entries) {
            const value = await loadData(key);
            if (value != null) loaded[slice] = value;
        }
        const merged = { ...defaults, ...loaded };
        const next = migrate ? migrate(merged) : merged;
        // Lo que la migración cambió de los datos cargados se guarda una
        // vez; los defaults no se escriben (son el respaldo, no un dato).
        for (const [slice, key] of entries) {
            if (slice in loaded && next[slice] !== loaded[slice]) saveData(key, next[slice]);
        }
        useStore.setState({ ...next, hydrated: true });
        persisting = true;
    };
    const ready = hydrate();

    // Borra las claves y vuelve a los defaults (Ajustes → Borrar todo).
    useStore.resetPersisted = async () => {
        for (const [, key] of entries) await removeData(key);
        useStore.setState({ ...defaults });
    };
    useStore.ready = ready;

    return useStore;
}