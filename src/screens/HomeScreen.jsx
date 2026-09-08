// Main screen. General overview of finances.
import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { format, parseISO, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, round2 } from '../utils';
import { FontSize } from '../constants';
import createHomeStyles, { HERO_GLOW } from './HomeScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import PendingFundCard from '../components/PendingFundCard';
import GlassCard from '../components/GlassCard';
import HeroArt from '../components/HeroArt';
import { Money, SectionHeader, EmptyState, Sheet, Pill, Button } from '../components/ui';
import {
    IconSwap,
    IconCash,
    IconSavings,
    IconTrendUp,
    IconTrendDown,
    IconCalendarClock,
    IconReceipt,
    IconWallet,
    IconBanknotePlus,
    IconPercent,
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
    if (account.type === 'savings') return theme.savings;
    return theme.muted;
}

// moneyIn/moneyOut are the only two fixed-meaning accents. A plain
// withdrawal (cajero, or no specific category) is neither, so it
// stays neutral. See themes.js for the four-family rule: teal is your
// money, amber leaves today, violet is a future commitment, blue is
// earmarked.
function getTxnVisual(theme, type, category) {
    if (category === 'msi') return { bg: theme.msiSoft, color: theme.msi, Icon: IconCalendarClock };
    if (category === 'card_payment')
        return { bg: theme.cardPaymentSoft, color: theme.cardPayment, Icon: IconCash };
    if (category === 'interest') return { bg: theme.savingsSoft, color: theme.savings, Icon: IconPercent };
    if (category === 'goal') return { bg: theme.savingsSoft, color: theme.savings, Icon: IconSavings };
    if (type === 'income') return { bg: theme.moneyInSoft, color: theme.moneyIn, Icon: IconBanknotePlus };
    if (type === 'expense') return { bg: theme.moneyOutSoft, color: theme.moneyOut, Icon: IconReceipt };
    if (type === 'transfer') return { bg: theme.transferSoft, color: theme.transfer, Icon: IconSwap };
    return { bg: theme.border, color: theme.muted, Icon: IconWallet };
}

