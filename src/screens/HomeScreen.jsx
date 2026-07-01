// Main screen. General overview of finances.
import { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { ACCOUNT_LABELS } from '../constants';
import createHomeStyles from './HomeScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import PendingFundCard from '../components/PendingFundCard';
import NightSkyArt from '../components/NightSkyArt';

// Which color token each account type gets in the allocation bar.
// Unknown types rotate through the same 3-color palette.
const ACCOUNT_FALLBACK_ORDER = ['cashTone', 'moneyIn', 'moneyOut'];

function getAccountColor(theme, type, index) {
    if (type === 'cash') return theme.cashTone;
    if (type === 'debit') return theme.moneyIn;
    if (type === 'savings') return theme.moneyOut;
    const key = ACCOUNT_FALLBACK_ORDER[index % ACCOUNT_FALLBACK_ORDER.length];
    return theme[key];
}

// Only two accents with fixed meaning: moneyIn = comes in or is saved,
// moneyOut = goes out. A withdrawal is neither, so it stays neutral
// instead of borrowing one of the two.
function getTxnVisual(theme, type) {
    if (type === 'income') return { bg: theme.moneyInSoft, color: theme.moneyIn, glyph: '↓' };
    if (type === 'expense') return { bg: theme.moneyOutSoft, color: theme.moneyOut, glyph: '↑' };
    return { bg: theme.border, color: theme.muted, glyph: '→' };
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
        isLoading,
        addTransaction,
        pendingFunds,
        getFundStatus,
        confirmFund,
        confirmMSI,
    } = useFinance();

    const insets = useSafeAreaInsets();
    const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });

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
    const allocTotal = accounts.reduce((sum, a) => sum + Math.max(a.balance, 0), 0);

    return (
        <View style={styles.safeArea}>
            <StatusBar style={theme.statusBarStyle} />
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: insets.top + 8 }}
            >

                {/* Hero: header and balance in one card, with the
                    night art behind both */}
                <View style={styles.heroCard} onLayout={e => setHeroSize(e.nativeEvent.layout)}>
                    {heroSize.width > 0 && heroSize.height > 0 && (
                        <NightSkyArt
                            width={heroSize.width}
                            height={heroSize.height}
                            glowColor={theme.brand}
                            moonColor={theme.ink}
                            duneColor={theme.bg}
                            starColor={theme.ink}
                        />
                    )}
                    <View style={styles.heroHeader}>
                        <View>
                            <Text style={styles.greeting}>Hola de nuevo</Text>
                            <Text style={styles.userName}>{settings.userName}</Text>
                        </View>
                    </View>

                    <View style={styles.heroBalance}>
                        <Text style={styles.balanceLabel}>Balance total</Text>
                        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
                    </View>
                </View>

                {/* Allocation bar, replaces the old pills */}
                {accounts.length > 0 && (
                    <View style={styles.alloc}>
                        <View style={styles.allocBar}>
                            {accounts.map((acc, i) => {
                                const pct = allocTotal > 0
                                    ? (Math.max(acc.balance, 0) / allocTotal) * 100
                                    : 100 / accounts.length;
                                return (
                                    <View
                                        key={acc.id}
                                        style={{ width: `${pct}%`, backgroundColor: getAccountColor(theme, acc.type, i) }}
                                    />
                                );
                            })}
                        </View>
                        <View style={styles.allocLegend}>
                            {accounts.map((acc, i) => (
                                <View key={acc.id} style={styles.allocItem}>
                                    <View style={styles.allocLabelRow}>
                                        <View style={[styles.allocDot, { backgroundColor: getAccountColor(theme, acc.type, i) }]} />
                                        <Text style={styles.allocLabel} numberOfLines={1}>
                                            {ACCOUNT_LABELS[acc.type] ?? acc.name}
                                        </Text>
                                    </View>
                                    <Text style={styles.allocValue}>{formatCurrencyShort(acc.balance)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Action buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => navigation.navigate('AddTransaction')}
                    >
                        <Text style={styles.btnPrimaryText}>+ Movimiento</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnSecondary}
                        onPress={() => navigation.navigate('ScheduledFunds')}
                    >
                        <Text style={styles.btnSecondaryText}>Programar</Text>
                    </TouchableOpacity>
                </View>

                {/* MSI pending */}
                {pendingMSI.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Cargos MSI</Text>
                        </View>
                        {pendingMSI.map(fund => (
                            <PendingFundCard
                                key={fund.id}
                                fund={fund}
                                status={getFundStatus(fund)}
                                theme={theme}
                                onPress={() => {
                                    Alert.alert(
                                        `MSI — ${fund.name}`,
                                        `Pago ${fund.paidMonths + 1} de ${fund.months}\n$${fund.monthlyAmount.toFixed(2)} de $${fund.totalAmount.toFixed(2)} total`,
                                        [
                                            { text: 'Cancelar', style: 'cancel' },
                                            {
                                                text: 'Confirmar pago',
                                                onPress: async () => {
                                                    await addTransaction({
                                                        type: 'expense',
                                                        amount: fund.monthlyAmount,
                                                        reason: `${fund.name} MSI ${fund.paidMonths + 1}/${fund.months}`,
                                                        category: 'services',
                                                        accountId: null,
                                                        creditCardId: fund.creditCardId,
                                                    });
                                                    await confirmMSI(fund.id);
                                                },
                                            },
                                        ]
                                    );
                                }}
                            />
                        ))}
                    </View>
                )}

                {/* Income pending */}
                {pendingIncome.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Por cobrar</Text>
                        </View>
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
                    </View>
                )}

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
                                <View key={card.id} style={styles.creditCard}>
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
                                </View>
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
                                Toca "+ Movimiento" para comenzar
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.txnCard}>
                            {recentTransactions.map((txn, i) => {
                                const visual = getTxnVisual(theme, txn.type);
                                return (
                                    <View
                                        key={txn.id}
                                        style={[
                                            styles.txnRow,
                                            i === recentTransactions.length - 1 && styles.txnRowLast,
                                        ]}
                                    >
                                        <View style={[styles.txnIconWrap, { backgroundColor: visual.bg }]}>
                                            <Text style={[styles.txnIconGlyph, { color: visual.color }]}>
                                                {visual.glyph}
                                            </Text>
                                        </View>
                                        <View style={styles.txnInfo}>
                                            <Text style={styles.txnName} numberOfLines={1}>
                                                {txn.reason}
                                            </Text>
                                            <Text style={styles.txnSub}>{txn.category}</Text>
                                        </View>
                                        <Text style={[
                                            styles.txnAmount,
                                            txn.type === 'income' ? styles.amountPos : styles.amountNeg,
                                        ]}>
                                            {txn.type === 'income' ? '+' : '−'}{formatCurrencyShort(txn.amount)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
}