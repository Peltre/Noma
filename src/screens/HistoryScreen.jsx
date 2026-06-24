// Full log of transactions, you can filter them 
// Also will provide a brief summary of this months earnings & expenses
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO, isSameMonth } from 'date-fns';
import { es } from 'date-fns';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency, formatCurrencyShort } from '../utils';
import styles from './HistoryScreen.styles';

// Filters available at the top
const FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'expense', label: 'Gastos' },
    { key: 'withdrawal', label: 'Retiros' },
    { key: 'income', label: 'Ingresos' },
];

// Emoji & badge style according to type
const TYPE_CONFIG = {
    income: { emoji: '💰', badge: styles.badgeIngreso, label: 'Ingreso' },
    expense: { emoji: '🛍️', badge: styles.badgeGasto, label: 'Gasto' },
    withdrawal: { emoji: '💸', badge: styles.badgeRetiro, label: 'Retiro' }, 
};

import { useState } from 'react';

export default function HistoryScreen() {
    const { transactions } = useFinanceStore();
    const [activeFilter, setFilter] = useState('all');

    // Filter transactions according to tab
    const filtered = activeFilter === 'all'
        ? transactions
        : transactions.filter(t => t.type === activeFilter);

    // Group transactions by month
    const grouped = filtered.reduce((acc, txn) => {
        const monthKey = format(parseISO(txn.date), 'MMMM yyyy', { locale: es })
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(txn)
        return acc;
    }, {});

    // Calculate metrics from past months for the stats bar
    const now = newDate();
    const thisMonthTxns = transactions.filter(t =>
        isSameMonth(parseISO(t.date), now)
    );
    const totalExpenses = thisMonthTxns
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
    const totalWithdrawals = thisMonthTxns
        .filter(t => t.type === 'withdrawal')
        .reduce((s, t) => s + t.amount, 0);
    const totalIncome = thisMonthTxns
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0)

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header & filters */}
                <View style={styles.header}>
                    <Text style={styles.title}>Historial</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        <View style={styles.filterRow}>
                            {FILTERS.map(f => (
                                <TouchableOpacity
                                    key={f.key}
                                    style={[
                                        styles.filterChip,
                                        activeFilter === f.key && styles.filterChipActive
                                    ]}
                                    onPress={() => setFilter(f.key)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            activeFilter === f.key && styles.filterChipTextActive,
                                        ]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Current Month stats */}
                <View style={styles.statsBar}>
                    <View style={styles.statCell}>
                        <Text style={[styles.statValue, styles.statValueNeg]}>
                            {formatCurrency(totalExpenses)}
                        </Text>
                        <Text style={styles.statLabel}>Gastos</Text>
                    </View>
                    <View style={styles.statCell}>
                        <Text style={[styles.statValue, styles.statValueNeg]}>
                            {formatCurrencyShort(totalWithdrawals)}
                        </Text>
                        <Text style={styles.statLabel}>Retiros</Text>
                    </View>
                    <View style={[styles.statCell, styles.statCellLast]}>
                        <Text style={[styles.statValue, styles.statValuePos]}>
                            {formatCurrencyShort(totalIncome)}
                        </Text>
                        <Text style={styles.statLabel}>Ingresos</Text>
                    </View>
                </View>

                {/* List grouped by month */}
                {Object.keys(grouped).length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📋</Text>
                        <Text style={styles.emptyText}>Sin movimientos</Text>
                        <Text style={styles.emptySubtext}>
                            Tus transacciones aparecerán aquí
                        </Text>
                    </View>
                ) : (
                    Object.entries(grouped).map(([month, txns]) => (
                        <View key={month}>
                            <Text style={styles.monthLabel}>{month}</Text>
                            <View style={styles.txnCard}>
                                {txns.map((txn, index) => {
                                    const config = TYPE_CONFIG[txn.type];
                                    const isLast = index === txns.length - 1;
                                    const isIncome = txn.type === 'income';

                                    return (
                                        <View
                                            key={txn.id}
                                            style={[
                                                styles.txnItem,
                                                isLast && styles.txnItemLast,
                                            ]}
                                        >
                                        
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
