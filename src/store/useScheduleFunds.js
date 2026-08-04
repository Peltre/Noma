// Manages scheduled income reminders AND MSI (months without interest) installments
// Nothing executes automatically — user confirms each payment from the Home screen

import { useState, useEffect } from "react";
import { saveData, loadData, removeData } from "./storage";
import { addMonths, parseISO, startOfDay, differenceInDays, addDays } from "date-fns";
import { round2 } from "../utils/formatCurrency";

const KEY = 'scheduledFunds';

export function useScheduledFunds() {
    const [scheduledFunds, setScheduledFunds] = useState([]);

    useEffect(() => {
        const load = async () => {
            const saved = await loadData(KEY);
            setScheduledFunds(saved || []);
        };
        load();
    }, []);

    // Date helpers

    const getNextDate = (frequency, fromDate) => {
        switch (frequency) {
            case 'weekly': return addDays(fromDate, 7);
            case 'biweekly': return addDays(fromDate, 14);
            case 'monthly': return addMonths(fromDate, 1);
            default: return addDays(fromDate, 14);
        }
    };

    // Status

    const getFundStatus = (fund) => {
        const today = startOfDay(new Date());
        const next = startOfDay(parseISO(fund.nextDate));
        const diff = differenceInDays(next, today);
        if (diff < 0) return 'overdue';
        if (diff <= 3) return 'upcoming';
        return 'ok';
    };

    // Scheduled income funds

    const addScheduledFund = async (fund) => {
        const newFund = {
            id: Date.now().toString(),
            type: 'income',         // explicit type for income funds
            createdAt: new Date().toISOString(),
            ...fund,
        };
        const updated = [...scheduledFunds, newFund];
        setScheduledFunds(updated);
        await saveData(KEY, updated);
    };

    const confirmFund = async (fundId) => {
        const updated = scheduledFunds.map(f => {
            if (f.id !== fundId) return f;
            const next = getNextDate(f.frequency, parseISO(f.nextDate));
            return { ...f, nextDate: next.toISOString(), lastConfirmed: new Date().toISOString() };
        });
        setScheduledFunds(updated);
        await saveData(KEY, updated);
    };

    const removeScheduledFund = async (fundId) => {
        const updated = scheduledFunds.filter(f => f.id !== fundId);
        setScheduledFunds(updated);
        await saveData(KEY, updated);
    };

    // Generic partial update, used by both AddScheduledFundScreen (name,
    // amount, frequency, accountId, nextDate for income funds) and the
    // MSI edit modal on ScheduledFundsScreen (name, nextDate only). Only
    // name/date are ever safe to change on an MSI after the purchase
    // already happened — totalAmount/months/monthlyAmount/paidMonths are
    // load-bearing for the debt math in useFinanceStore and confirmMSI
    // above, so callers simply never send those fields rather than this
    // function needing to filter them out.
    const updateScheduledFund = async (fundId, changes) => {
        const updated = scheduledFunds.map(f =>
            f.id === fundId ? { ...f, ...changes } : f
        );
        setScheduledFunds(updated);
        await saveData(KEY, updated);
    };

    // MSI Installments

    const addMSI = async ({ name, totalAmount, months, firstDate, accountId, creditCardId }) => {
        const monthly = totalAmount / months;
        const newMSI = {
            id: Date.now().toString(),
            type: 'msi',
            name,
            totalAmount: round2(totalAmount),
            months,
            monthlyAmount: round2(monthly),
            paidMonths: 0,
            nextDate: firstDate, // ISO string of first payment date
            accountId: accountId || null,
            creditCardId: creditCardId || null,
            createdAt: new Date().toISOString(),
        };
        const updated = [...scheduledFunds, newMSI];
        setScheduledFunds(updated);
        await saveData(KEY, updated);
        return newMSI;
    };

    // Confirm one MSI payment auto-removes when all months are paid
    const confirmMSI = async (msiId) => {
        let removed = false;
        const updated = scheduledFunds.reduce((acc, f) => {
            if (f.id !== msiId) { acc.push(f); return acc; }
            const newPaid = f.paidMonths + 1;
            if (newPaid >= f.months) {
                // All installments paid — drop it
                removed = true;
                return acc;
            }
            acc.push({
                ...f,
                paidMonths: newPaid,
                nextDate: addMonths(parseISO(f.nextDate), 1).toISOString(),
                lastConfirmed: new Date().toISOString(),
            });
            return acc;
        }, []);
        setScheduledFunds(updated);
        await saveData(KEY, updated);
        return { removed };
    };

    // Reset 

    const resetScheduledFunds = async () => {
        await removeData(KEY);
        setScheduledFunds([]);
    };

    // Currency switch (Settings → Moneda): rescales every real amount
    // by `rate`. `amount` belongs to income funds, `totalAmount`/
    // `monthlyAmount` to MSI — each only checked/converted when
    // present so this works for both shapes without branching on
    // `type`.
    const convertAllAmounts = async (rate) => {
        const updated = scheduledFunds.map(f => ({
            ...f,
            amount: f.amount != null ? round2(f.amount * rate) : f.amount,
            totalAmount: f.totalAmount != null ? round2(f.totalAmount * rate) : f.totalAmount,
            monthlyAmount: f.monthlyAmount != null ? round2(f.monthlyAmount * rate) : f.monthlyAmount,
        }));
        setScheduledFunds(updated);
        await saveData(KEY, updated);
    };

    // Funds that need attention (overdue or within 3 days) — both types
    const pendingFunds = scheduledFunds.filter(f => getFundStatus(f) !== 'ok');

    return {
        scheduledFunds,
        pendingFunds,
        addScheduledFund,
        updateScheduledFund,
        confirmFund,
        removeScheduledFund,
        addMSI,
        confirmMSI,
        getFundStatus,
        resetScheduledFunds,
        convertAllAmounts,
    };
}