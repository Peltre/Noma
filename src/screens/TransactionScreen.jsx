// Screen to add an expense, withdrawal or income
// Can be accessed from a + icon in the main dashboard
import { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFinanceStore } from '../store/useFinanceStore';
import { CATEGORIES } from '../constants';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

// visual config for each movement
const TYPES = {
    income: {
        label: 'Ingreso',
        emoji: '💰',
        color: Colors.sage,
        colorsLt: Colors.sageLt,
    },
    expense: {
        label: 'Gasto',
        emoji: '🛍️',
        color: Colors.red,
        colorsLt: Colors.redLt,
    },
    withdrawal: {
        label: 'Retiro',
        emoji: '💸',
        color: Colors.amber,
        colorsLt: Colors.amberLt,
    },
};

// Account names to show
const ACCOUNT_LABELS = {
    cash: 'Efectivo',
    debit: 'Tarjeta debito',
    savings: 'Ahorros',
};

export default function TransactionScreen() {
    const navigation = useNavigation();
    const { accounts, creditCards, addTransaction } = useFinanceStore();

    // Form state
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [selectedCategory, setCategory] = useState(null);
    const [selectedAccount, setAccount] = useState(accounts[0]?.id || null);
    const [selectedCard, setCard] = useState(null);
    const [useCredit, setUseCredit] = useState(false);

    const currentType = TYPES[type];
    const categories = CATEGORIES[type];

    // When changing type, reset category & cred
    const handleTypeChange = (newType) => {
        setType(newType);
        setCategory(null);
        setUseCredit(false);
        setCard(null);
    };

    const handleConfirm = async () => {
        // basic validations before actually saving
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Monto invalido', 'Ingresa un monto mayor a cero');
            return;
        }
        if (!reason.trim()) {
            Alert.alert('Falta indica la razon', 'Describe brevemente el movimiento');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Falta la categoria', 'Selecciona una categoria');
            return;
        }

        const transaction = {
            type,
            amount: parseFloat(amount),
            reason: reason.trim(),
            category: selectedCategory,
            accountId: useCredit ? null : selectedAccount,
            creditCardId: useCredit ? selectedCard : null,
        };

        await addTransaction(transaction);

        // Return to main dashboard after saving
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Nuevo movimiento</Text>
                </View>

                {/* Transaction type selector */}
                <View style={styles.typeRow}>
                    {Object.entries(TYPES).map(([key, val]) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.typeBtn,
                                type === key && {
                                    backgroundColor: val.colorsLt,
                                    borderColor: val.color,
                                }
                            ]}
                            onPress={() => handleTypeChange(key)}
                        >
                            <Text style={styles.typeEmoji}>{val.emoji}</Text>
                            <Text style={[
                                styles.typeLabel,
                                type === key && { color: val.color }
                            ]}>
                                {val.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Amount */}
                <View style={styles.amountContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType='decimal-pad'
                        placeholder='0.00'
                        placeholderTextColor={Colors.warmMid}
                    />
                </View>

                {/* Reason */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>En que?</Text>
                    <TextInput
                        style={styles.reasonInput}
                        value={reason}
                        onChangeText={setReason}
                        placeholder='Describe el movimiento'
                        placeholderTextColor={Colors.muted}
                    />
                </View>

                {/* Categories */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Categoria</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === cat.id && {
                                        backgroundColor: currentType.colorsLt,
                                        borderColor: currentType.color,
                                    }
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                <Text style={styles.categoryLabel}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Origin acc */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Cuenta</Text>

                    {/* Credit card option (only expenses) */}
                    {type === 'expense' && creditCards.length > 0 && (
                        <TouchableOpacity
                            style={styles.cerditToggle}
                            onPress={() => setUseCredit(!useCredit)}
                        >
                            <Text style={styles.creditToggleText}>
                                {useCredit ? '✅' : '⬜'} Pagar con tarjeta de credito
                            </Text>
                        </TouchableOpacity>
                    )}

                    {useCredit ? (
                        // Credit card selector
                        <View style={styles.accountList}>
                            {creditCards.map(card => (
                                <TouchableOpacity
                                    key={card.id}
                                    style={[
                                        styles.accountOption,
                                        selectedCard === card.id && styles.accountOptionSelected,
                                    ]}
                                    onPress={() => setCard(card.id)}
                                >
                                    <Text style={styles.accountOptionText}>💳 {card.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        // Normal acc selector
                        <View style={styles.accountList}>
                            {accounts.map(acc => (
                                <TouchableOpacity
                                    key={acc.id}
                                    style={[
                                        styles.accountOption,
                                        selectedAccount === acc.id && styles.accountOptionSelected,
                                    ]}
                                    onPress={() => setAccount(acc.id)}
                                >
                                    <Text style={styles.accountOptionText}>
                                        {ACCOUNT_LABELS[acc.type]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Confirm button */}
                <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: currentType.color }]}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmText}>
                        Registrar {currentType.label}
                    </Text>
                </TouchableOpacity>
                <View style={styles.bottonPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.warmMid,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: FontSize.lg,
        color: Colors.ink,
        fontWeight: '600',
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.ink,
    },

    // Type
    typeRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    typeBtn: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
        backgroundColor: Colors.white,
        gap: 4,
    },
    typeEmoji: { fontSize: 18 },
    typeLabel: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.muted,
    },

    // Amount
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.warmMid,
        marginBottom: Spacing.md,
        gap: Spacing.xs,
    },
    currencySymbol: {
        fontSize: 36,
        fontWeight: '300',
        color: Colors.muted,
    },
    amountInput: {
        fontSize: 52,
        fontWeight: '700',
        color: Colors.ink,
        minWidth: 120,
        textAlign: 'center',
    },

    // Fields
    fieldContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    fieldLabel: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: Spacing.sm,
    },
    reasonInput: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.ink,
        borderWidth: 1,
        borderColor: Colors.warmMid,
        ...Shadow.card,
    },

    // Categories
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    categoryItem: {
        width: '22%',
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
        backgroundColor: Colors.white,
        gap: 4,
        ...Shadow.card,
    },
    categoryEmoji: { fontSize: 22 },
    categoryLabel: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Account
    creditToggle: {
        marginBottom: Spacing.sm,
    },
    creditToggleText: {
        fontSize: FontSize.sm,
        color: Colors.ink,
        fontWeight: '500',
    },
    accountList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    accountOption: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
        backgroundColor: Colors.white,
        ...Shadow.card,
    },
    accountOptionSelected: {
        backgroundColor: Colors.ink,
        borderColor: Colors.ink,
    },
    accountOptionText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.ink,
    },

    // Confirm
    confirmBtn: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        padding: Spacing.md,
        borderRadius: Radius.sm,
        alignItems: 'center',
    },
    confirmText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: '700',
    },

    bottonPadding: { height: Spacing.xl }
})
