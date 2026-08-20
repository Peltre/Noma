// Full log of transactions — tap any row for detail, edit, or delete
import { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Modal, TextInput, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO, isSameMonth, isSameWeek, isSameYear, addMonths, addWeeks, addYears, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import { Spacing, getCategoryLabel, getTagIcon } from '../constants';
import createHistoryStyles from './HistoryScreen.styles';
import createSheetStyles from './HistorySheet.styles';
import DecimalInput from '../components/DecimalInput';
import SelectField from '../components/SelectField';
import GlassCard from '../components/GlassCard';
import {
    IconSwap, IconCash, IconCalendarClock, IconReceipt, IconWallet, IconBanknotePlus, IconPercent, IconSavings,
    IconChevronLeft, IconChevronRight, IconChevronDown, IconCheck,
} from '../components/Icons';

// Type filter. card_payment/msi are `type: 'withdrawal'` underneath
// (see getTypeConfig below) so they need their own category-based
// entries here. No 'withdrawal'/Retiros entry — nothing in the app
// creates a plain withdrawal (no category), so that filter could
// never return anything. See getTypeConfig's fallback below and
// TransactionScreen.jsx's getTypes() for where that's decided.
const TYPE_FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'expense', label: 'Gastos' },
    { key: 'income', label: 'Ingresos' },
    { key: 'transfer', label: 'Traspasos' },
    { key: 'card_payment', label: 'Pagos de tarjeta' },
    { key: 'msi', label: 'Mensualidades' },
];
// Filter keys that match on category instead of type.
const CATEGORY_FILTER_KEYS = ['card_payment', 'msi'];

// Period filter — independent of type, both apply together. 'all' is
// the default; the other three narrow to the current week/month/year.
const PERIOD_FILTERS = [
    { key: 'all', label: 'Todo el tiempo' },
    { key: 'week', label: 'Esta semana' },
    { key: 'month', label: 'Este mes' },
    { key: 'year', label: 'Este año' },
];

// moneyIn/moneyOut are the only fixed-meaning accents. A plain
// withdrawal is neither, so it stays neutral. Transfer gets its own
// `transfer` accent — still your own money, so a darker/more
// saturated version of moneyIn's teal, never identical to Ingreso. A
// card payment or MSI installment is a `type: 'withdrawal'` underneath
// (see HomeScreen's getTxnVisual) but gets its own label/accent
// instead of sharing moneyOut with a plain Gasto — kept in sync with
// getTxnVisual there.
function getTypeConfig(theme, type, category) {
    if (category === 'msi') return { Icon: IconCalendarClock, bg: theme.msiSoft, fg: theme.msi, label: 'Mensualidad' };
    if (category === 'card_payment') return { Icon: IconCash, bg: theme.cardPaymentSoft, fg: theme.cardPayment, label: 'Pago de tarjeta' };
    // Interest is a real income transaction but app-generated, so it
    // gets the same `savings` accent as everywhere else interest shows up.
    if (category === 'interest') return { Icon: IconPercent, bg: theme.savingsSoft, fg: theme.savings, label: 'Interés' };
    // A goal purchase is really `type: 'expense'` underneath (see
    // useFinanceStore's addTransactionsBatch), but it's money already
    // set aside, not a new outflow — same savings accent as Interés,
    // so it doesn't read (icon or amount) as a plain Gasto.
    if (category === 'goal') return { Icon: IconSavings, bg: theme.savingsSoft, fg: theme.savings, label: 'Objetivo cumplido' };
    if (type === 'income') return { Icon: IconBanknotePlus, bg: theme.moneyInSoft, fg: theme.moneyIn, label: 'Ingreso' };
    if (type === 'expense') return { Icon: IconReceipt, bg: theme.moneyOutSoft, fg: theme.moneyOut, label: 'Gasto' };
    if (type === 'transfer') return { Icon: IconSwap, bg: theme.transferSoft, fg: theme.transfer, label: 'Traspaso' };
    // Unreachable in practice — nothing creates a `type: 'withdrawal'`
    // transaction without card_payment/msi as its category (see
    // TransactionScreen.jsx's getTypes()). Kept only as a safe
    // fallback for any type/category combo that doesn't match above.
    return { Icon: IconWallet, bg: theme.border, fg: theme.muted, label: 'Movimiento' };
}

// Small colored icon box — no emoji, no text glyph
function TxnIcon({ type, category, theme, sheet, size = 36 }) {
    const cfg = getTypeConfig(theme, type, category);
    return (
        <View style={[
            sheet.txnIcon,
            { width: size, height: size, borderRadius: size * 0.3, backgroundColor: cfg.bg },
        ]}>
            <cfg.Icon color={cfg.fg} bgColor={theme.surface} size={size * 0.44} />
        </View>
    );
}

