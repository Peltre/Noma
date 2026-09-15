// Main screen. General overview of finances.
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { format, parseISO, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, round2, getCardUrgency, getTxnVisual } from '../utils';
import { FontSize } from '../constants';
import createHomeStyles from './HomeScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme, useStyles } from '../store/useTheme';
import PendingFundCard from '../components/PendingFundCard';
import CreditCardSummary from '../components/CreditCardSummary';
import GlassCard from '../components/GlassCard';
import HeroArt from '../components/HeroArt';
import { Money, SectionHeader, EmptyState, Sheet, Pill, Button, useToast } from '../components/ui';

// Barra Disponible / Ahorro del héroe: una sola familia (turquesa).
// Lo disponible es "tu dinero" en versión clara; el ahorro, la
// profunda. Se lee como "lo mismo, pero guardado".
const SPLIT_AVAILABLE = '#8FD3C7';
const SPLIT_SAVED = '#2E8C80';
import {
    IconGear,
    IconTrendUp,
    IconTrendDown,
    IconReceipt,
} from '../components/Icons';

// Same shape History uses, swapping in "Hoy" for same-day movements
// so Recientes reads faster at a glance.
function formatTxnDate(dateStr, now) {
    const d = parseISO(dateStr);
    const day = isSameDay(d, now) ? 'Hoy' : format(d, 'd MMM', { locale: es });
    return `${day} · ${format(d, 'HH:mm')}`;
}

// Confirm-and-pay sheet for one MSI installment — a withdrawal from a
// chosen account plus a matching debt reduction via
// payCardWithTransaction, same pattern as CardsScreen's PayCardSheet.
function MSIPaySheet({ fund, accounts, onClose }) {
    const { payCardWithTransaction, confirmMSI } = useFinance();
    const toast = useToast();
    const { theme } = useTheme();
    const styles = useStyles(createHomeStyles);
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
            toast.error('Fondos insuficientes', result.error);
            return;
        }
        // confirmMSI lives in a separate store (useScheduledFunds) and
        // doesn't touch accounts/transactions/creditCards, so it's a
        // safe second step here.
        await confirmMSI(fund.id);
        setLoading(false);
        if (result.savingsWarning) {
            // Aviso, no decisión: se cierra la hoja y el toast lo explica.
            toast.info(
                `Usaste ${formatCurrency(result.savingsWarning.newlyAtRisk)} de tu ahorro`,
                `Ese dinero estaba apartado en ${result.savingsWarning.accountName}.`,
            );
            onClose();
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
    const styles = useStyles(createHomeStyles);

    const {
        accounts,
        settings,
        transactions,
        creditCards,
        totalBalance,
        savingsGoals,
        isLoading,
        pendingFunds,
        getFundStatus,
        tags,
    } = useFinance();

    const insets = useSafeAreaInsets();
    const [payingMSI, setPayingMSI] = useState(null);
    // Tarjeta de crédito al frente en la sección. null = la más
    // urgente (primera del orden). Tocar una mini la trae al frente.
    const [featuredCardId, setFeaturedCardId] = useState(null);
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
    // Urgente primero (corte o pago más cercano), luego por deuda.
    const sortedCreditCards = [...creditCards].sort((a, b) => {
        const ua = getCardUrgency(a), ub = getCardUrgency(b);
        if (ua.urgent !== ub.urgent) return ua.urgent ? -1 : 1;
        if (ua.urgent && ua.soonest !== ub.soonest) return ua.soonest - ub.soonest;
        return b.currentDebt - a.currentDebt;
    });
    // Si la elegida ya no existe (se borró), se vuelve a la más urgente.
    const featuredCard = sortedCreditCards.find(c => c.id === featuredCardId) || sortedCreditCards[0] || null;
    const otherCreditCards = sortedCreditCards.filter(c => c.id !== featuredCard?.id);
    const pendingMSI = pendingFunds.filter((f) => f.type === 'msi');
    const pendingIncome = pendingFunds.filter((f) => f.type !== 'msi');

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

    // Disponible vs. ahorro: del total, cuánto ya tiene destino en
    // objetivos y cuánto queda para gastar. La deuda de crédito no entra
    // aquí (totalBalance ya la considera como la considere).
    const savedTotal = round2(savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0));
    const availableTotal = round2(Math.max(0, totalBalance - savedTotal));
    const showSplit = totalBalance > 0 && savedTotal > 0;
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
                    HeroArt necesita medidas en píxeles, no '100%':
                    react-native-svg no estira un Svg porcentual contra un
                    padre flex, por eso se mide con onLayout. */}
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
                            style={styles.settingsBtn}
                            onPress={() => navigation.navigate('Settings')}
                            accessibilityRole="button"
                            accessibilityLabel="Ajustes"
                            hitSlop={{ top: 10, bottom: 10, left: 14, right: 6 }}
                        >
                            <IconGear color={theme.ink} size={16} />
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
                                la decoración. */}
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

                        {/* Disponible / Ahorro: dos segmentos que sí dicen algo.
                            Tocar la barra lleva a Ahorros. Sólo aparece cuando
                            hay algo ahorrado; sin objetivos el héroe queda
                            como antes. */}
                        {showSplit && (
                            <TouchableOpacity
                                style={styles.splitWrap}
                                onPress={() => navigation.navigate('SavingsTab')}
                                activeOpacity={0.75}
                                accessibilityRole="button"
                                accessibilityLabel={`Disponible ${formatCurrency(availableTotal)}, ahorro ${formatCurrency(savedTotal)}`}
                            >
                                <View style={styles.splitBar}>
                                    {availableTotal > 0 && <View style={[styles.splitSeg, { flex: availableTotal, backgroundColor: SPLIT_AVAILABLE }]} />}
                                    <View style={[styles.splitSeg, { flex: savedTotal, backgroundColor: SPLIT_SAVED }]} />
                                </View>
                                <View style={styles.splitLegend}>
                                    <View style={styles.splitItem}>
                                        <View style={[styles.splitDot, { backgroundColor: SPLIT_AVAILABLE }]} />
                                        <Text style={styles.splitLabel}>Disponible</Text>
                                        <Money value={availableTotal} size={FontSize.xs + 1} color={theme.ink} decimals={false} />
                                    </View>
                                    <View style={styles.splitItem}>
                                        <View style={[styles.splitDot, { backgroundColor: SPLIT_SAVED }]} />
                                        <Text style={styles.splitLabel}>Ahorro</Text>
                                        <Money value={savedTotal} size={FontSize.xs + 1} color={theme.ink} decimals={false} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
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

                {/* Credit cards — una sola card: al frente la más urgente
                    (o la que se eligió) y, si hay más, una banda al pie
                    "N tarjetas más" que despliega las demás dentro de la
                    misma card. Tocar la principal abre su detalle en
                    Tarjetas; tocar una de la lista la trae al frente. */}
                {creditCards.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader
                            title="Tarjetas de crédito"
                            actionLabel="Ver todas"
                            onAction={() => navigation.navigate('CardsTab')}
                        />
                        <CreditCardSummary
                            card={featuredCard}
                            theme={theme}
                            others={otherCreditCards}
                            onSelectOther={(card) => setFeaturedCardId(card.id)}
                            onPress={() =>
                                navigation.navigate('CardsTab', {
                                    screen: 'Cards',
                                    params: { focusCardId: featuredCard.id, focusNonce: Date.now() },
                                })
                            }
                        />
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