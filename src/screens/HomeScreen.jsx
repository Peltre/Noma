// Main screen - where you see the general overview of your finances
// No logic here, only pre-computed results from hook useFinanceStore
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

const ACCOUNT_ICONS = {
    cash: '💵',
    debit: '💳',
    savings: '🏦',
};

export default function HomeScreen() {
    const navigation = useNavigation();
    const {
        accounts,
        transactions,
        creditCards,
        totalBalance,
        isLoading,
    } = useFinanceStore();

    // While data is loading show progress bar / spinner
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.sage} />
            </View>
        )
    };

    // Show most recent movements
    const recentTransactions = transactions.slice(0, 3);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Dark header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greeting}>Hola de nuevo, </Text>
                            <Text style={styles.userName}>Name</Text>
                        </View>
                        <View styles={styles.avatar}>
                            <Text style={styles.avatarText}>K</Text>
                        </View>
                    </View>

                    <Text style={styles.balanceLabel}>Balance total</Text>
                    <Text style={styles.balanceAmount}>
                        {formatCurrency(totalBalance)}
                    </Text>
                </View>

                {/* Accounts */}
                <View style={styles.accountsRow}>
                    {accounts.map(account => (
                        <View key={account.id} style={styles.accountPill}>
                            <Text style={styles.accountIcon}>
                                {ACCOUNT_ICONS[account.type]}
                            </Text>
                            <Text style={styles.accountLabel}>{account.name}</Text>
                            <Text style={styles.accountAmount}>
                                {formatCurrencyShort(account.balance)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => navigation.navigate('AddTransaction')}
                    >
                        <Text style={styles.btnPrimaryText}>+ Agregar fondos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnOutline}>
                        <Text style={styles.btnOutlineText}>📅 Programar</Text>
                    </TouchableOpacity>
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
                            const percentage = Math.round((card.currentDebt / card.limit) * 100);
                            return (
                                <View key={card.id} style={styles.creditCardRow}>
                                    <View style={styles.creditCardTop}>
                                        <Text style={styles.credCardName}>{card.name}</Text>
                                        <Text style={styles.creditCardDebt}>
                                            {formatCurrencyShort(card.currentDebt)} / {formatCurrencyShort(card.limit)}
                                        </Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                                    </View>
                                    <View style={styles.creditCardMeta}>
                                        <Text style={styles.metaText}>Corte: {card.cutoffDay} de cada mes</Text>
                                        <Text style={styles.metaText}>{percentage}% usado</Text>
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
                            <Text style={styles.sectionLink}>Historial</Text>
                        </TouchableOpacity>
                    </View>

                    {recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Aun no hay movimientos</Text>
                            <Text style={styles.emptySubText}>
                                Toca "Agregar fondos" para comenzar
                            </Text>
                        </View>
                    ) : (
                        recentTransactions.map(txn => (
                            <View key={txn.id} style={styles.txnItem}>
                                <View style={[
                                    styles.txnIcon,
                                    txn.type === 'income' ? styles.txnIconIncome :
                                        txn.type === 'expense' ? styles.txnIconExpense :
                                            styles.txnIconWithdrawal
                                ]}>
                                    <Text style={styles.txnIconEmoji}>
                                        {txn.type === 'income' ? '💰' : txn.type === 'expense' ? '🛍️' : '💸'}
                                    </Text>
                                </View>
                                <View style={styles.txnInfo}>
                                    <Text style={styles.txnName}>{txn.reason}</Text>
                                    <Text style={styles.txnSub}>{txn.category}</Text>
                                </View>
                                <Text style={[
                                    styles.txnAmount,
                                    txn.type === 'income' ? styles.amountPos : styles.amountNeg
                                ]}>
                                    {txn.type === 'income' ? '+' : '-'}{formatCurrencyShort(txn.amount)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },
    scroll: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.paper,
    },

    // Header
    header: {
        backgroundColor: Colors.ink,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    greeting: {
        fontSize: FontSize.lg,
        color: 'rgba(255,255,255,0.5)',
    },
    userName: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.white,
        marginTop: 2,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.sage,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.md,
    },
    balanceLabel: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: Spacing.xs,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: -1,
    },

    // Account handling
    accountsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.lg,
        paddingBottom: 0,
    },
    accountPill: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: Radius.md,
        padding: Spacing.md,
        ...Shadow.card,
    },
    accountIcon: {
        fontSize: 20,
        marginBottom: Spacing.xs,
    },
    accountLabel: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontWeight: '600',
        marginBottom: 2,
    },
    accountAmount: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
    },

    // Buttons
    actionRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.lg,
        paddingBottom: 0,
    },
    btnPrimary: {
        flex: 1,
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: FontSize.sm,
    },
    btnOutline: {
        flex: 1,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
    },
    btnOutlineText: {
        color: Colors.ink,
        fontWeight: '500',
        fontSize: FontSize.sm,
    },

    // Sections
    section: {
        padding: Spacing.lg,
        paddingBottom: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.ink,
    },
    sectionLink: {
        fontSize: FontSize.sm,
        color: Colors.muted,
    },

    // Credit Cards
    creditCardRow: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadow.card,
    },
    creditCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    credCardName: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.ink,
    },
    creditCardDebt: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        color: Colors.red,
    },
    progressBat: {
        height: 4,
        backgroundColor: Colors.warmMid,
        borderRadius: 2,
        overflow: 'hidden',
    },
    creditCardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.xs,
    },
    metaText: {
        fontSize: FontSize.xs,
        color: Colors.muted,
    },

    // Recent transactions
    txnItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.warmMid,
    },
    txnIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txnIconIncome: { backgroundColor: Colors.sageLt },
    txnIconExpense: { backgroundColor: Colors.redLt },
    txnIconWithdrawal: { backgroundColor: Colors.amberLt },
    txnIconEmoji: { fontSize: 16 },
    txnInfo: { flex: 1 },
    txnName: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        color: Colors.ink,
    },
    txnSub: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 1,
    },
    txnAmount: {
        fontSize: FontSize.sm,
        fontWeight: '700',
    },
    amountPos: { color: Colors.sage },
    amountNeg: { color: Colors.red },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        collor: Colors.muted,
    },
    emptySubText: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        marginTop: Spacing.xs,
    },

    bottomPadding: { height: Spacing.xl },
});

