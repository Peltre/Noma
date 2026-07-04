// Full log of transactions — tap any row for detail, edit, or delete
import { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Modal, TextInput, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import { Spacing, ACCOUNT_LABELS } from '../constants';
import createHistoryStyles from './HistoryScreen.styles';
import createSheetStyles from './HistorySheet.styles';
import DecimalInput from '../components/DecimalInput';

const FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'expense', label: 'Gastos' },
    { key: 'withdrawal', label: 'Retiros' },
    { key: 'income', label: 'Ingresos' },
];

// Only two accents with fixed meaning across the app: moneyIn/moneyOut.
// A withdrawal is neither, so it stays neutral — same rule as Home.
function getTypeConfig(theme, type) {
    if (type === 'income') return { glyph: '↓', bg: theme.moneyInSoft, fg: theme.moneyIn, label: 'Ingreso' };
    if (type === 'expense') return { glyph: '↑', bg: theme.moneyOutSoft, fg: theme.moneyOut, label: 'Gasto' };
    return { glyph: '→', bg: theme.border, fg: theme.muted, label: 'Retiro' };
}

// Small colored icon — glyph in colored box, no emoji
function TxnIcon({ type, theme, sheet, size = 36 }) {
    const cfg = getTypeConfig(theme, type);
    return (
        <View style={[
            sheet.txnIcon,
            { width: size, height: size, borderRadius: size * 0.3, backgroundColor: cfg.bg },
        ]}>
            <Text style={[sheet.txnGlyph, { color: cfg.fg }]}>{cfg.glyph}</Text>
        </View>
    );
}

// Dot + text badge
function TxnBadge({ type, theme, sheet }) {
    const cfg = getTypeConfig(theme, type);
    return (
        <View style={sheet.badge}>
            <View style={[sheet.badgeDot, { backgroundColor: cfg.fg }]} />
            <Text style={sheet.badgeText}>{cfg.label}</Text>
        </View>
    );
}

