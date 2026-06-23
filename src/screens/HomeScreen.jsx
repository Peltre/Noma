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
  cash:    '💵',
  debit:   '💳',
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
                                        <View style={[styles.progressFill, { width: `${percentage}%` }]}/> 
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
                <View>
                    
                </View>
            </ScrollView>
        </SafeAreaView>
    )

}

