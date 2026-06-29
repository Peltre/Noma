// Full log of transactions — tap any row for detail, edit, or delete
import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Modal, TextInput, Alert, Platform, KeyboardAvoidingView, StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
    income: { glyph: '↓', bgColor: Colors.tealLt, fgColor: Colors.teal, label: 'Ingreso' },
    expense: { glyph: '↑', bgColor: Colors.coralLt, fgColor: Colors.coral, label: 'Gasto' },
    withdrawal: { glyph: '→', bgColor: Colors.goldLt, fgColor: Colors.gold, label: 'Retiro' },
};

// Small colored icon — glyph in colored box, no emoji
function TxnIcon({ type, size = 36 }) {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.expense;
    return (
        <View style={[
            sheet.txnIcon,
            { width: size, height: size, borderRadius: size * 0.3, backgroundColor: cfg.bgColor },
        ]}>
            <Text style={[sheet.txnGlyph, { color: cfg.fgColor }]}>{cfg.glyph}</Text>
        </View>
    );
}

// Dot + text badge
function TxnBadge({ type }) {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.expense;
    return (
        <View style={sheet.badge}>
            <View style={[sheet.badgeDot, { backgroundColor: cfg.fgColor }]} />
            <Text style={sheet.badgeText}>{cfg.label}</Text>
        </View>
    );
}

// ── Detail / edit bottom sheet ────────────────────────────────────
function TransactionSheet({ txn, onClose, accounts, creditCards }) {
    const { deleteTransaction, updateTransaction } = useFinance();
    const [editing, setEditing] = useState(false);
    const [editReason, setReason] = useState(txn.reason);
    const [editAmount, setAmount] = useState(txn.amount.toString());

    const cfg = TYPE_CONFIG[txn.type] || TYPE_CONFIG.expense;
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
        await updateTransaction(txn.id, { reason: editReason.trim(), amount: amt });
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
                    <TxnIcon type={txn.type} size={52} />
                    <Text style={[sheet.typeLabel, { color: cfg.fgColor }]}>{cfg.label}</Text>

                    {editing ? (
                        <>
                            <Text style={sheet.fieldLabel}>RAZÓN</Text>
                            <TextInput
                                style={sheet.input}
                                value={editReason}
                                onChangeText={setReason}
                                placeholder="Describe el movimiento"
                                placeholderTextColor={Colors.muted}
                                autoFocus
                            />
                            <Text style={sheet.fieldLabel}>MONTO</Text>
                            <TextInput
                                style={[sheet.input, sheet.inputLarge]}
                                value={editAmount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                placeholder="0.00"
                                placeholderTextColor={Colors.muted}
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
                            <Text style={sheet.amount}>
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

                {/* Dark hero header — paddingTop absorbs status bar */}
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
                            <Text style={[styles.statVal, { color: '#E07070' }]}>
                                {formatCurrencyShort(totalExp)}
                            </Text>
                            <Text style={styles.statLbl}>Gastos</Text>
                        </View>
                        <View style={[styles.statCell, styles.statCellMid]}>
                            <Text style={[styles.statVal, { color: '#CFA040' }]}>
                                {formatCurrencyShort(totalWd)}
                            </Text>
                            <Text style={styles.statLbl}>Retiros</Text>
                        </View>
                        <View style={styles.statCell}>
                            <Text style={[styles.statVal, { color: '#3EC4BE' }]}>
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
                                            <TxnIcon type={txn.type} />
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
                                                    isIncome ? styles.amountPos : styles.amountNeg,
                                                ]}>
                                                    {isIncome ? '+' : '−'}{formatCurrencyShort(txn.amount)}
                                                </Text>
                                                <TxnBadge type={txn.type} />
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
                />
            )}
        </View>
    );
}

// Sheet styles (local, not shared)
const sheet = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scrim: { ...StyleSheet.absoluteFillObject },
    panel: {
        backgroundColor: Colors.paper,
        borderTopLeftRadius: Radius.lg,
        borderTopRightRadius: Radius.lg,
        padding: Spacing.lg,
        paddingBottom: 40,
        alignItems: 'center',
    },
    handle: {
        width: 36, height: 4,
        borderRadius: 2,
        backgroundColor: Colors.mid,
        marginBottom: Spacing.lg,
    },
    txnIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    txnGlyph: {
        fontSize: 22,
        fontWeight: '800',
    },
    typeLabel: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: Spacing.xs,
    },
    amount: {
        fontSize: 36,
        fontWeight: '900',
        color: Colors.ink,
        letterSpacing: -1.5,
        marginBottom: Spacing.xs,
    },
    reason: {
        fontSize: FontSize.md,
        color: Colors.muted,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    detailList: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.mid,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.mid,
    },
    detailKey: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: '500' },
    detailVal: { fontSize: FontSize.sm, color: Colors.ink, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: Spacing.md },
    fieldLabel: {
        alignSelf: 'flex-start',
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    input: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.ink,
        borderWidth: 1,
        borderColor: Colors.mid,
    },
    inputLarge: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    btnRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        width: '100%',
        marginTop: Spacing.sm,
    },
    btnPrimary: {
        flex: 2, height: 52, borderRadius: Radius.sm,
        backgroundColor: Colors.ink,
        justifyContent: 'center', alignItems: 'center',
    },
    btnPrimaryText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
    btnCancel: {
        flex: 1, height: 52, borderRadius: Radius.sm,
        backgroundColor: Colors.mid,
        justifyContent: 'center', alignItems: 'center',
    },
    btnCancelText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.ink },
    btnDanger: {
        flex: 1, height: 52, borderRadius: Radius.sm,
        backgroundColor: Colors.coralLt,
        justifyContent: 'center', alignItems: 'center',
    },
    btnDangerText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.coral },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(15,14,12,0.07)',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    badgeDot: { width: 5, height: 5, borderRadius: 3 },
    badgeText: {
        fontSize: FontSize.xs - 1,
        fontWeight: '700',
        color: Colors.ink,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
});