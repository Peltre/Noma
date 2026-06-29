// Screen to add an expense, withdrawal or income
// Expenses can optionally be registered as MSI (months without interest)
import { useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CATEGORIES } from '../constants';
import { Colors, FontSize, Spacing, Radius } from '../constants';
import styles from './TransactionScreen.styles';
import { useFinance } from '../store/FinanceContext';

const TYPES = {
    income: { label: 'Ingreso', color: Colors.sage, colorsLt: Colors.sageLt },
    expense: { label: 'Gasto', color: Colors.red, colorsLt: Colors.redLt },
    withdrawal: { label: 'Retiro', color: Colors.amber, colorsLt: Colors.amberLt },
};

const ACCOUNT_LABELS = {
    cash: 'Efectivo',
    debit: 'Débito',
    savings: 'Ahorros',
};

const MSI_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function TransactionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { accounts, creditCards, addTransaction, confirmFund, addMSI } = useFinance();

    const prefill = route.params?.prefill || null;

    // Form state
    const [type, setType] = useState(prefill?.type || 'expense');
    const [amount, setAmount] = useState(prefill?.amount || '');
    const [reason, setReason] = useState(prefill?.reason || '');
    const [selectedCategory, setCategory] = useState(prefill?.category || null);
    const [selectedAccount, setAccount] = useState(prefill?.accountId || accounts[0]?.id || null);
    const [selectedCard, setCard] = useState(null);
    const [useCredit, setUseCredit] = useState(false);

    // MSI state
    const [isMSI, setIsMSI] = useState(false);
    const [msiMonths, setMsiMonths] = useState(12);

    const currentType = TYPES[type];
    const categories = CATEGORIES[type];

    const handleTypeChange = (newType) => {
        setType(newType);
        setCategory(null);
        setUseCredit(false);
        setCard(null);
        setIsMSI(false);
    };

    // Show MSI toggle only for expense + credit card
    const canUseMSI = type === 'expense' && useCredit && selectedCard;

    // Monthly breakdown for preview
    const totalAmt = parseFloat(amount) || 0;
    const monthlyAmt = msiMonths > 0 ? totalAmt / msiMonths : 0;

    // First payment = next month same day
    const firstPaymentDate = addMonths(new Date(), 1);

    const handleConfirm = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero');
            return;
        }
        if (!reason.trim()) {
            Alert.alert('Falta la razón', 'Describe brevemente el movimiento');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Falta la categoría', 'Selecciona una categoría');
            return;
        }

        // MSI path
        if (isMSI && canUseMSI) {
            if (!msiMonths || msiMonths <= 0) {
                Alert.alert('Meses inválidos', 'Selecciona el número de meses');
                return;
            }
            await addMSI({
                name: reason.trim(),
                totalAmount: parseFloat(amount),
                months: msiMonths,
                firstDate: firstPaymentDate.toISOString(),
                accountId: null,
                creditCardId: selectedCard,
            });
            // Also register the expense on the credit card immediately
            await addTransaction({
                type: 'expense',
                amount: parseFloat(amount),
                reason: `${reason.trim()} (MSI ${msiMonths}m)`,
                category: selectedCategory,
                accountId: null,
                creditCardId: selectedCard,
            });
            navigation.goBack();
            return;
        }

        // Normal path
        const transaction = {
            type,
            amount: parseFloat(amount),
            reason: reason.trim(),
            category: selectedCategory,
            accountId: useCredit ? null : selectedAccount,
            creditCardId: useCredit ? selectedCard : null,
        };
        await addTransaction(transaction);

        if (prefill?.fundId) await confirmFund(prefill.fundId);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Nuevo movimiento</Text>
                </View>

                {/* Type selector */}
                <View style={styles.typeRow}>
                    {Object.entries(TYPES).map(([key, val]) => (
                        <TouchableOpacity
                            key={key}
                            style={[styles.typeBtn, type === key && { backgroundColor: val.colorsLt, borderColor: val.color }]}
                            onPress={() => handleTypeChange(key)}
                        >
                            <Text style={[styles.typeLabel, type === key && { color: val.color }]}>{val.label}</Text>
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
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={Colors.warmMid}
                    />
                </View>

                {/* MSI breakdown preview */}
                {isMSI && totalAmt > 0 && (
                    <View style={styles.msiPreview}>
                        <Text style={styles.msiPreviewText}>
                            {msiMonths} pagos de{' '}
                            <Text style={styles.msiPreviewAmount}>
                                ${monthlyAmt.toFixed(2)}/mes
                            </Text>
                        </Text>
                        <Text style={styles.msiPreviewSub}>
                            Primer cobro: {format(firstPaymentDate, "d 'de' MMMM", { locale: es })}
                        </Text>
                    </View>
                )}

                {/* Reason */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>¿En qué?</Text>
                    <TextInput
                        style={styles.reasonInput}
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Describe el movimiento"
                        placeholderTextColor={Colors.muted}
                    />
                </View>

                {/* Categories */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Categoría</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === cat.id && { backgroundColor: currentType.colorsLt, borderColor: currentType.color },
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                <Text style={styles.categoryLabel}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Account */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Cuenta</Text>

                    {type === 'expense' && creditCards.length > 0 && (
                        <TouchableOpacity
                            style={styles.creditToggle}
                            onPress={() => { setUseCredit(!useCredit); setIsMSI(false); }}
                        >
                            <View style={[styles.checkbox, useCredit && styles.checkboxActive]}>
                                {useCredit && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.creditToggleText}>Pagar con tarjeta de crédito</Text>
                        </TouchableOpacity>
                    )}

                    {useCredit ? (
                        <View style={styles.accountList}>
                            {creditCards.map(card => (
                                <TouchableOpacity
                                    key={card.id}
                                    style={[styles.accountOption, selectedCard === card.id && styles.accountOptionSelected]}
                                    onPress={() => setCard(card.id)}
                                >
                                    <Text style={[styles.accountOptionText, selectedCard === card.id && { color: Colors.white }]}>
                                        {card.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.accountList}>
                            {accounts.map(acc => (
                                <TouchableOpacity
                                    key={acc.id}
                                    style={[styles.accountOption, selectedAccount === acc.id && styles.accountOptionSelected]}
                                    onPress={() => setAccount(acc.id)}
                                >
                                    <Text style={[styles.accountOptionText, selectedAccount === acc.id && { color: Colors.white }]}>
                                        {ACCOUNT_LABELS[acc.type]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* MSI toggle - only when paying with a credit card */}
                {canUseMSI && (
                    <View style={styles.fieldContainer}>
                        <TouchableOpacity
                            style={styles.creditToggle}
                            onPress={() => setIsMSI(!isMSI)}
                        >
                            <View style={[styles.checkbox, isMSI && styles.checkboxActiveMsi]}>
                                {isMSI && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.creditToggleText}>Meses sin intereses (MSI)</Text>
                        </TouchableOpacity>

                        {isMSI && (
                            <>
                                <Text style={[styles.fieldLabel, { marginTop: Spacing.sm }]}>NÚMERO DE MESES</Text>
                                <View style={styles.msiMonthsRow}>
                                    {MSI_OPTIONS.map(m => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[styles.msiMonthBtn, msiMonths === m && styles.msiMonthBtnActive]}
                                            onPress={() => setMsiMonths(m)}
                                        >
                                            <Text style={[styles.msiMonthText, msiMonths === m && styles.msiMonthTextActive]}>
                                                {m}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                )}

                {/* Confirm */}
                <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: isMSI ? Colors.purple : currentType.color }]}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmText}>
                        {isMSI ? `Registrar MSI (${msiMonths} meses)` : `Registrar ${currentType.label}`}
                    </Text>
                </TouchableOpacity>

                <View style={styles.bottonPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}