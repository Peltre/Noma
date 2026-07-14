// Screen to register a new expense, income or withdrawal
// Hero with amount + type, sheet slides up with the rest
//
// Only Gasto/Ingreso sit in the hero as one-tap pills — they're the
// overwhelming majority of what gets logged here. Retiro/Traspaso/
// Programada live behind a single "Otro tipo" control instead of
// competing for space in the same row: they don't just need less
// room, their whole form shape is different (two accounts for a
// traspaso, a future date for programada), so showing all five as
// equal peers up front was promising a simplicity the rest of the
// screen couldn't keep.
//
// No category picker anymore — it was a required field with no
// payoff (nothing in the app filters or charts by it), so it was
// pure friction on the most common action in the app. The
// description the person already has to type is what shows in
// History/Home now; category still exists as an internal tag for
// transactions the APP creates on its own (MSI, card payments, goal
// purchases), just never as something a person has to pick.
import { useMemo, useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    ScrollView, Alert, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Spacing } from '../constants';
import { formatCurrency } from '../utils';
import createTransactionStyles from './TransactionScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import DatePickerField from '../components/DatePickerField';

// Type accents: only the two fixed-meaning colors (moneyOut/moneyIn)
// plus a neutral for withdrawal — same reduced palette as the rest
// of the app, no per-type dark hero tones. Transfer uses brand, same
// reasoning as the MSI toggle below: it's a special flow (money
// moving between the user's own accounts), not a money-in/money-out
// signal, so it shouldn't borrow moneyIn or moneyOut. Scheduled gets
// its own accent (theme.savings) so it doesn't collide with either.
function getTypes(theme) {
    return {
        expense: { label: 'Gasto', color: theme.moneyOut, on: theme.brandOn },
        income: { label: 'Ingreso', color: theme.moneyIn, on: theme.brandOn },
        withdrawal: { label: 'Retiro', color: theme.ink, on: theme.bg },
        transfer: { label: 'Traspaso', color: theme.brand, on: theme.brandOn },
        scheduled: { label: 'Programada', color: theme.savings, on: '#FFFFFF' },
    };
}

// Types that live behind "Otro tipo" instead of the hero row.
// Withdrawal isn't here on purpose — the only place a person would
// reach for it manually is "I moved money to another account of
// mine", and Traspaso already covers that correctly (the money stays
// tracked, just in a different account). A withdrawal makes it
// vanish from the total with no destination, which is only right
// for what the app already does on its own (paying a card, an MSI
// installment) — never something worth a person picking by hand.
const SECONDARY_TYPES = ['transfer', 'scheduled'];
const TYPE_DESCRIPTIONS = {
    transfer: 'Mover dinero entre tus propias cuentas',
    scheduled: 'Algo que se repite — quincena, renta, etc.',
};

const FREQUENCIES = [
    { key: 'weekly', label: 'Semanal' },
    { key: 'biweekly', label: 'Quincenal' },
    { key: 'monthly', label: 'Mensual' },
];

