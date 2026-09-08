// Fechas de corte y pago de una tarjeta de crédito.
//
// La tarjeta guarda solo el día del mes (cutoffDay, paymentDay). Esto
// convierte ese número en "faltan N días", que es lo que sirve para
// decidir si urge. Vive en utils y no en HomeScreen porque Tarjetas
// también lo necesita.
import { startOfDay, differenceInCalendarDays, getDaysInMonth, addMonths } from 'date-fns';

// Umbral de "urge": corte o pago límite dentro de este número de días.
export const URGENT_DAYS = 5;

// Próxima fecha (hoy incluido) en la que el mes tiene ese día. Si el
// mes no llega (corte día 31 en febrero), se toma el último día del mes,
// que es lo que hacen los bancos.
export function nextOccurrenceOfDay(day, from = new Date()) {
    const d = parseInt(day, 10);
    if (!d || d < 1) return null;
    const today = startOfDay(from);
    let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = 0; i < 2; i++) {
        const clamped = Math.min(d, getDaysInMonth(cursor));
        const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), clamped);
        if (candidate >= today) return candidate;
        cursor = addMonths(cursor, 1);
    }
    return null;
}

// Días que faltan para el próximo día `day`. 0 = hoy. null si no hay día.
export function daysUntilDay(day, from = new Date()) {
    const next = nextOccurrenceOfDay(day, from);
    return next ? differenceInCalendarDays(next, startOfDay(from)) : null;
}

// Todo lo que Inicio y Tarjetas necesitan saber de las fechas de una
// tarjeta en una sola pasada.
export function getCardUrgency(card, from = new Date()) {
    const cutoffIn = daysUntilDay(card.cutoffDay, from);
    const paymentIn = daysUntilDay(card.paymentDay, from);
    const hasDebt = (card.currentDebt || 0) > 0;
    // Sin deuda no hay nada que pagar, así que ninguna fecha urge.
    const cutoffUrgent = hasDebt && cutoffIn != null && cutoffIn <= URGENT_DAYS;
    const paymentUrgent = hasDebt && paymentIn != null && paymentIn <= URGENT_DAYS;
    // El más cercano de los dos es el que manda para ordenar.
    const soonest = [cutoffIn, paymentIn].filter(n => n != null).sort((a, b) => a - b)[0] ?? null;
    return { cutoffIn, paymentIn, cutoffUrgent, paymentUrgent, urgent: cutoffUrgent || paymentUrgent, soonest };
}

// "hoy" · "mañana" · "en 4 días"
export function inDaysLabel(days) {
    if (days == null) return '';
    if (days === 0) return 'hoy';
    if (days === 1) return 'mañana';
    return `en ${days} días`;
}