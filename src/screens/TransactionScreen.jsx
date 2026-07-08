// Screen to register a new expense, income or withdrawal
// Hero with amount + type, sheet slides up with the rest
import { useMemo, useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CATEGORIES, ACCOUNT_LABELS, Spacing } from '../constants';
import { formatCurrency } from '../utils';
import createTransactionStyles from './TransactionScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';

// Type accents: only the two fixed-meaning colors (moneyOut/moneyIn)
// plus a neutral for withdrawal — same reduced palette as the rest
// of the app, no per-type dark hero tones. Transfer uses brand, same
// reasoning as the MSI toggle below: it's a special flow (money
// moving between the user's own accounts), not a money-in/money-out
// signal, so it shouldn't borrow moneyIn or moneyOut.
function getTypes(theme) {
    return {
        expense: { label: 'Gasto', color: theme.moneyOut, on: theme.brandOn },
        income: { label: 'Ingreso', color: theme.moneyIn, on: theme.brandOn },
        withdrawal: { label: 'Retiro', color: theme.ink, on: theme.bg },
        transfer: { label: 'Traspaso', color: theme.brand, on: theme.brandOn },
    };
}

const MSI_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function TransactionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { accounts, creditCards, addTransaction, confirmFund, addMSI } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createTransactionStyles(theme), [theme]);
    const TYPES = useMemo(() => getTypes(theme), [theme]);

    const prefill = route.params?.prefill || null;

    const [type, setType] = useState(prefill?.type || 'expense');
    const [amount, setAmount] = useState(prefill?.amount || '');
    const [reason, setReason] = useState(prefill?.reason || '');
    const [selectedCategory, setCategory] = useState(prefill?.category || null);
    const [selectedAccount, setAccount] = useState(prefill?.accountId || accounts[0]?.id || null);
    const [selectedCard, setCard] = useState(null);
    const [toAccount, setToAccount] = useState(null);
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
        setToAccount(null);
    };

    const handleConfirm = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero'); return;
        }
        if (!reason.trim()) {
            Alert.alert('Falta la razón', 'Describe brevemente el movimiento'); return;
        }
        if (type === 'transfer') {
            if (!toAccount) {
                Alert.alert('Falta la cuenta destino', 'Selecciona a dónde va el dinero'); return;
            }
        } else if (!selectedCategory) {
            Alert.alert('Falta la categoría', 'Selecciona una categoría'); return;
        }
        if (isMSI && canUseMSI) {
            // addTransaction first — it's the one that validates the
            // credit limit. Only schedule the MSI installments if the
            // actual purchase/debt was created successfully; otherwise
            // we'd end up with a scheduled fund tracking a purchase
            // that never happened.
            const result = await addTransaction({
                type: 'expense', amount: parseFloat(amount),
                reason: `${reason.trim()} (MSI ${msiMonths}m)`,
                category: selectedCategory,
                accountId: null, creditCardId: selectedCard,
            });
            if (result?.error) {
                Alert.alert('No se pudo registrar', result.error);
                return;
            }
            await addMSI({
                name: reason.trim(), totalAmount: parseFloat(amount),
                months: msiMonths, firstDate: firstPay.toISOString(),
                accountId: null, creditCardId: selectedCard,
            });
            navigation.goBack();
            return;
        }
        const result = await addTransaction({
            type, amount: parseFloat(amount), reason: reason.trim(),
            category: type === 'transfer' ? null : selectedCategory,
            accountId: useCredit ? null : selectedAccount,
            toAccountId: type === 'transfer' ? toAccount : null,
            creditCardId: useCredit ? selectedCard : null,
        });
        if (result?.error) {
            Alert.alert('No se pudo registrar', result.error);
            return;
        }
        // Only mark the pending fund as confirmed if this is still the
        // same kind of movement it was opened as — if the user switched
        // type (e.g. from Ingreso to Gasto) before saving, this is no
        // longer "that" income and shouldn't silently resolve it.
        if (prefill?.fundId && type === prefill.type) {
            await confirmFund(prefill.fundId);
        }
        navigation.goBack();
    };

    return (
        <View style={styles.root}>

            {/* ── Hero — type + amount ── */}
            <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
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
                                <Text style={[styles.typePillText, active && { color: val.on }]}>
                                    {val.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Amount input */}
                <View style={styles.amountRow}>
                    <Text style={[styles.currencySign, { color: cur.color }]}>$</Text>
                    <DecimalInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor={theme.muted}
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

            {/* Sheet slides up */}
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
                    placeholderTextColor={theme.muted}
                />

                {/* Category pills — a transfer moves the user's own
                    money between their own accounts, there's nothing
                    to categorize */}
                {type !== 'transfer' && (
                    <>
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
                                                : { borderColor: theme.border },
                                        ]}
                                        onPress={() => setCategory(cat.id)}
                                    >
                                        <Text style={[
                                            styles.catPillText,
                                            active ? { color: cur.on } : { color: theme.muted },
                                        ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* Account(s) */}
                {type === 'transfer' ? (
                    <>
                        <Text style={styles.fieldLabel}>CUENTA ORIGEN</Text>
                        <View style={styles.pillsWrap}>
                            {accounts.map(item => {
                                const isSelected = selectedAccount === item.id;
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.catPill,
                                            isSelected
                                                ? { backgroundColor: theme.ink, borderColor: theme.ink }
                                                : { borderColor: theme.border },
                                        ]}
                                        onPress={() => {
                                            setAccount(item.id);
                                            // Origin just changed — if it now
                                            // matches the destination, clear
                                            // the destination instead of
                                            // silently leaving an invalid
                                            // "same account" pair selected.
                                            if (toAccount === item.id) setToAccount(null);
                                        }}
                                    >
                                        <Text style={[
                                            styles.catPillText,
                                            isSelected ? { color: theme.bg } : { color: theme.muted },
                                        ]}>
                                            {ACCOUNT_LABELS[item.type]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={styles.fieldLabel}>CUENTA DESTINO</Text>
                        <View style={styles.pillsWrap}>
                            {accounts.filter(item => item.id !== selectedAccount).map(item => {
                                const isSelected = toAccount === item.id;
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.catPill,
                                            isSelected
                                                ? { backgroundColor: theme.brand, borderColor: theme.brand }
                                                : { borderColor: theme.border },
                                        ]}
                                        onPress={() => setToAccount(item.id)}
                                    >
                                        <Text style={[
                                            styles.catPillText,
                                            isSelected ? { color: theme.brandOn } : { color: theme.muted },
                                        ]}>
                                            {ACCOUNT_LABELS[item.type]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </>
                ) : (
                    <>
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
                                                ? { backgroundColor: theme.ink, borderColor: theme.ink }
                                                : { borderColor: theme.border },
                                        ]}
                                        onPress={() => useCredit ? setCard(item.id) : setAccount(item.id)}
                                    >
                                        <Text style={[
                                            styles.catPillText,
                                            isSelected ? { color: theme.bg } : { color: theme.muted },
                                        ]}>
                                            {useCredit ? item.name : ACCOUNT_LABELS[item.type]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Credit available — the store enforces the
                            actual limit, this is just showing the
                            person before they hit "Confirmar" instead
                            of only after. */}
                        {useCredit && selectedCard && (() => {
                            const card = creditCards.find(c => c.id === selectedCard);
                            if (!card) return null;
                            const available = Math.max(0, card.limit - card.currentDebt);
                            const overLimit = totalAmt > available;
                            return (
                                <Text style={[styles.fieldHint, overLimit && { color: theme.moneyOut, fontWeight: '700' }]}>
                                    Disponible: {formatCurrency(available)} de {formatCurrency(card.limit)}
                                </Text>
                            );
                        })()}
                    </>
                )}

                {/* MSI toggle — uses brand, the one accent reserved for
                    primary CTAs, since MSI is a special flow, not a
                    money-in/money-out signal */}
                {canUseMSI && (
                    <>
                        <TouchableOpacity
                            style={styles.toggle}
                            onPress={() => setIsMSI(!isMSI)}
                        >
                            <View style={[styles.checkbox, isMSI && { backgroundColor: theme.brand, borderColor: theme.brand }]}>
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
                                                    ? { backgroundColor: theme.brand, borderColor: theme.brand }
                                                    : { borderColor: theme.border },
                                            ]}
                                            onPress={() => setMsiMonths(m)}
                                        >
                                            <Text style={[
                                                styles.catPillText,
                                                msiMonths === m ? { color: theme.brandOn } : { color: theme.muted },
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
                    style={[styles.confirmBtn, { backgroundColor: isMSI ? theme.brand : cur.color }]}
                    onPress={handleConfirm}
                >
                    <Text style={[styles.confirmText, { color: isMSI ? theme.brandOn : cur.on }]}>
                        {isMSI ? `Registrar MSI · ${msiMonths} meses` : `Registrar ${cur.label}`}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: Spacing.xl + insets.bottom }} />
            </ScrollView>
        </View>
    );
}