const MSI_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function TransactionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { accounts, creditCards, addTransaction, confirmFund, addMSI, addScheduledFund } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createTransactionStyles(theme), [theme]);
    const TYPES = useMemo(() => getTypes(theme), [theme]);

    const prefill = route.params?.prefill || null;

    const [type, setType] = useState(prefill?.type || 'expense');
    const [amount, setAmount] = useState(prefill?.amount || '');
    const [reason, setReason] = useState(prefill?.reason || '');
    const [selectedAccount, setAccount] = useState(prefill?.accountId || accounts[0]?.id || null);
    const [selectedCard, setCard] = useState(null);
    const [toAccount, setToAccount] = useState(null);
    const [useCredit, setUseCredit] = useState(false);
    const [isMSI, setIsMSI] = useState(false);
    const [msiMonths, setMsiMonths] = useState(12);
    const [frequency, setFrequency] = useState('biweekly');
    const [nextDate, setNextDate] = useState(null);
    const [showTypeSheet, setShowTypeSheet] = useState(false);

    const cur = TYPES[type];
    const canUseMSI = type === 'expense' && useCredit && selectedCard;
    const totalAmt = parseFloat(amount) || 0;
    const monthly = msiMonths > 0 ? totalAmt / msiMonths : 0;
    const firstPay = addMonths(new Date(), 1);

    const handleTypeChange = (t) => {
        setType(t);
        setUseCredit(false); setCard(null); setIsMSI(false);
        setToAccount(null); setNextDate(null);
        setShowTypeSheet(false);
    };

    const handleConfirm = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero'); return;
        }
        if (!reason.trim()) {
            Alert.alert(type === 'scheduled' ? 'Falta el nombre' : 'Falta la razón', 'Describe brevemente el movimiento'); return;
        }
        // Scheduling doesn't move any money now — it just remembers a
        // recurring income so it shows as a reminder later (same
        // mechanism ScheduledFundsScreen's own form already used).
        if (type === 'scheduled') {
            if (!nextDate) {
                Alert.alert('Falta la fecha', 'Selecciona la próxima fecha.'); return;
            }
            if (!selectedAccount) {
                Alert.alert('Falta la cuenta', 'Selecciona una cuenta destino.'); return;
            }
            await addScheduledFund({
                name: reason.trim(),
                amount: parseFloat(amount),
                frequency,
                accountId: selectedAccount,
                nextDate: nextDate.toISOString(),
            });
            Alert.alert('Programado', `"${reason.trim()}" aparecerá como recordatorio cuando se acerque la fecha.`);
            navigation.goBack();
            return;
        }
        if (type === 'transfer' && !toAccount) {
            Alert.alert('Falta la cuenta destino', 'Selecciona a dónde va el dinero'); return;
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
                category: null,
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
            category: null,
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
        if (result.savingsWarning) {
            Alert.alert(
                'Usaste fondos de ahorro',
                `Este movimiento usó ${formatCurrency(result.savingsWarning.newlyAtRisk)} que tenías apartado como ahorro en ${result.savingsWarning.accountName}.`,
                [{ text: 'Entendido', onPress: () => navigation.goBack() }]
            );
            return;
        }
        navigation.goBack();
    };

    const isSecondaryType = SECONDARY_TYPES.includes(type);

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

                {/* Type pills — only the two everyday ones, plus a
                    single control for everything else */}
                <View style={styles.typeRow}>
                    <TouchableOpacity
                        style={[styles.typePill, type === 'expense' && { backgroundColor: TYPES.expense.color }]}
                        onPress={() => handleTypeChange('expense')}
                    >
                        <Text style={[styles.typePillText, type === 'expense' && { color: TYPES.expense.on }]}>
                            {TYPES.expense.label}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typePill, type === 'income' && { backgroundColor: TYPES.income.color }]}
                        onPress={() => handleTypeChange('income')}
                    >
                        <Text style={[styles.typePillText, type === 'income' && { color: TYPES.income.on }]}>
                            {TYPES.income.label}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typePill, isSecondaryType && { backgroundColor: cur.color }]}
                        onPress={() => setShowTypeSheet(true)}
                    >
                        <Text style={[styles.typePillText, isSecondaryType && { color: cur.on }]}>
                            {isSecondaryType ? cur.label : 'Otro ›'}
                        </Text>
                    </TouchableOpacity>
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
                {/* Reason / name — the only descriptive field now, and
                    what History/Home actually show for this movement */}
                <Text style={styles.fieldLabel}>{type === 'scheduled' ? 'NOMBRE' : '¿EN QUÉ?'}</Text>
                <TextInput
                    style={styles.input}
                    value={reason}
                    onChangeText={setReason}
                    placeholder={type === 'scheduled' ? 'Ej. Quincena, Renta, Freelance...' : 'Describe el movimiento'}
                    placeholderTextColor={theme.muted}
                />

                {/* Account(s) */}
                {type === 'scheduled' ? (
                    <>
                        <Text style={styles.fieldLabel}>FRECUENCIA</Text>
                        <View style={styles.pillsWrap}>
                            {FREQUENCIES.map(f => {
                                const active = frequency === f.key;
                                return (
                                    <TouchableOpacity
                                        key={f.key}
                                        style={[
                                            styles.catPill,
                                            active
                                                ? { backgroundColor: cur.color, borderColor: cur.color }
                                                : { borderColor: theme.border },
                                        ]}
                                        onPress={() => setFrequency(f.key)}
                                    >
                                        <Text style={[
                                            styles.catPillText,
                                            active ? { color: cur.on } : { color: theme.muted },
                                        ]}>
                                            {f.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={styles.fieldLabel}>PRÓXIMA FECHA</Text>
                        <DatePickerField
                            value={nextDate}
                            onChange={setNextDate}
                            placeholder="Selecciona una fecha"
                            minimumDate={new Date()}
                        />

                        <Text style={[styles.fieldLabel, { marginTop: Spacing.sm }]}>CUENTA DESTINO</Text>
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
                                        onPress={() => setAccount(item.id)}
                                    >
                                        <Text style={[
                                            styles.catPillText,
                                            isSelected ? { color: theme.bg } : { color: theme.muted },
                                        ]}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={{ marginTop: Spacing.sm }}
                            onPress={() => navigation.navigate('ScheduledFunds')}
                        >
                            <Text style={styles.linkText}>Ver mis programados →</Text>
                        </TouchableOpacity>
                    </>
                ) : type === 'transfer' ? (
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
                                            {item.name}
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
                                            {item.name}
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
                        {/* One list, never both at once: débito while
                            useCredit is off, tarjetas while it's on —
                            picking a payment method replaces the list
                            instead of adding a second one below it. */}
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
                                            {item.name}
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
                        {type === 'scheduled' ? 'Programar' : isMSI ? `Registrar MSI · ${msiMonths} meses` : `Registrar ${cur.label}`}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: Spacing.xl + insets.bottom }} />
            </ScrollView>

            {/* "Otro tipo" — Retiro/Traspaso/Programada, explained,
                one tap away without ever crowding the hero */}
            <Modal visible={showTypeSheet} transparent animationType="slide" onRequestClose={() => setShowTypeSheet(false)}>
                <View style={styles.modalBg}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowTypeSheet(false)} />
                    <View style={styles.typeSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.typeSheetTitle}>Otro tipo de movimiento</Text>
                        {SECONDARY_TYPES.map(key => (
                            <TouchableOpacity
                                key={key}
                                style={styles.typeOption}
                                onPress={() => handleTypeChange(key)}
                            >
                                <View style={[styles.typeOptionDot, { backgroundColor: TYPES[key].color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.typeOptionLabel}>{TYPES[key].label}</Text>
                                    <Text style={styles.typeOptionDesc}>{TYPE_DESCRIPTIONS[key]}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}