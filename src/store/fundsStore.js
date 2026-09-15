// Fondos programados (ingresos recurrentes) y mensualidades (MSI).
// Nada se ejecuta solo: la persona confirma cada uno desde Inicio.
import { addMonths, addDays, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { createPersistedStore } from './createPersistedStore';
import { round2 } from '../utils/formatCurrency';

const nextDateAfter = (frequency, from) => {
    switch (frequency) {
        case 'weekly': return addDays(from, 7);
        case 'monthly': return addMonths(from, 1);
        case 'biweekly':
        default: return addDays(from, 14);
    }
};

// 'overdue' | 'upcoming' (≤ 3 días) | 'ok'
export const getFundStatus = (fund) => {
    const diff = differenceInDays(startOfDay(parseISO(fund.nextDate)), startOfDay(new Date()));
    if (diff < 0) return 'overdue';
    if (diff <= 3) return 'upcoming';
    return 'ok';
};

export const useFundsStore = createPersistedStore({
    slices: { scheduledFunds: 'scheduledFunds' },
    defaults: { scheduledFunds: [] },

    actions: (set) => {
        const patch = (fundId, fn) => set((s) => ({ scheduledFunds: s.scheduledFunds.map((f) => (f.id === fundId ? fn(f) : f)) }));
        return {
            addScheduledFund: async (fund) => {
                const newFund = { id: Date.now().toString(), type: 'income', createdAt: new Date().toISOString(), ...fund };
                set((s) => ({ scheduledFunds: [...s.scheduledFunds, newFund] }));
                return newFund;
            },

            // Confirmar un ingreso programado adelanta su siguiente fecha.
            confirmFund: async (fundId) => {
                patch(fundId, (f) => ({ ...f, nextDate: nextDateAfter(f.frequency, parseISO(f.nextDate)).toISOString(), lastConfirmed: new Date().toISOString() }));
            },

            removeScheduledFund: async (fundId) => {
                set((s) => ({ scheduledFunds: s.scheduledFunds.filter((f) => f.id !== fundId) }));
            },

            // Parche genérico (editar un fondo, o nombre/fecha de un MSI). Los
            // campos de dinero de un MSI (totalAmount, months, monthlyAmount,
            // paidMonths) sostienen la deuda: quien llame no debe mandarlos.
            updateScheduledFund: async (fundId, changes) => {
                patch(fundId, (f) => ({ ...f, ...changes }));
            },

            // Al borrar una cuenta, sus fondos quedan sin destino explícito
            // (accountId: null) y piden elegir otra la próxima vez.
            detachAccount: async (accountId) => {
                set((s) => ({ scheduledFunds: s.scheduledFunds.map((f) => (f.accountId === accountId ? { ...f, accountId: null } : f)) }));
            },

            // ── MSI ──
            addMSI: async ({ name, totalAmount, months, firstDate, accountId, creditCardId }) => {
                const newMSI = {
                    id: Date.now().toString(),
                    type: 'msi',
                    name,
                    totalAmount: round2(totalAmount),
                    months,
                    monthlyAmount: round2(totalAmount / months),
                    paidMonths: 0,
                    nextDate: firstDate,
                    accountId: accountId || null,
                    creditCardId: creditCardId || null,
                    createdAt: new Date().toISOString(),
                };
                set((s) => ({ scheduledFunds: [...s.scheduledFunds, newMSI] }));
                return newMSI;
            },

            // Una mensualidad más; al pagar la última, el MSI desaparece.
            confirmMSI: async (msiId) => {
                let removed = false;
                set((s) => ({
                    scheduledFunds: s.scheduledFunds.flatMap((f) => {
                        if (f.id !== msiId) return [f];
                        const paid = f.paidMonths + 1;
                        if (paid >= f.months) { removed = true; return []; }
                        return [{ ...f, paidMonths: paid, nextDate: addMonths(parseISO(f.nextDate), 1).toISOString(), lastConfirmed: new Date().toISOString() }];
                    }),
                }));
                return { removed };
            },

            // Cambio de moneda: `amount` es de ingresos; totalAmount/monthlyAmount de MSI.
            convertAllAmounts: async (rate) => {
                const scale = (v) => (v != null ? round2(v * rate) : v);
                set((s) => ({
                    scheduledFunds: s.scheduledFunds.map((f) => ({
                        ...f, amount: scale(f.amount), totalAmount: scale(f.totalAmount), monthlyAmount: scale(f.monthlyAmount),
                    })),
                }));
            },
        };
    },
});

// Los que necesitan atención (vencidos o en ≤ 3 días).
export const selectPendingFunds = (s) => s.scheduledFunds.filter((f) => getFundStatus(f) !== 'ok');