// Screen to register a new expense, income or withdrawal
// Dark hero with amount + type, white sheet slides up with the rest
import { useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CATEGORIES, ACCOUNT_LABELS, Colors, FontSize, Spacing, Radius } from '../constants';
import styles from './TransactionScreen.styles';
import { useFinance } from '../store/FinanceContext';

const TYPES = {
    expense: {
        label: 'Gasto', color: Colors.coral, lt: Colors.coralLt,
        heroColor: '#1C0D0D'
    },
    income: {
        label: 'Ingreso', color: Colors.teal, lt: Colors.tealLt,
        heroColor: '#0A1514'
    },
    withdrawal: {
        label: 'Retiro', color: Colors.gold, lt: Colors.goldLt,
        heroColor: '#181108'
    },
};

const MSI_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function TransactionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { accounts, creditCards, addTransaction, confirmFund, addMSI } = useFinance();

    const prefill = route.params?.prefill || null;

    const [type, setType] = useState(prefill?.type || 'expense');
    const [amount, setAmount] = useState(prefill?.amount || '');
    const [reason, setReason] = useState(prefill?.reason || '');
    const [selectedCategory, setCategory] = useState(prefill?.category || null);
    const [selectedAccount, setAccount] = useState(prefill?.accountId || accounts[0]?.id || null);
    const [selectedCard, setCard] = useState(null);
    const [useCredit, setUseCredit] = useState(false);
    const [isMSI, setIsMSI] = useState(false);
    const [msiMonths, setMsiMonths] = useState(12);

    const cur = TYPES[type];
    const categories = CATEGORIES[type];
    const canUseMSI = type === 'expense' && useCredit && selectedCard;
    const totalAmt = parseFloat(amount) || 0;
    const monthly = msiMonths > 0 ? totalAmt / msiMonths : 0;
    const firstPay = addMonths(new Date(), 1);

    const handleTypeChange = (t) => {
        setType(t); setCategory(null);
        setUseCredit(false); setCard(null); setIsMSI(false);
    };

    const handleConfirm = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero'); return;
        }
        if (!reason.trim()) {
            Alert.alert('Falta la razón', 'Describe brevemente el movimiento'); return;
        }
        if (!selectedCategory) {
            Alert.alert('Falta la categoría', 'Selecciona una categoría'); return;
        }
        if (isMSI && canUseMSI) {
            await addMSI({
                name: reason.trim(), totalAmount: parseFloat(amount),
                months: msiMonths, firstDate: firstPay.toISOString(),
                accountId: null, creditCardId: selectedCard,
            });
            await addTransaction({
                type: 'expense', amount: parseFloat(amount),
                reason: `${reason.trim()} (MSI ${msiMonths}m)`,
                category: selectedCategory,
                accountId: null, creditCardId: selectedCard,
            });
            navigation.goBack();
            return;
        }
        await addTransaction({
            type, amount: parseFloat(amount), reason: reason.trim(),
            category: selectedCategory,
            accountId: useCredit ? null : selectedAccount,
            creditCardId: useCredit ? selectedCard : null,
        });
        if (prefill?.fundId) await confirmFund(prefill.fundId);
        navigation.goBack();
    };

    return (
        <View style={styles.root}>

            {/* ── Dark hero — type + amount ── */}
            <View style={[styles.hero, { backgroundColor: cur.heroColor, paddingTop: insets.top + 8 }]}>
                {/* Colored glow behind amount */}
                <View style={[styles.heroGlow, { backgroundColor: cur.color + '22' }]} />

                {/* Back + title */}
                <View style={styles.heroTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.heroTitle}>Nuevo movimiento</Text>
                    <View style={{ width: 36 }} />
                </View>

                {/* Type pills */}
                <View style={styles.typeRow}>
                    {Object.entries(TYPES).map(([key, val]) => {
                        const active = type === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.typePill,
                                    active && { backgroundColor: val.color },
                                ]}
                                onPress={() => handleTypeChange(key)}
                            >
                                <Text style={[styles.typePillText, active && { color: Colors.white }]}>
                                    {val.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Amount input */}
                <View style={styles.amountRow}>
                    <Text style={[styles.currencySign, { color: cur.color }]}>$</Text>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        autoFocus
                    />
                </View>

                {/* MSI preview inline */}
                {isMSI && totalAmt > 0 && (
                    <View style={[styles.msiBanner, { borderColor: cur.color + '55' }]}>
                        <Text style={styles.msiBannerText}>
                            {msiMonths} pagos de{' '}
                            <Text style={[styles.msiBannerAmt, { color: cur.color }]}>
                                ${monthly.toFixed(2)}/mes
                            </Text>
                        </Text>
                        <Text style={styles.msiBannerSub}>
                            Primer cobro: {format(firstPay, "d 'de' MMMM", { locale: es })}
                        </Text>
                    </View>
                )}
            </View>

            {/* White sheet slides up */}
            <ScrollView
                style={styles.sheet}
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Reason */}
                <Text style={styles.fieldLabel}>¿EN QUÉ?</Text>
                <TextInput
                    style={styles.input}
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Describe el movimiento"
                    placeholderTextColor={Colors.muted}
                />

                {/* Category pills */}
                <Text style={styles.fieldLabel}>CATEGORÍA</Text>
                <View style={styles.pillsWrap}>
                    {categories.map(cat => {
                        const active = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.catPill,
                                    active
                                        ? { backgroundColor: cur.color, borderColor: cur.color }
                                        : { borderColor: Colors.mid },
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Text style={[
                                    styles.catPillText,
                                    active ? { color: Colors.white } : { color: Colors.muted },
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Account */}
                <Text style={styles.fieldLabel}>CUENTA</Text>
                {type === 'expense' && creditCards.length > 0 && (
                    <TouchableOpacity
                        style={styles.toggle}
                        onPress={() => { setUseCredit(!useCredit); setIsMSI(false); }}
                    >
                        <View style={[styles.checkbox, useCredit && styles.checkboxOn]}>
                            {useCredit && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.toggleText}>Pagar con tarjeta de crédito</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.pillsWrap}>
                    {(useCredit ? creditCards : accounts).map(item => {
                        const isSelected = useCredit
                            ? selectedCard === item.id
                            : selectedAccount === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.catPill,
                                    isSelected
                                        ? { backgroundColor: Colors.ink, borderColor: Colors.ink }
                                        : { borderColor: Colors.mid },
                                ]}
                                onPress={() => useCredit ? setCard(item.id) : setAccount(item.id)}
                            >
                                <Text style={[
                                    styles.catPillText,
                                    isSelected ? { color: Colors.white } : { color: Colors.muted },
                                ]}>
                                    {useCredit ? item.name : ACCOUNT_LABELS[item.type]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* MSI toggle */}
                {canUseMSI && (
                    <>
                        <TouchableOpacity
                            style={styles.toggle}
                            onPress={() => setIsMSI(!isMSI)}
                        >
                            <View style={[styles.checkbox, isMSI && { backgroundColor: Colors.violet, borderColor: Colors.violet }]}>
                                {isMSI && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.toggleText}>Meses sin intereses (MSI)</Text>
                        </TouchableOpacity>

                        {isMSI && (
                            <>
                                <Text style={[styles.fieldLabel, { marginTop: Spacing.sm }]}>MESES</Text>
                                <View style={styles.pillsWrap}>
                                    {MSI_OPTIONS.map(m => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[
                                                styles.catPill,
                                                msiMonths === m
                                                    ? { backgroundColor: Colors.violet, borderColor: Colors.violet }
                                                    : { borderColor: Colors.mid },
                                            ]}
                                            onPress={() => setMsiMonths(m)}
                                        >
                                            <Text style={[
                                                styles.catPillText,
                                                msiMonths === m ? { color: Colors.white } : { color: Colors.muted },
                                            ]}>
                                                {m}m
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                    </>
                )}

                {/* Confirm button */}
                <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: isMSI ? Colors.violet : cur.color }]}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmText}>
                        {isMSI ? `Registrar MSI · ${msiMonths} meses` : `Registrar ${cur.label}`}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: Spacing.xl + insets.bottom }} />
            </ScrollView>
        </View>
    );
}