// Same field box SelectField renders (so Tipo/Periodo still look like
// a matched pair), but with chevron-left/right fused into the same
// capsule for quick stepping through the current granularity.
// Tapping the center label still opens a picker for the granularity
// itself (Semana/Mes/Año/Todo) — same sheet pattern SelectField uses,
// just inlined here since it also needs the step buttons on either side.
function PeriodField({
    label, options, value, periodLabel,
    onChangeGranularity, onStepBack, onStepForward, canStep, canStepForward,
    styles, theme,
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <View style={styles.periodField}>
                {canStep ? (
                    <TouchableOpacity onPress={onStepBack} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
                        <IconChevronLeft color={theme.muted} size={16} />
                    </TouchableOpacity>
                ) : <View style={{ width: 16 }} />}

                <TouchableOpacity style={styles.periodCenter} onPress={() => setOpen(true)} activeOpacity={0.7}>
                    <Text style={styles.periodLabel}>{label}</Text>
                    <Text style={styles.periodValue} numberOfLines={1}>{periodLabel}</Text>
                </TouchableOpacity>

                {canStep ? (
                    <TouchableOpacity
                        onPress={onStepForward}
                        disabled={!canStepForward}
                        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                    >
                        <IconChevronRight color={canStepForward ? theme.muted : theme.border} size={16} />
                    </TouchableOpacity>
                ) : <View style={{ width: 16 }} />}
            </View>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity style={styles.periodBackdrop} activeOpacity={1} onPress={() => setOpen(false)} />
                <View style={styles.periodSheet}>
                    <View style={styles.periodSheetHandle} />
                    <Text style={styles.periodSheetTitle}>{label}</Text>
                    {options.map(opt => {
                        const isSelected = opt.key === value;
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                style={styles.periodOption}
                                onPress={() => { onChangeGranularity(opt.key); setOpen(false); }}
                            >
                                <Text style={[styles.periodOptionText, isSelected && { color: theme.brand, fontWeight: '800' }]}>
                                    {opt.label}
                                </Text>
                                {isSelected && <IconCheck color={theme.brand} size={14} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Modal>
        </>
    );
}

// ── Detail / edit bottom sheet ────────────────────────────────────
function TransactionSheet({ txn, onClose, accounts, creditCards, tags, theme, sheet }) {
    const { deleteTransaction, updateTransaction } = useFinance();
    const [editing, setEditing] = useState(false);
    const [editReason, setReason] = useState(txn.reason);
    const [editAmount, setAmount] = useState(txn.amount.toString());

    const cfg = getTypeConfig(theme, txn.type, txn.category);
    const isIncome = txn.type === 'income';
    const isTransfer = txn.type === 'transfer';

    const accountName = isTransfer
        ? `${accounts.find(a => a.id === txn.accountId)?.name ?? '—'} → ${accounts.find(a => a.id === txn.toAccountId)?.name ?? '—'}`
        : txn.creditCardId
            ? (creditCards.find(c => c.id === txn.creditCardId)?.name ?? 'Tarjeta')
            : (accounts.find(a => a.id === txn.accountId)?.name ?? '—');

    // Full tag objects (icon + label), not just the ids the
    // transaction stores — resolved against the live tags list so a
    // renamed/re-iconed tag always shows current, not stale, info.
    const txnTags = (txn.tagIds || [])
        .map(id => tags.find(t => t.id === id))
        .filter(Boolean);

    const handleDelete = () => {
        Alert.alert(
            'Eliminar transacción',
            `¿Eliminar "${txn.reason}"? Se revertirá el efecto en tu balance.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive', onPress: async () => {
                        const result = await deleteTransaction(txn.id);
                        if (result?.error) {
                            Alert.alert('No se pudo eliminar', result.error);
                            return;
                        }
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
                    <TxnIcon type={txn.type} category={txn.category} theme={theme} sheet={sheet} size={52} />
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
                            <Text style={[sheet.amount, { color: cfg.fg }]}>
                                {isIncome ? '+' : isTransfer ? '' : '−'}{formatCurrency(txn.amount)}
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
                                        <Text style={sheet.detailVal}>{getCategoryLabel(txn.type, txn.category)}</Text>
                                    </View>
                                )}
                            </View>

                            {txnTags.length > 0 && (
                                <>
                                    <Text style={sheet.fieldLabel}>ETIQUETAS</Text>
                                    <View style={sheet.tagsWrap}>
                                        {txnTags.map(tag => {
                                            const TagIcon = getTagIcon(tag.icon);
                                            return (
                                                <View key={tag.id} style={sheet.tagPill}>
                                                    <TagIcon color={theme.brand} size={13} />
                                                    <Text style={sheet.tagPillText}>{tag.label}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </>
                            )}

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
    const { transactions, accounts, creditCards, tags } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createHistoryStyles(theme), [theme]);
    const sheet = useMemo(() => createSheetStyles(theme), [theme]);
    const [typeFilter, setTypeFilter] = useState('all');
    // Defaults to 'month' — Historial opens on the current month, per
    // the actual intent of this screen (see PERIOD_FILTERS below for
    // the other granularities reachable from PeriodField's picker).
    const [periodFilter, setPeriodFilter] = useState('month');
    // How many units of the CURRENT periodFilter's granularity to go
    // back from today — 0 is the current week/month/year. Reset to 0
    // whenever periodFilter itself changes (see PeriodField's
    // onChangeGranularity below), so switching from Mes to Año
    // doesn't carry over a "3 months back" offset that means
    // something different in years.
    const [periodOffset, setPeriodOffset] = useState(0);
    const [selectedTxn, setSelectedTxn] = useState(null);
    const insets = useSafeAreaInsets();
    const now = new Date();
    const viewedDate = periodFilter === 'week' ? addWeeks(now, periodOffset)
        : periodFilter === 'year' ? addYears(now, periodOffset)
            : addMonths(now, periodOffset); // 'month' and 'all' both just need a reference date
    const canGoForward = periodOffset < 0;

    // Single place that decides whether a transaction falls in the
    // currently viewed period — used both for the header stats
    // (ignores typeFilter) and the scrollable list (applied on top of
    // typeFilter below), so the two can't disagree about what "this
    // period" means.
    const matchesPeriod = (t) => {
        if (periodFilter === 'all') return true;
        const d = parseISO(t.date);
        if (periodFilter === 'week') return isSameWeek(d, viewedDate, { locale: es });
        if (periodFilter === 'month') return isSameMonth(d, viewedDate);
        if (periodFilter === 'year') return isSameYear(d, viewedDate);
        return true;
    };

    // Type and period apply together (AND, not OR) — e.g. "Gastos" +
    // "Esta semana" shows only this week's expenses, not every
    // expense plus everything from this week.
    const byType = typeFilter === 'all'
        ? transactions
        : CATEGORY_FILTER_KEYS.includes(typeFilter)
            ? transactions.filter(t => t.category === typeFilter)
            : transactions.filter(t => t.type === typeFilter);

    const filtered = byType.filter(matchesPeriod);

    const grouped = filtered.reduce((acc, txn) => {
        const key = format(parseISO(txn.date), 'MMMM yyyy', { locale: es });
        if (!acc[key]) acc[key] = [];
        acc[key].push(txn);
        return acc;
    }, {});

    // Stats follow periodFilter/periodOffset directly, same as the
    // list above — just never narrowed by typeFilter, so Gastos/
    // Ingresos always summarize the whole period regardless of which
    // "Tipo" happens to be selected.
    const periodTxns = transactions.filter(matchesPeriod);
    const totalExp = periodTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalInc = periodTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const netBalance = totalInc - totalExp;
    const netColor = netBalance > 0 ? theme.moneyIn : netBalance < 0 ? theme.moneyOut : theme.ink;

    // What PeriodField actually displays for the current periodFilter.
    let periodLabel;
    if (periodFilter === 'all') {
        periodLabel = 'Todo el tiempo';
    } else if (periodFilter === 'year') {
        periodLabel = format(viewedDate, 'yyyy');
    } else if (periodFilter === 'week') {
        const weekStart = startOfWeek(viewedDate, { locale: es });
        const weekEnd = endOfWeek(viewedDate, { locale: es });
        periodLabel = isSameMonth(weekStart, weekEnd)
            ? `${format(weekStart, 'd', { locale: es })}–${format(weekEnd, 'd MMM', { locale: es })}`
            : `${format(weekStart, 'd MMM', { locale: es })} – ${format(weekEnd, 'd MMM', { locale: es })}`;
    } else {
        periodLabel = format(viewedDate, 'MMMM yyyy', { locale: es });
    }

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Plain header — just the title. No fixed month
                    subtitle anymore since PeriodField below already
                    says which period is active. */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <Text style={styles.title}>Historial</Text>
                </View>

                {/* Filters sit at the top, right under the title —
                    Tipo and Periodo side by side, same pair as
                    before. Periodo is now a PeriodField: its fused
                    arrows step through periodOffset, and periodTxns/
                    totalExp/totalInc below follow it directly, so the
                    stats always match whatever period is showing here. */}
                <View style={styles.filterWrap}>
                    <View style={styles.filterRow}>
                        <SelectField
                            label="Tipo"
                            value={typeFilter}
                            options={TYPE_FILTERS}
                            onChange={setTypeFilter}
                            style={{ flex: 1 }}
                        />
                        <PeriodField
                            label="Periodo"
                            options={PERIOD_FILTERS}
                            value={periodFilter}
                            periodLabel={periodLabel}
                            onChangeGranularity={(v) => { setPeriodFilter(v); setPeriodOffset(0); }}
                            onStepBack={() => setPeriodOffset(o => o - 1)}
                            onStepForward={() => canGoForward && setPeriodOffset(o => o + 1)}
                            canStep={periodFilter !== 'all'}
                            canStepForward={canGoForward}
                            styles={styles}
                            theme={theme}
                        />
                    </View>
                </View>

                <GlassCard style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCell}>
                            <Text style={[styles.statVal, { color: theme.moneyOut }]}>
                                {formatCurrencyShort(totalExp)}
                            </Text>
                            <Text style={styles.statLbl}>Gastos</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCell}>
                            <Text style={[styles.statVal, { color: theme.moneyIn }]}>
                                {formatCurrencyShort(totalInc)}
                            </Text>
                            <Text style={styles.statLbl}>Ingresos</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCell}>
                            <Text style={[styles.statVal, { color: netColor }]}>
                                {netBalance >= 0 ? '+' : '−'}{formatCurrencyShort(Math.abs(netBalance))}
                            </Text>
                            <Text style={styles.statLbl}>Balance</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Grouped transactions */}
                {Object.keys(grouped).length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Sin movimientos</Text>
                        <Text style={styles.emptySub}>Tus transacciones aparecerán aquí</Text>
                    </View>
                ) : (
                    Object.entries(grouped).map(([month, txns]) => (
                        <View key={month}>
                            <View style={styles.monthLabelRow}>
                                <Text style={styles.monthLabel}>{month}</Text>
                                <Text style={styles.monthCount}>{txns.length} movimientos</Text>
                            </View>
                            <GlassCard style={styles.txnCard}>
                                {txns.map((txn, i) => {
                                    const isIncome = txn.type === 'income';
                                    const isTransfer = txn.type === 'transfer';
                                    const isLast = i === txns.length - 1;
                                    const cfg = getTypeConfig(theme, txn.type, txn.category);
                                    const accountLabel = isTransfer
                                        ? `${accounts.find(a => a.id === txn.accountId)?.name ?? '—'} → ${accounts.find(a => a.id === txn.toAccountId)?.name ?? '—'}`
                                        : txn.creditCardId
                                            ? (creditCards.find(c => c.id === txn.creditCardId)?.name ?? 'Tarjeta')
                                            : (accounts.find(a => a.id === txn.accountId)?.name ?? '—');
                                    const txnTagLabel = (txn.tagIds || [])
                                        .map(id => tags.find(t => t.id === id)?.label)
                                        .filter(Boolean)
                                        .join(', ');
                                    return (
                                        <TouchableOpacity
                                            key={txn.id}
                                            style={[styles.txnRow, isLast && styles.txnRowLast]}
                                            onPress={() => setSelectedTxn(txn)}
                                            activeOpacity={0.7}
                                        >
                                            <TxnIcon type={txn.type} category={txn.category} theme={theme} sheet={sheet} size={32} />
                                            <View style={styles.txnInfo}>
                                                <Text style={styles.txnName} numberOfLines={1}>
                                                    {txn.reason}
                                                </Text>
                                                <Text style={styles.txnMeta} numberOfLines={1}>
                                                    {accountLabel}{txnTagLabel ? ` · ${txnTagLabel}` : ''}
                                                </Text>
                                            </View>
                                            <View style={styles.txnRight}>
                                                <Text style={[styles.txnAmount, { color: cfg.fg }]}>
                                                    {isIncome ? '+' : isTransfer ? '' : '−'}{formatCurrencyShort(txn.amount)}
                                                </Text>
                                                <Text style={styles.txnDate}>
                                                    {format(parseISO(txn.date), 'd MMM · HH:mm', { locale: es })}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </GlassCard>
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
                    tags={tags}
                    theme={theme}
                    sheet={sheet}
                />
            )}
        </View>
    );
}