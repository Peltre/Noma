// Screen to add an expense, withdrawal or income
// Can be accessed from a + icon in the main dashboard
import { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CATEGORIES } from '../constants';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';
import styles from './TransactionScreen.styles';

import { useFinance } from '../store/FinanceContext';
import { useRoute } from '@react-navigation/native';

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
    const route = useRoute();
    const { accounts, creditCards, addTransaction, confirmFund } = useFinance();

    // Read prefilled data if coming from pending fund
    const prefill = route.params?.prefill || null;

    // Form state
    const [type, setType] = useState(prefill?.type || 'expense');
    const [amount, setAmount] = useState(prefill?.amount || '');
    const [reason, setReason] = useState(prefill?.reason || '');
    const [selectedCategory, setCategory] = useState(prefill?.category || null);
    const [selectedAccount, setAccount] = useState(prefill?.accountId || accounts[0]?.id || null);
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

        // If coming from a programmed fund, advance the date
        if (prefill?.fundId) {
            await confirmFund(prefill.fundId);
        }

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
                                    <Text style={[
                                        styles.accountOptionText,
                                        selectedCard === card.id && { color: Colors.white }
                                    ]}>
                                        💳 {card.name}
                                    </Text>
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
                                    <Text style={[
                                        styles.accountOptionText,
                                        selectedAccount === acc.id && { color: Colors.white }
                                    ]}>
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