// ── Detail / edit bottom sheet ────────────────────────────────────
function TransactionSheet({ txn, onClose, accounts, creditCards, theme, sheet }) {
    const { deleteTransaction, updateTransaction } = useFinance();
    const [editing, setEditing] = useState(false);
    const [editReason, setReason] = useState(txn.reason);
    const [editAmount, setAmount] = useState(txn.amount.toString());

    const cfg = getTypeConfig(theme, txn.type);
    const isIncome = txn.type === 'income';

    const accountName = txn.creditCardId
        ? (creditCards.find(c => c.id === txn.creditCardId)?.name ?? 'Tarjeta')
        : (ACCOUNT_LABELS[accounts.find(a => a.id === txn.accountId)?.type] ?? '—');

    const handleDelete = () => {
        Alert.alert(
            'Eliminar transacción',
            `¿Eliminar "${txn.reason}"? Se revertirá el efecto en tu balance.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive', onPress: async () => {
                        await deleteTransaction(txn.id);
                        onClose();
                    }
                },
            ]
        );
    };

    const handleSave = async () => {
        const amt = parseFloat(editAmount);
        if (!editReason.trim()) { Alert.alert('Falta la razón'); return; }
        if (!amt || amt <= 0) { Alert.alert('Monto inválido'); return; }
        const result = await updateTransaction(txn.id, { reason: editReason.trim(), amount: amt });
        if (result?.error) { Alert.alert('Fondos insuficientes', result.error); return; }
        setEditing(false);
        onClose();
    };

    return (
        <Modal visible transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={sheet.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity style={sheet.scrim} activeOpacity={1} onPress={onClose} />

                <View style={sheet.panel}>
                    <View style={sheet.handle} />

                    {/* Icon + type */}
                    <TxnIcon type={txn.type} theme={theme} sheet={sheet} size={52} />
                    <Text style={[sheet.typeLabel, { color: cfg.fg }]}>{cfg.label}</Text>

                    {editing ? (
                        <>
                            <Text style={sheet.fieldLabel}>RAZÓN</Text>
                            <TextInput
                                style={sheet.input}
                                value={editReason}
                                onChangeText={setReason}
                                placeholder="Describe el movimiento"
                                placeholderTextColor={theme.muted}
                                autoFocus
                            />
                            <Text style={sheet.fieldLabel}>MONTO</Text>
                            <DecimalInput
                                style={[sheet.input, sheet.inputLarge]}
                                value={editAmount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                placeholderTextColor={theme.muted}
                            />
                            <View style={sheet.btnRow}>
                                <TouchableOpacity style={sheet.btnCancel} onPress={() => setEditing(false)}>
                                    <Text style={sheet.btnCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={sheet.btnPrimary} onPress={handleSave}>
                                    <Text style={sheet.btnPrimaryText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={[
                                sheet.amount,
                                txn.category === 'goal' ? { color: theme.savings }
                                    : txn.type === 'expense' && { color: theme.moneyOut },
                            ]}>
                                {isIncome ? '+' : '−'}{formatCurrency(txn.amount)}
                            </Text>
                            <Text style={sheet.reason}>{txn.reason}</Text>

                            <View style={sheet.detailList}>
                                <View style={sheet.detailRow}>
                                    <Text style={sheet.detailKey}>Fecha</Text>
                                    <Text style={sheet.detailVal}>
                                        {format(parseISO(txn.date), "d 'de' MMMM yyyy · HH:mm", { locale: es })}
                                    </Text>
                                </View>
                                <View style={sheet.detailRow}>
                                    <Text style={sheet.detailKey}>Cuenta</Text>
                                    <Text style={sheet.detailVal}>{accountName}</Text>
                                </View>
                                {txn.category && (
                                    <View style={[sheet.detailRow, { borderBottomWidth: 0 }]}>
                                        <Text style={sheet.detailKey}>Categoría</Text>
                                        <Text style={sheet.detailVal}>{txn.category}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={sheet.btnRow}>
                                <TouchableOpacity style={sheet.btnDanger} onPress={handleDelete}>
                                    <Text style={sheet.btnDangerText}>Eliminar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={sheet.btnPrimary} onPress={() => setEditing(true)}>
                                    <Text style={sheet.btnPrimaryText}>Editar</Text>
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
    const { theme } = useTheme();
    const styles = useMemo(() => createHistoryStyles(theme), [theme]);
    const sheet = useMemo(() => createSheetStyles(theme), [theme]);
    const [activeFilter, setFilter] = useState('all');
    const [selectedTxn, setSelectedTxn] = useState(null);
    const insets = useSafeAreaInsets();

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
    const totalExp = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalWd = thisMonth.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
    const totalInc = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Hero header — paddingTop absorbs status bar */}
                <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
                    <View style={styles.heroBar1} />
                    <View style={styles.heroBar2} />
                    <View style={styles.heroBar3} />
                    <Text style={styles.heroTitle}>Historial</Text>
                    <Text style={styles.heroSub}>
                        {format(now, "MMMM yyyy", { locale: es })} · {thisMonth.length} movimientos
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statCell}>
                            <Text style={[styles.statVal, { color: theme.moneyOut }]}>
                                {formatCurrencyShort(totalExp)}
                            </Text>
                            <Text style={styles.statLbl}>Gastos</Text>
                        </View>
                        <View style={[styles.statCell, styles.statCellMid]}>
                            <Text style={[styles.statVal, { color: theme.ink }]}>
                                {formatCurrencyShort(totalWd)}
                            </Text>
                            <Text style={styles.statLbl}>Retiros</Text>
                        </View>
                        <View style={styles.statCell}>
                            <Text style={[styles.statVal, { color: theme.moneyIn }]}>
                                {formatCurrencyShort(totalInc)}
                            </Text>
                            <Text style={styles.statLbl}>Ingresos</Text>
                        </View>
                    </View>
                </View>

                {/* Filters */}
                <View style={styles.filterWrap}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterRow}>
                            {FILTERS.map(f => (
                                <TouchableOpacity
                                    key={f.key}
                                    style={[styles.chip, activeFilter === f.key && styles.chipActive]}
                                    onPress={() => setFilter(f.key)}
                                >
                                    <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Grouped transactions */}
                {Object.keys(grouped).length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Sin movimientos</Text>
                        <Text style={styles.emptySub}>Tus transacciones aparecerán aquí</Text>
                    </View>
                ) : (
                    Object.entries(grouped).map(([month, txns]) => (
                        <View key={month}>
                            <Text style={styles.monthLabel}>{month}</Text>
                            <View style={styles.txnCard}>
                                {txns.map((txn, i) => {
                                    const isIncome = txn.type === 'income';
                                    const isLast = i === txns.length - 1;
                                    return (
                                        <TouchableOpacity
                                            key={txn.id}
                                            style={[styles.txnRow, isLast && styles.txnRowLast]}
                                            onPress={() => setSelectedTxn(txn)}
                                            activeOpacity={0.7}
                                        >
                                            <TxnIcon type={txn.type} theme={theme} sheet={sheet} />
                                            <View style={styles.txnInfo}>
                                                <Text style={styles.txnName} numberOfLines={1}>
                                                    {txn.reason}
                                                </Text>
                                                <Text style={styles.txnDate}>
                                                    {format(parseISO(txn.date), 'd MMM · HH:mm', { locale: es })}
                                                </Text>
                                            </View>
                                            <View style={styles.txnRight}>
                                                <Text style={[
                                                    styles.txnAmount,
                                                    isIncome ? styles.amountPos
                                                        : txn.category === 'goal' ? { color: theme.savings }
                                                            : txn.type === 'expense' ? styles.amountExpense
                                                                : styles.amountNeg,
                                                ]}>
                                                    {isIncome ? '+' : '−'}{formatCurrencyShort(txn.amount)}
                                                </Text>
                                                <TxnBadge type={txn.type} theme={theme} sheet={sheet} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))
                )}

                <View style={{ height: Spacing.xl }} />
            </ScrollView>

            {selectedTxn && (
                <TransactionSheet
                    txn={selectedTxn}
                    onClose={() => setSelectedTxn(null)}
                    accounts={accounts}
                    creditCards={creditCards}
                    theme={theme}
                    sheet={sheet}
                />
            )}
        </View>
    );
}