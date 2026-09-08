// Fetches a live exchange rate for Settings' "cambiar de moneda" flow
// — the one place in the app that touches the network (otherwise
// fully offline). Fails soft: no internet just means "can't convert
// right now", never a crash. Uses Frankfurter (frankfurter.app), a
// free keyless exchange rate API backed by ECB reference rates.
const TIMEOUT_MS = 8000;

// `from`/`to` are ISO 4217 codes (e.g. "MXN", "USD"). Returns { rate }
// on success, or { error } with a message safe to show directly.
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
    } catch {
        // Covers no network and a timed-out abort() alike — both just read as "no internet".
        return { error: 'Cambiar de moneda requiere conexión a internet para consultar el tipo de cambio actual. Verifica tu conexión e intenta de nuevo.' };
    } finally {
        clearTimeout(timeoutId);
    }
}