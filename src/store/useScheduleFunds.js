// Manages scheduled income reminders AND MSI (months without interest) installments
// Nothing executes automatically — user confirms each payment from the Home screen

import { useState, useEffect } from "react";
import { saveData, loadData, removeData } from "./storage";
import { addMonths, parseISO, startOfDay, differenceInDays, addDays } from "date-fns";

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

    // MSI Installments

    const addMSI = async ({ name, totalAmount, months, firstDate, accountId, creditCardId }) => {
        const monthly = totalAmount / months;
        const newMSI = {
            id: Date.now().toString(),
            type: 'msi',
            name,
            totalAmount,
            months,
            monthlyAmount: parseFloat(monthly.toFixed(2)),
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

    // Funds that need attention (overdue or within 3 days) — both types
    const pendingFunds = scheduledFunds.filter(f => getFundStatus(f) !== 'ok');

    return {
        scheduledFunds,
        pendingFunds,
        addScheduledFund,
        confirmFund,
        removeScheduledFund,
        addMSI,
        confirmMSI,
        getFundStatus,
        resetScheduledFunds,
    };
}