// Toda la decoración del héroe: un resplandor de marca entrando por la
// esquina superior derecha, con el CENTRO FUERA de la tarjeta. Eso es
// lo que hace que se lea como luz y no como un círculo pegado encima —
// solo entra el faldón, que es la parte suave del degradado.
//
// Tamaño fijo y anclado a la esquina, así que no hace falta medir la
// tarjeta con onLayout como hacía el HeroArt anterior: no depende del
// ancho, solo de dónde empieza.
//
// El pico es 13% de opacidad, pero el centro cae fuera del recorte, así
// que lo que de verdad se ve ronda el 5%. Si se llega a notar de
// inmediato al abrir la app, está de más.
// SIN USAR desde que el héroe pasó a HeroArt. Se deja a propósito: es
// la decoración anterior y volver a ella es cambiar el bloque del
// render por <View style={styles.heroGlow}><HeroGlow theme={theme} /></View>.
// Si tras probar HeroArt te quedas con él, bórrala junto con el estilo
// heroGlow y la constante HERO_GLOW.
function HeroGlow({ theme }) {
    return (
        <Svg width={HERO_GLOW} height={HERO_GLOW}>
            <Defs>
                <RadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={theme.brand} stopOpacity="0.13" />
                    <Stop offset="55%" stopColor={theme.brand} stopOpacity="0.05" />
                    <Stop offset="100%" stopColor={theme.brand} stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Circle cx={HERO_GLOW / 2} cy={HERO_GLOW / 2} r={HERO_GLOW / 2} fill="url(#heroGlow)" />
        </Svg>
    );
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
                [{ text: 'Entendido', onPress: onClose }],
            );
            return;
        }
        onClose();
    };

    return (
        <Sheet
            onClose={onClose}
            dismissable={!loading}
            title={fund.name}
            subtitle={`Pago ${fund.paidMonths + 1} de ${fund.months} · ${formatCurrency(fund.monthlyAmount)}`}
        >
            <Text style={styles.sheetLabel}>DESDE QUÉ CUENTA</Text>
            <View style={styles.pillsWrap}>
                {accounts.map((a) => (
                    <Pill
                        key={a.id}
                        label={a.name}
                        selected={accountId === a.id}
                        accent={theme.msi}
                        onPress={() => setAccountId(a.id)}
                    />
                ))}
            </View>

            <View style={styles.sheetBtns}>
                <Button label="Cancelar" variant="secondary" onPress={onClose} />
                <Button
                    label="Confirmar pago"
                    accent={theme.msi}
                    accentOn={theme.msiOn}
                    loading={loading}
                    disabled={!canConfirm}
                    onPress={handleConfirm}
                    style={{ flex: 2 }}
                />
            </View>
        </Sheet>
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
    const [payingMSI, setPayingMSI] = useState(null);
    // Medida real de la tarjeta héroe para HeroArt.
    const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.brand} />
            </View>
        );
    }

    const recentTransactions = transactions.slice(0, 3);
    const pendingMSI = pendingFunds.filter((f) => f.type === 'msi');
    const pendingIncome = pendingFunds.filter((f) => f.type !== 'msi');

    // Credit card debt gets its own slice of the same bar — money you
    // owe is part of the full picture, not just what you have.
    const positiveTotal = accounts.reduce((sum, a) => sum + Math.max(a.balance, 0), 0);
    const allocTotal = positiveTotal + totalDebt;

    // Balance trend: current total vs. what it was at the start of
    // this calendar month. Transfers don't change the total, so excluded.
    const now = new Date();
    const thisMonthTxns = transactions.filter((t) => isSameMonth(parseISO(t.date), now));
    const netChangeThisMonth = round2(
        thisMonthTxns.reduce((sum, t) => {
            if (t.type === 'income') return sum + t.amount;
            if (t.type === 'expense' || t.type === 'withdrawal') return sum - t.amount;
            return sum;
        }, 0),
    );
    const balanceAtMonthStart = round2(totalBalance - netChangeThisMonth);
    const hasTrend = thisMonthTxns.length > 0;
    const trendUp = netChangeThisMonth >= 0;
    const trendPct =
        balanceAtMonthStart > 0 ? Math.abs(netChangeThisMonth / balanceAtMonthStart) * 100 : null;
    const trendColor = trendUp ? theme.moneyIn : theme.moneyOut;

    return (
        <View style={styles.safeArea}>
            <StatusBar style={theme.statusBarStyle} />
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: insets.top + 8 }}
            >
                {/* Hero: GlassCard + HeroArt de fondo (luna, halo, dunas
                    y estrellas, todo sacado de `theme` y translúcido, así
                    que el BlurView sigue trabajando por debajo).
                    heroHeader y heroBalance traen zIndex:1, así que el
                    texto queda encima sin más ajustes, y el overflow
                    hidden de GlassCard recorta el arte a las esquinas.
                    HeroArt necesita medidas en píxeles, no '100%' — ver
                    la nota en NightSkyArt.jsx sobre por qué react-native-svg
                    no estira un Svg porcentual contra un padre flex. */}
                <GlassCard style={styles.heroCard}>
                    <View
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                        onLayout={(e) => {
                            const { width, height } = e.nativeEvent.layout;
                            if (!width || !height) return;
                            setHeroSize((prev) =>
                                Math.abs(prev.width - width) > 1 || Math.abs(prev.height - height) > 1
                                    ? { width, height }
                                    : prev,
                            );
                        }}
                    >
                        {heroSize.width > 0 && (
                            <HeroArt width={heroSize.width} height={heroSize.height} theme={theme} />
                        )}
                    </View>
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
                            {/* Sin degradado: la cifra descansa en `ink`.
                                El barrido de tres colores recorría 117° del
                                círculo de tono (turquesa → azul → violeta) y
                                competía con el cielo de detrás, que ya es la
                                identidad de la pantalla. Un blanco liso lee
                                como luz de luna y deja que la decoración sea
                                la decoración.
                                LiveAmount.jsx sigue en el repo por si se
                                retoma. */}
                            <Money value={totalBalance} size={FontSize.hero} />
                            {hasTrend && (
                                <View
                                    style={[
                                        styles.trendPill,
                                        { backgroundColor: trendUp ? theme.moneyInSoft : theme.moneyOutSoft },
                                    ]}
                                >
                                    <View style={styles.trendPillTop}>
                                        {trendUp ? (
                                            <IconTrendUp color={theme.moneyIn} size={12} />
                                        ) : (
                                            <IconTrendDown color={theme.moneyOut} size={12} />
                                        )}
                                        {trendPct !== null ? (
                                            <Text style={[styles.trendPillText, { color: trendColor }]}>
                                                {trendUp ? '+' : '−'}
                                                {trendPct.toFixed(1)}%
                                            </Text>
                                        ) : (
                                            <Money
                                                value={Math.abs(netChangeThisMonth)}
                                                size={FontSize.xs}
                                                sign={trendUp ? '+' : '-'}
                                                color={trendColor}
                                                decimals={false}
                                                compact
                                            />
                                        )}
                                    </View>
                                    {/* Sin esto, el porcentaje no dice
                                        contra qué se compara. Es "este
                                        mes" y no otra cosa porque
                                        netChangeThisMonth se calcula
                                        sobre thisMonthTxns y el
                                        porcentaje se divide entre el
                                        balance al día 1. */}
                                    <Text style={[styles.trendPillCaption, { color: trendColor }]}>
                                        Este mes
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </GlassCard>

                {/* Fondos programados / mensualidades — always renders,
                    even with nothing due, as a direct way into the full list. */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Fondos programados"
                        actionLabel="Ver todos"
                        onAction={() => navigation.navigate('ScheduledFunds')}
                    />
                    {pendingMSI.length === 0 && pendingIncome.length === 0 ? (
                        <Text style={styles.metaText}>Sin pendientes por ahora</Text>
                    ) : (
                        <>
                            {pendingMSI.map((fund) => (
                                <PendingFundCard
                                    key={fund.id}
                                    fund={fund}
                                    status={getFundStatus(fund)}
                                    theme={theme}
                                    onPress={() => setPayingMSI(fund)}
                                />
                            ))}
                            {pendingIncome.map((fund) => (
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
                        <SectionHeader
                            title="Tarjetas de crédito"
                            actionLabel="Ver todas"
                            onAction={() => navigation.navigate('CardsTab')}
                        />
                        {creditCards.map((card) => {
                            const pct = Math.min(Math.round((card.currentDebt / card.limit) * 100), 100);
                            return (
                                <GlassCard key={card.id} style={styles.creditCard}>
                                    <View style={styles.creditCardTop}>
                                        <Text style={styles.creditCardName}>{card.name}</Text>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Money
                                                value={card.currentDebt}
                                                size={FontSize.md}
                                                color={theme.moneyOut}
                                            />
                                            <View style={styles.creditCardLimitRow}>
                                                <Text style={styles.creditCardLimit}>de </Text>
                                                <Money
                                                    value={card.limit}
                                                    size={FontSize.xs}
                                                    color={theme.inkDim}
                                                    decimals={false}
                                                />
                                            </View>
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
                    <SectionHeader
                        title="Recientes"
                        actionLabel="Ver historial"
                        onAction={() => navigation.navigate('HistoryTab')}
                    />

                    {recentTransactions.length === 0 ? (
                        <EmptyState
                            icon={IconReceipt}
                            title="Sin movimientos aún"
                            description="Toca el + de la barra de abajo para registrar tu primer gasto o ingreso."
                            actionLabel="Registrar movimiento"
                            onAction={() => navigation.navigate('AddTransaction')}
                        />
                    ) : (
                        <GlassCard style={styles.txnCard}>
                            {recentTransactions.map((txn, i) => {
                                const visual = getTxnVisual(theme, txn.type, txn.category);
                                const accountLabel =
                                    txn.type === 'transfer'
                                        ? `${accounts.find((a) => a.id === txn.accountId)?.name ?? '—'} → ${accounts.find((a) => a.id === txn.toAccountId)?.name ?? '—'}`
                                        : txn.creditCardId
                                            ? (creditCards.find((c) => c.id === txn.creditCardId)?.name ?? '—')
                                            : (accounts.find((a) => a.id === txn.accountId)?.name ?? '—');
                                // "· etiqueta" only appears when there's a tag to show.
                                const txnTagLabel = (txn.tagIds || [])
                                    .map((id) => tags.find((t) => t.id === id)?.label)
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
                                            <visual.Icon
                                                color={visual.color}
                                                bgColor={theme.surface}
                                                size={16}
                                            />
                                        </View>
                                        <View style={styles.txnInfo}>
                                            <Text style={styles.txnName} numberOfLines={1}>
                                                {txn.reason}
                                            </Text>
                                            <Text style={styles.txnSub} numberOfLines={1}>
                                                {accountLabel}
                                                {txnTagLabel ? ` · ${txnTagLabel}` : ''}
                                            </Text>
                                        </View>
                                        <View style={styles.txnRight}>
                                            <Money
                                                value={txn.amount}
                                                size={FontSize.md + 0.5}
                                                sign={
                                                    txn.type === 'income'
                                                        ? '+'
                                                        : txn.type === 'transfer'
                                                            ? 'none'
                                                            : '-'
                                                }
                                                color={visual.color}
                                            />
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
                <MSIPaySheet fund={payingMSI} accounts={accounts} onClose={() => setPayingMSI(null)} />
            )}
        </View>
    );
}