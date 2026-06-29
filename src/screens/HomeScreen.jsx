// Main screen — general overview of finances
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { Colors } from '../constants';
import styles from './HomeScreen.styles';
import { useFinance } from '../store/FinanceContext';
import PendingFundCard from '../components/PendingFundCard';

// SVG-style icons via unicode geometric shapes replaced by
// colored View boxes — real icon lib (lucide-react-native)
// can swap these once installed in the project

// Per-account visual config
const ACCOUNT_CONFIG = {
    cash: {
        label: 'Efectivo',
        iconBg: 'rgba(13,139,133,0.18)',
        iconColor: Colors.teal,
        // Inline SVG-equivalent: a simple banknote shape drawn with Views
    },
    debit: {
        label: 'Débito',
        iconBg: 'rgba(74,110,138,0.2)',
        iconColor: Colors.slate,
    },
    savings: {
        label: 'Ahorros',
        iconBg: 'rgba(107,84,196,0.2)',
        iconColor: Colors.violet,
    },
};

// Minimal icon drawn with nested Views (no emoji, no lib dependency)
function AccountIcon({ type }) {
    const cfg = ACCOUNT_CONFIG[type] || ACCOUNT_CONFIG.cash;
    return (
        <View style={[styles.pillIconWrap, { backgroundColor: cfg.iconBg }]}>
            {/* Card shape for debit/cash, piggy-like circle for savings */}
            {type === 'savings' ? (
                <View style={[styles.iconCircle, { borderColor: cfg.iconColor }]} />
            ) : (
                <View style={[styles.iconCard, { borderColor: cfg.iconColor }]}>
                    <View style={[styles.iconCardStripe, { backgroundColor: cfg.iconColor }]} />
                </View>
            )}
        </View>
    );
}

// Transaction type icon — colored dot with type letter
function TxnIcon({ type }) {
    const map = {
        income: { bg: Colors.tealLt, color: Colors.teal, letter: '↓' },
        expense: { bg: Colors.coralLt, color: Colors.coral, letter: '↑' },
        withdrawal: { bg: Colors.goldLt, color: Colors.gold, letter: '→' },
    };
    const cfg = map[type] || map.expense;
    return (
        <View style={[styles.txnIconWrap, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.txnIconGlyph, { color: cfg.color }]}>{cfg.letter}</Text>
        </View>
    );
}

export default function HomeScreen() {
    const navigation = useNavigation();
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.violet} />
            </View>
        );
    }

    const recentTransactions = transactions.slice(0, 3);
    const pendingMSI = pendingFunds.filter(f => f.type === 'msi');
    const pendingIncome = pendingFunds.filter(f => f.type !== 'msi');

    return (
        <View style={styles.safeArea}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── Hero (dark, full-bleed from status bar) ── */}
                <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
                    {/* Decorative orb top-right */}
                    <View style={styles.heroOrbA} />
                    <View style={styles.heroOrbB} />

                    {/* Greeting */}
                    <View style={styles.heroTop}>
                        <View>
                            <Text style={styles.greeting}>Hola de nuevo,</Text>
                            <Text style={styles.userName}>{settings.userName}</Text>
                        </View>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {settings.userName?.[0]?.toUpperCase() ?? '?'}
                            </Text>
                        </View>
                    </View>

                    {/* Balance */}
                    <Text style={styles.balanceLabel}>Balance total</Text>
                    <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>

                    {/* Account pills inside hero */}
                    <View style={styles.pillsRow}>
                        {accounts.map(acc => {
                            const cfg = ACCOUNT_CONFIG[acc.type];
                            return (
                                <View key={acc.id} style={styles.pill}>
                                    <AccountIcon type={acc.type} />
                                    <Text style={styles.pillLabel}>
                                        {cfg?.label ?? acc.name}
                                    </Text>
                                    <Text style={styles.pillAmount}>
                                        {formatCurrencyShort(acc.balance)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

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
                            {recentTransactions.map((txn, i) => (
                                <View
                                    key={txn.id}
                                    style={[
                                        styles.txnRow,
                                        i === recentTransactions.length - 1 && styles.txnRowLast,
                                    ]}
                                >
                                    <TxnIcon type={txn.type} />
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
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
}