// Full log of transactions — tap any row to see detail, edit, or delete
import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Modal, TextInput, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { useFinance } from '../store/FinanceContext';
import { Colors, FontSize, Spacing, Radius, Shadow, ACCOUNT_LABELS } from '../constants';
import styles from './HistoryScreen.styles';

const FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'expense', label: 'Gastos' },
    { key: 'withdrawal', label: 'Retiros' },
    { key: 'income', label: 'Ingresos' },
];

const TYPE_CONFIG = {
    income: { emoji: '💰', badge: styles.badgeIngreso, label: 'Ingreso', color: Colors.sage },
    expense: { emoji: '🛍️', badge: styles.badgeGasto, label: 'Gasto', color: Colors.red },
    withdrawal: { emoji: '💸', badge: styles.badgeRetiro, label: 'Retiro', color: Colors.amber },
};


// Transaction detail / edit bottom sheet 
function TransactionSheet({ txn, onClose, accounts, creditCards }) {
    const { deleteTransaction, updateTransaction } = useFinance();
    const [editing, setEditing] = useState(false);
    const [editReason, setEditReason] = useState(txn.reason);
    const [editAmount, setEditAmount] = useState(txn.amount.toString());

    if (!txn) return null;
    const config = TYPE_CONFIG[txn.type];
    const isIncome = txn.type === 'income';

    const accountName = txn.creditCardId
        ? creditCards.find(c => c.id === txn.creditCardId)?.name ?? 'Tarjeta'
        : ACCOUNT_LABELS[accounts.find(a => a.id === txn.accountId)?.type] ?? '—';

    const handleDelete = () => {
        Alert.alert(
            'Eliminar transacción',
            `¿Eliminar "${txn.reason}"? Se revertirá el efecto en tu balance.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive',
                    onPress: async () => {
                        await deleteTransaction(txn.id);
                        onClose();
                    },
                },
            ]
        );
    };

    const handleSave = async () => {
        const amt = parseFloat(editAmount);
        if (!editReason.trim()) { Alert.alert('Falta la razón'); return; }
        if (!amt || amt <= 0) { Alert.alert('Monto inválido'); return; }
        await updateTransaction(txn.id, { reason: editReason.trim(), amount: amt });
        setEditing(false);
        onClose();
    };

    return (
        <Modal visible transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.sheetBg}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Tap outside to close */}
                <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.sheet}>
                    {/* Drag handle */}
                    <View style={styles.sheetHandle} />

                    {/* Icon + type */}
                    <View style={[styles.sheetIconWrap, {
                        backgroundColor: txn.type === 'income' ? Colors.sageLt
                            : txn.type === 'expense' ? Colors.redLt : Colors.amberLt
                    }]}>
                        <Text style={styles.sheetIcon}>{config.emoji}</Text>
                    </View>
                    <Text style={[styles.sheetType, { color: config.color }]}>{config.label}</Text>

                    {editing ? (
                        /* Edit mode */
                        <>
                            <Text style={styles.sheetFieldLabel}>RAZÓN</Text>
                            <TextInput
                                style={styles.sheetInput}
                                value={editReason}
                                onChangeText={setEditReason}
                                placeholder="Describe el movimiento"
                                placeholderTextColor={Colors.muted}
                                autoFocus
                            />
                            <Text style={styles.sheetFieldLabel}>MONTO</Text>
                            <TextInput
                                style={[styles.sheetInput, styles.sheetInputLarge]}
                                value={editAmount}
                                onChangeText={setEditAmount}
                                keyboardType="decimal-pad"
                                placeholder="0.00"
                                placeholderTextColor={Colors.muted}
                            />
                            <View style={styles.sheetBtnRow}>
                                <TouchableOpacity style={styles.sheetBtnSecondary} onPress={() => setEditing(false)}>
                                    <Text style={styles.sheetBtnSecondaryText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sheetBtnPrimary} onPress={handleSave}>
                                    <Text style={styles.sheetBtnPrimaryText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        /* Detail mode */
                        <>
                            <Text style={styles.sheetAmount}>
                                {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                            </Text>
                            <Text style={styles.sheetReason}>{txn.reason}</Text>

                            {/* Detail rows */}
                            <View style={styles.detailRows}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Fecha</Text>
                                    <Text style={styles.detailVal}>
                                        {format(parseISO(txn.date), "d 'de' MMMM yyyy · HH:mm", { locale: es })}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Cuenta</Text>
                                    <Text style={styles.detailVal}>{accountName}</Text>
                                </View>
                                {txn.category && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailKey}>Categoría</Text>
                                        <Text style={styles.detailVal}>{txn.category}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.sheetBtnRow}>
                                <TouchableOpacity style={styles.sheetBtnDanger} onPress={handleDelete}>
                                    <Text style={styles.sheetBtnDangerText}>Eliminar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sheetBtnPrimary} onPress={() => setEditing(true)}>
                                    <Text style={styles.sheetBtnPrimaryText}>Editar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Main screen
export default function HistoryScreen() {
    const { transactions, accounts, creditCards } = useFinance();
    const [activeFilter, setFilter] = useState('all');
    const [selectedTxn, setSelectedTxn] = useState(null);

    const filtered = activeFilter === 'all'
        ? transactions
        : transactions.filter(t => t.type === activeFilter);

    const grouped = filtered.reduce((acc, txn) => {
        const key = format(parseISO(txn.date), 'MMMM yyyy', { locale: es });
        if (!acc[key]) acc[key] = [];
        acc[key].push(txn);
        return acc;
    }, {});

    const now = new Date();
    const thisMonth = transactions.filter(t => isSameMonth(parseISO(t.date), now));
    const totalExpenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalWithdrawals = thisMonth.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
    const totalIncome = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header & filters */}
                <View style={styles.header}>
                    <Text style={styles.title}>Historial</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterRow}>
                            {FILTERS.map(f => (
                                <TouchableOpacity
                                    key={f.key}
                                    style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
                                    onPress={() => setFilter(f.key)}
                                >
                                    <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Stats bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statCell}>
                        <Text style={[styles.statValue, styles.statValueNeg]}>{formatCurrency(totalExpenses)}</Text>
                        <Text style={styles.statLabel}>Gastos</Text>
                    </View>
                    <View style={styles.statCell}>
                        <Text style={[styles.statValue, styles.statValueNeg]}>{formatCurrencyShort(totalWithdrawals)}</Text>
                        <Text style={styles.statLabel}>Retiros</Text>
                    </View>
                    <View style={[styles.statCell, styles.statCellLast]}>
                        <Text style={[styles.statValue, styles.statValuePos]}>{formatCurrencyShort(totalIncome)}</Text>
                        <Text style={styles.statLabel}>Ingresos</Text>
                    </View>
                </View>

                {/* Transactions grouped by month */}
                {Object.keys(grouped).length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📋</Text>
                        <Text style={styles.emptyText}>Sin movimientos</Text>
                        <Text style={styles.emptySubtext}>Tus transacciones aparecerán aquí</Text>
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
                                        <TouchableOpacity
                                            key={txn.id}
                                            style={[styles.txnItem, isLast && styles.txnItemLast]}
                                            onPress={() => setSelectedTxn(txn)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[
                                                styles.txnIcon,
                                                txn.type === 'income' ? styles.txnIconIncome
                                                    : txn.type === 'expense' ? styles.txnIconExpense
                                                        : styles.txnIconWithdrawal,
                                            ]}>
                                                <Text style={styles.txnIconEmoji}>{config.emoji}</Text>
                                            </View>
                                            <View style={styles.txnInfo}>
                                                <Text style={styles.txnName} numberOfLines={1}>{txn.reason}</Text>
                                                <Text style={styles.txnSub}>
                                                    {format(parseISO(txn.date), 'd MMM · HH:mm', { locale: es })}
                                                </Text>
                                            </View>
                                            <View style={styles.txnRight}>
                                                <Text style={[styles.txnAmount, isIncome ? styles.amountPos : styles.amountNeg]}>
                                                    {isIncome ? '+' : '-'}{formatCurrencyShort(txn.amount)}
                                                </Text>
                                                <Text style={[styles.badge, config.badge]}>{config.label}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))
                )}
                <View style={styles.bottomPadding} />
            </ScrollView>

            {selectedTxn && (
                <TransactionSheet
                    txn={selectedTxn}
                    onClose={() => setSelectedTxn(null)}
                    accounts={accounts}
                    creditCards={creditCards}
                />
            )}
        </SafeAreaView>
    );
}