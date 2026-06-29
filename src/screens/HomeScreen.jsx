// Main screen - where you see the general overview of your finances
// No logic here, only pre-computed results from hook useFinanceStore
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';
import styles from './HomeScreen.styles';
import FloatingButton from '../components/FloatingButton';

import { useFinance } from '../store/FinanceContext';
import PendingFundCard from '../components/PendingFundCard';


const ACCOUNT_ICONS = {
    cash: '💵',
    debit: '💳',
    savings: '🏦',
};

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
                            <Text style={styles.userName}>{settings.userName}</Text>
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
                    <TouchableOpacity
                        style={styles.btnOutline}
                        onPress={() => navigation.navigate('ScheduledFunds')}
                    >
                        <Text style={styles.btnOutlineText}>📅 Programar</Text>
                    </TouchableOpacity>
                </View>

                {/* MSI installments due */}
                {pendingFunds.filter(f => f.type === 'msi').length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Cargos MSI</Text>
                        </View>
                        {pendingFunds.filter(f => f.type === 'msi').map(fund => (
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

                {/* Pending income funds */}
                {pendingFunds.filter(f => f.type !== 'msi').length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Por cobrar</Text>
                        </View>
                        {pendingFunds.filter(f => f.type !== 'msi').map(fund => (
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
                                        }
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

            {/* Floating btn to add transac */}
            <FloatingButton
                onPress={() => navigation.navigate('AddTransaction')}
            />
        </SafeAreaView>
    );
}