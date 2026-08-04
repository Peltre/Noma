// Fetches a live exchange rate for the "cambiar de moneda" flow in
// Settings. This is the ONE place in the whole app that touches the
// network — Noma is otherwise fully offline (AsyncStorage only), so
// this deliberately fails soft: no internet (or a slow/broken
// connection) just means "can't convert right now", never a crash.
//
// Frankfurter (https://www.frankfurter.app) is used because it's a
// free, keyless, no-signup exchange rate API (backed by European
// Central Bank reference rates) — nothing to configure, nothing that
// can expire.
const TIMEOUT_MS = 8000;

// `from`/`to` are ISO 4217 codes, e.g. "MXN", "USD".
// Returns { rate } on success, or { error } with a message already
// safe to show the user directly in an Alert.
export async function fetchExchangeRate(from, to) {
    if (from === to) return { rate: 1 };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(
            `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
            { signal: controller.signal }
        );
        if (!response.ok) {
            return { error: 'No se pudo obtener el tipo de cambio. Intenta de nuevo en unos minutos.' };
        }
        const data = await response.json();
        const rate = data?.rates?.[to];
        if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) {
            return { error: 'No se pudo obtener el tipo de cambio. Intenta de nuevo en unos minutos.' };
        }
        return { rate };
    } catch (error) {
        // Covers both "no network at all" (fetch throws immediately)
        // and "too slow to matter" (the abort() above throws too) —
        // from the person's perspective both are just "no internet
        // right now", so they share one message.
        return { error: 'Cambiar de moneda requiere conexión a internet para consultar el tipo de cambio actual. Verifica tu conexión e intenta de nuevo.' };
    } finally {
        clearTimeout(timeoutId);
    }
}