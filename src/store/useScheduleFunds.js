// File to manage programmed incomem doenst execute anything, its just the custom hook that makes & stores

import { useState, useEffect } from "react";
import { saveData, loadData } from "./storage";
import { addDays, addMonths, parseISO, startOfDay, differenceInDays, parse } from "date-fns";

const KEY = 'scheduledFunds';

export function useScheduledFunds() {
    const [scheduledFunds, setScheduledFunds] = useState([]);

    useEffect(() => {
        const load = async () => {
            const saved = await loadData(KEY)
            setScheduledFunds(saved || []);
        };
        load();
    }, []);

    // Calculate next date based on frequency
    const getNextDate = (frequency, fromDate) => {
        switch (frequency) {
            case 'weekly': return addDays(fromDate, 7);
            case 'biweekly': return addDays(fromDate, 14);
            case 'monthly': return addMonths(fromDate, 1);
            default: return addDays(fromDate, 14); // set biweekly to default
        }
    };

    // Return status of a fund based on its next date
    // 'overdue' - date has passed, 'upcoming' within 3 days, 'ok' more than 3 days away
    const getFundStatus = (fund) => {
        const today = startOfDay(new Date());
        const next = startOfDay(parseISO(fund.nextDate));
        const diff = differenceInDays(next, today);

        if (diff < 0) return 'overdue';
        if (diff <= 3) return 'upcoming';
        return 'ok';
    };

    // Create a new scheduled fund
    const addScheduledFund = async (fund) => {
        const newFund = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...fund,
        };
        const updated = [...scheduledFunds, newFund];
        setScheduledFunds(updated);
        await saveData(KEY, updated);
    };

    // Called after user confirms a fund payment
    const confirmFund = async (fundId) => {
        const updated = scheduledFunds.map(f => {
            if (f.id !== fundId) return f;
            const currentNext = parseISO(f.nextDate);
            return {
                ...f,
                nextDate: getNextDate(f.frequency, currentNext).toISOString(),
                lastConfirmed: new Date().toISOString(),
            };
        });
        setScheduledFunds(updated);
        await saveData(KEY, updated);
    };

    // Delete a scheduled fund
    const removeScheduledFund = async (fundId) => {
        const updated = scheduledFunds.filter(f => f.id !== fundId);
        setScheduledFunds(updated);
        await saveData(KEY, updated);
    };

    // Funds that need attention (overdye / upcoming)
    const pendingFunds = scheduledFunds.filter(f =>
        getFundStatus(f) !== 'ok'
    );

    return {
        scheduledFunds,
        pendingFunds,
        addScheduledFund,
        confirmFund,
        removeScheduledFund,
        getFundStatus,
    };
}