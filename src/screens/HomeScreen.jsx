// Main screen. General overview of finances.
import { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { format, parseISO, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, formatCurrencyShort, round2 } from '../utils';
import createHomeStyles from './HomeScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import PendingFundCard from '../components/PendingFundCard';
import GlassCard from '../components/GlassCard';
import HeroArt from '../components/HeroArt';
import {
    IconSwap, IconCash,
    IconTrendUp, IconTrendDown, IconCalendarClock, IconReceipt, IconWallet, IconBanknotePlus, IconPercent,
} from '../components/Icons';

// Same shape History uses, swapping in "Hoy" for same-day movements
// so Recientes reads faster at a glance.
function formatTxnDate(dateStr, now) {
    const d = parseISO(dateStr);
    const day = isSameDay(d, now) ? 'Hoy' : format(d, 'd MMM', { locale: es });
    return `${day} · ${format(d, 'HH:mm')}`;
}

// Which color each account gets in the allocation bar. A debit
// account's own custom `color` (set in Tarjetas) always wins;
// otherwise falls back to a fixed per-type color.
function getAccountColor(theme, account) {
    if (account.color) return account.color;
    if (account.type === 'cash') return theme.cashTone;
    if (account.type === 'debit') return theme.moneyIn;
    // No new account can be type 'savings' anymore — kept only so
    // stale local test data still colors sensibly.
    if (account.type === 'savings') return theme.savings;
    return theme.muted;
}

// moneyIn/moneyOut are the only two fixed-meaning accents. A plain
// withdrawal (cajero, or no specific category) is neither, so it
// stays neutral. Transfer gets its own `transfer` accent — still your
// own money, so a darker/more saturated version of moneyIn's teal
// rather than an unrelated hue, but never identical to Ingreso. A
// card payment or MSI installment is a `type: 'withdrawal'` under the
// hood (real money leaving a real account), but isn't a plain retiro
// either — each gets its own accent (theme.msi / theme.cardPayment)
// and icon instead of borrowing moneyOut, so Gasto/Mensualidad/Pago
// de tarjeta don't all read as the same color.
function getTxnVisual(theme, type, category) {
    if (category === 'msi') return { bg: theme.msiSoft, color: theme.msi, Icon: IconCalendarClock };
    if (category === 'card_payment') return { bg: theme.cardPaymentSoft, color: theme.cardPayment, Icon: IconCash };
    // Interest is app-generated, so it gets the same `savings` accent
    // it uses everywhere else instead of blending into a regular Ingreso.
    if (category === 'interest') return { bg: theme.savingsSoft, color: theme.savings, Icon: IconPercent };
    if (type === 'income') return { bg: theme.moneyInSoft, color: theme.moneyIn, Icon: IconBanknotePlus };
    if (type === 'expense') return { bg: theme.moneyOutSoft, color: theme.moneyOut, Icon: IconReceipt };
    if (type === 'transfer') return { bg: theme.transferSoft, color: theme.transfer, Icon: IconSwap };
    return { bg: theme.border, color: theme.muted, Icon: IconWallet };
}

// Confirm-and-pay sheet for one MSI installment — a withdrawal from a
// chosen account plus a matching debt reduction via
// payCardWithTransaction, same pattern as CardsScreen's PayCardSheet.
function MSIPaySheet({ fund, accounts, onClose }) {
    const { payCardWithTransaction, confirmMSI } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createHomeStyles(theme), [theme]);
    const [accountId, setAccountId] = useState(accounts[0]?.id || null);
    const [loading, setLoading] = useState(false);

    const canConfirm = !!accountId && !loading;

    const handleConfirm = async () => {
        if (!canConfirm) return;
        setLoading(true);
        const result = await payCardWithTransaction({
            accountId,
            amount: fund.monthlyAmount,
            reason: `${fund.name} MSI ${fund.paidMonths + 1}/${fund.months}`,
            category: 'msi',
            // Remembers which card this installment paid down, so
            // deleteTransaction/updateTransaction can restore the
            // right amount of debt if this is later edited or removed.
            linkedCardId: fund.creditCardId,
        });
        if (result?.error) {
            setLoading(false);
            Alert.alert('Fondos insuficientes', result.error);
            return;
        }
        // confirmMSI lives in a separate store (useScheduledFunds) and
        // doesn't touch accounts/transactions/creditCards, so it's a
        // safe second step here.
        await confirmMSI(fund.id);
        setLoading(false);
        if (result.savingsWarning) {
            Alert.alert(
                'Usaste fondos de ahorro',
                `Este pago usó ${formatCurrency(result.savingsWarning.newlyAtRisk)} que tenías apartado como ahorro en ${result.savingsWarning.accountName}.`,
                [{ text: 'Entendido', onPress: onClose }]
            );
            return;
        }
        onClose();
    };

    return (
        <Modal visible transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.msiModalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
                <View style={styles.msiSheet}>
                    <View style={styles.msiSheetHandle} />
                    <Text style={styles.msiSheetTitle}>{fund.name}</Text>
                    <Text style={styles.msiSheetSubtitle}>
                        Pago {fund.paidMonths + 1} de {fund.months} · {formatCurrency(fund.monthlyAmount)}
                    </Text>

                    <Text style={styles.msiSheetLabel}>DESDE QUÉ CUENTA</Text>
                    <View style={styles.msiChipRow}>
                        {accounts.map(a => (
                            <TouchableOpacity
                                key={a.id}
                                style={[styles.msiChip, accountId === a.id && styles.msiChipActive]}
                                onPress={() => setAccountId(a.id)}
                            >
                                <Text style={[styles.msiChipText, accountId === a.id && styles.msiChipTextActive]}>
                                    {a.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.msiSheetBtns}>
                        <TouchableOpacity style={styles.msiBtnCancel} onPress={onClose}>
                            <Text style={styles.msiBtnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.msiBtnPrimary, !canConfirm && styles.msiBtnDisabled]}
                            onPress={handleConfirm}
                            disabled={!canConfirm}
                        >
                            <Text style={styles.msiBtnPrimaryText}>
                                {loading ? 'Procesando...' : 'Confirmar pago'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export default function HomeScreen() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = useMemo(() => createHomeStyles(theme), [theme]);

    const {
        accounts,
        settings,
        transactions,
        creditCards,
        totalBalance,
        totalDebt,
        isLoading,
        pendingFunds,
        getFundStatus,
        confirmFund,
        tags,
    } = useFinance();

    const insets = useSafeAreaInsets();
    const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });
    const [payingMSI, setPayingMSI] = useState(null);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.brand} />
            </View>
        );
    }

    const recentTransactions = transactions.slice(0, 3);
    const pendingMSI = pendingFunds.filter(f => f.type === 'msi');
    const pendingIncome = pendingFunds.filter(f => f.type !== 'msi');

    // Credit card debt gets its own slice of the same bar — money you
    // owe is part of the full picture, not just what you have.
    const positiveTotal = accounts.reduce((sum, a) => sum + Math.max(a.balance, 0), 0);
    const allocTotal = positiveTotal + totalDebt;

    // Balance trend: current total vs. what it was at the start of
    // this calendar month (no historical snapshots to compare
    // against otherwise). Transfers don't change the total, so excluded.
    const now = new Date();
    const thisMonthTxns = transactions.filter(t => isSameMonth(parseISO(t.date), now));
    const netChangeThisMonth = round2(thisMonthTxns.reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense' || t.type === 'withdrawal') return sum - t.amount;
        return sum;
    }, 0));
    const balanceAtMonthStart = round2(totalBalance - netChangeThisMonth);
    // Nothing to compare against yet this month — hide the trend
    // instead of showing a misleading "0.0%".
    const hasTrend = thisMonthTxns.length > 0;
    const trendUp = netChangeThisMonth >= 0;
    // Percent only makes sense against a positive starting point.
    const trendPct = balanceAtMonthStart > 0
        ? Math.abs(netChangeThisMonth / balanceAtMonthStart) * 100
        : null;

    return (
        <View style={styles.safeArea}>
            <StatusBar style={theme.statusBarStyle} />
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: insets.top + 8 }}
            >

                {/* Hero: not a GlassCard — HeroArt's illustration
                    already covers the whole card, nothing left for
                    the blur to show through. */}
                <View style={styles.heroCard} onLayout={e => setHeroSize(e.nativeEvent.layout)}>
                    {heroSize.width > 0 && heroSize.height > 0 && (
                        <HeroArt width={heroSize.width} height={heroSize.height} />
                    )}
                    <View style={styles.heroHeader}>
                        <View>
                            <Text style={styles.greeting}>Hola de nuevo</Text>
                            <Text style={styles.userName}>{settings.userName}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.kebabBtn}
                            onPress={() => navigation.navigate('Settings')}
                            hitSlop={{ top: 10, bottom: 10, left: 14, right: 6 }}
                        >
                            <View style={styles.kebabDot} />
                            <View style={styles.kebabDot} />
                            <View style={styles.kebabDot} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroBalance}>
                        <View style={styles.balanceLabelRow}>
                            <Text style={styles.balanceLabel}>Balance total</Text>
                            {/* The amount itself always renders the same
                                regardless of active currency — this tag
                                is the one place that says which one it is. */}
                            <Text style={styles.currencyTag}>{settings.currency}</Text>
                        </View>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
                            {hasTrend && (
                                <View style={[
                                    styles.trendPill,
                                    { backgroundColor: trendUp ? theme.moneyInSoft : theme.moneyOutSoft },
                                ]}>
                                    {trendUp
                                        ? <IconTrendUp color={theme.moneyIn} size={12} />
                                        : <IconTrendDown color={theme.moneyOut} size={12} />}
                                    <Text style={[styles.trendPillText, { color: trendUp ? theme.moneyIn : theme.moneyOut }]}>
                                        {trendPct !== null
                                            ? `${trendUp ? '+' : '−'}${trendPct.toFixed(1)}%`
                                            : `${trendUp ? '+' : '−'}${formatCurrencyShort(Math.abs(netChangeThisMonth))}`}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Allocation bar. Read-only — managing accounts lives in Tarjetas. */}
                {accounts.length > 0 && (
                    <View style={styles.alloc}>
                        <View style={styles.allocBar}>
                            {accounts.map((acc) => {
                                const pct = allocTotal > 0
                                    ? (Math.max(acc.balance, 0) / allocTotal) * 100
                                    : 100 / accounts.length;
                                return (
                                    <View
                                        key={acc.id}
                                        style={{ width: `${pct}%`, backgroundColor: getAccountColor(theme, acc) }}
                                    />
                                );
                            })}
                            {totalDebt > 0 && (
                                <View
                                    style={{
                                        width: `${(totalDebt / allocTotal) * 100}%`,
                                        backgroundColor: theme.moneyOut,
                                    }}
                                />
                            )}
                        </View>
                        <View style={styles.allocLegend}>
                            {accounts.map((acc) => (
                                <View key={acc.id} style={styles.allocItem}>
                                    <View style={styles.allocLabelRow}>
                                        <View style={[styles.allocDot, { backgroundColor: getAccountColor(theme, acc) }]} />
                                        <Text style={styles.allocLabel} numberOfLines={1}>
                                            {acc.name}
                                        </Text>
                                    </View>
                                    <Text style={styles.allocValue}>{formatCurrencyShort(acc.balance)}</Text>
                                </View>
                            ))}
                            {totalDebt > 0 && (
                                <View style={styles.allocItem}>
                                    <View style={styles.allocLabelRow}>
                                        <View style={[styles.allocDot, { backgroundColor: theme.moneyOut }]} />
                                        <Text style={styles.allocLabel} numberOfLines={1}>Deuda</Text>
                                    </View>
                                    <Text style={[styles.allocValue, { color: theme.moneyOut }]}>
                                        −{formatCurrencyShort(totalDebt)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Fondos programados / mensualidades — always renders,
                    even with nothing due, as a direct way into the full list. */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Fondos programados</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ScheduledFunds')}>
                            <Text style={styles.sectionLink}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>
                    {pendingMSI.length === 0 && pendingIncome.length === 0 ? (
                        <Text style={styles.metaText}>Sin pendientes por ahora</Text>
                    ) : (
                        <>
                            {pendingMSI.map(fund => (
                                <PendingFundCard
                                    key={fund.id}
                                    fund={fund}
                                    status={getFundStatus(fund)}
                                    theme={theme}
                                    onPress={() => setPayingMSI(fund)}
                                />
                            ))}
                            {pendingIncome.map(fund => (
                                <PendingFundCard
                                    key={fund.id}
                                    fund={fund}
                                    status={getFundStatus(fund)}
                                    theme={theme}
                                    onPress={() => {
                                        navigation.navigate('AddTransaction', {
                                            prefill: {
                                                type: 'income',
                                                amount: fund.amount.toString(),
                                                reason: fund.name,
                                                category: 'salary',
                                                accountId: fund.accountId,
                                                fundId: fund.id,
                                            },
                                        });
                                    }}
                                />
                            ))}
                        </>
                    )}
                </View>

                {/* Credit cards */}
                {creditCards.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Tarjetas de crédito</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('CardsTab')}>
                                <Text style={styles.sectionLink}>Ver todas</Text>
                            </TouchableOpacity>
                        </View>
                        {creditCards.map(card => {
                            const pct = Math.min(Math.round((card.currentDebt / card.limit) * 100), 100);
                            return (
                                <GlassCard key={card.id} style={styles.creditCard}>
                                    <View style={styles.creditCardTop}>
                                        <Text style={styles.creditCardName}>{card.name}</Text>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.creditCardDebt}>
                                                {formatCurrencyShort(card.currentDebt)}
                                            </Text>
                                            <Text style={styles.creditCardLimit}>
                                                de {formatCurrencyShort(card.limit)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                                    </View>
                                    <View style={styles.creditCardMeta}>
                                        <Text style={styles.metaText}>Corte día {card.cutoffDay}</Text>
                                        <Text style={styles.metaText}>{pct}% usado</Text>
                                    </View>
                                </GlassCard>
                            );
                        })}
                    </View>
                )}

                {/* Recent transactions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recientes</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
                            <Text style={styles.sectionLink}>Ver historial</Text>
                        </TouchableOpacity>
                    </View>

                    {recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Sin movimientos aún</Text>
                            <Text style={styles.emptySubText}>
                                Toca el "+" de la barra de abajo para comenzar
                            </Text>
                        </View>
                    ) : (
                        <GlassCard style={styles.txnCard}>
                            {recentTransactions.map((txn, i) => {
                                const visual = getTxnVisual(theme, txn.type, txn.category);
                                const accountLabel = txn.type === 'transfer'
                                    ? `${accounts.find(a => a.id === txn.accountId)?.name ?? '—'} → ${accounts.find(a => a.id === txn.toAccountId)?.name ?? '—'}`
                                    : txn.creditCardId
                                        ? (creditCards.find(c => c.id === txn.creditCardId)?.name ?? '—')
                                        : (accounts.find(a => a.id === txn.accountId)?.name ?? '—');
                                // "· etiqueta" only appears when there's a tag to show.
                                const txnTagLabel = (txn.tagIds || [])
                                    .map(id => tags.find(t => t.id === id)?.label)
                                    .filter(Boolean)
                                    .join(', ');
                                return (
                                    <View
                                        key={txn.id}
                                        style={[
                                            styles.txnRow,
                                            i === recentTransactions.length - 1 && styles.txnRowLast,
                                        ]}
                                    >
                                        <View style={[styles.txnIconWrap, { backgroundColor: visual.bg }]}>
                                            <visual.Icon color={visual.color} bgColor={theme.surface} size={16} />
                                        </View>
                                        <View style={styles.txnInfo}>
                                            <Text style={styles.txnName} numberOfLines={1}>
                                                {txn.reason}
                                            </Text>
                                            <Text style={styles.txnSub} numberOfLines={1}>
                                                {accountLabel}{txnTagLabel ? ` · ${txnTagLabel}` : ''}
                                            </Text>
                                        </View>
                                        <View style={styles.txnRight}>
                                            <Text style={[
                                                styles.txnAmount,
                                                txn.type === 'income' ? styles.amountPos
                                                    : txn.category === 'goal' ? { color: theme.savings }
                                                        : txn.category === 'card_payment' ? { color: theme.cardPayment }
                                                            : txn.category === 'msi' ? { color: theme.msi }
                                                                : txn.type === 'expense' ? styles.amountExpense
                                                                    : styles.amountNeg,
                                            ]}>
                                                {txn.type === 'income' ? '+' : txn.type === 'transfer' ? '' : '−'}{formatCurrencyShort(txn.amount)}
                                            </Text>
                                            <Text style={styles.txnDate}>{formatTxnDate(txn.date, now)}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </GlassCard>
                    )}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {payingMSI && (
                <MSIPaySheet
                    fund={payingMSI}
                    accounts={accounts}
                    onClose={() => setPayingMSI(null)}
                />
            )}
        </View>
    );
}