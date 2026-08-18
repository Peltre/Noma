// Screen to register a new expense, income or withdrawal.
// Hero with amount + type, sheet slides up with the rest.
//
// Only Gasto/Ingreso sit in the hero as one-tap pills — the
// overwhelming majority of what gets logged here. Traspaso lives
// behind "Otro tipo" instead, since its form shape (two accounts) is
// different enough not to promise the same simplicity up front.
//
// Fondos programados/mensualidades have no presence here — a
// recurring reminder doesn't move money the moment it's created, so
// it lives entirely under Home's "Fondos programados" instead.
//
// No category picker — it was required friction with no payoff
// (nothing filters/charts by it). The description shown in
// History/Home is what the person types; category still exists as an
// internal tag for app-generated transactions (MSI, card payments,
// goal purchases), never something a person picks.
import { useMemo, useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    ScrollView, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Spacing, getTagIcon, TAG_ICON_OPTIONS } from '../constants';
import { formatCurrency } from '../utils';
import createTransactionStyles from './TransactionScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import { IconChevronLeft, IconCheck, IconPlus } from '../components/Icons';
import GlassCard from '../components/GlassCard';

// Type accents: the two fixed-meaning colors (moneyOut/moneyIn) plus
// a neutral for withdrawal. Transfer uses its own transfer token — a
// special flow (money between the user's own accounts), not a
// money-in/out signal, but still visually distinct from Ingreso.
function getTypes(theme) {
    return {
        expense: { label: 'Gasto', color: theme.moneyOut, on: theme.brandOn },
        income: { label: 'Ingreso', color: theme.moneyIn, on: theme.brandOn },
        withdrawal: { label: 'Retiro', color: theme.ink, on: theme.bg },
        transfer: { label: 'Traspaso', color: theme.transfer, on: theme.transferOn },
    };
}

// Types that live behind "Otro tipo" instead of the hero row.
// Withdrawal isn't here — the only manual case ("moved money to
// another of my accounts") is already correctly Traspaso, which keeps
// the money tracked; a withdrawal makes it vanish with no
// destination, which should only happen automatically (card/MSI payments).
const SECONDARY_TYPES = ['transfer'];
const TYPE_DESCRIPTIONS = {
    transfer: 'Mover dinero entre tus propias cuentas',
};

const MSI_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function TransactionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { accounts, creditCards, addTransaction, confirmFund, addMSI, tags, addTag } = useFinance();
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
    const [showTypeSheet, setShowTypeSheet] = useState(false);

    // Tags — always optional, unlike everything else on this screen.
    // selectedTagIds is just a plain array of tag ids; the "+ Nueva"
    // sheet below creates a tag in useTags and immediately selects it.
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [showNewTag, setShowNewTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagIcon, setNewTagIcon] = useState('other');

    const toggleTag = (id) => {
        setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const handleCreateTag = async () => {
        const result = await addTag({ label: newTagName, icon: newTagIcon });
        if (result?.error) {
            Alert.alert('No se pudo crear', result.error);
            return;
        }
        setSelectedTagIds(prev => [...prev, result.id]);
        setNewTagName('');
        setNewTagIcon('other');
        setShowNewTag(false);
    };

    const cur = TYPES[type];
    const canUseMSI = type === 'expense' && useCredit && selectedCard;
    const totalAmt = parseFloat(amount) || 0;
    const monthly = msiMonths > 0 ? totalAmt / msiMonths : 0;
    const firstPay = addMonths(new Date(), 1);

    const handleTypeChange = (t) => {
        setType(t);
        setUseCredit(false); setCard(null); setIsMSI(false);
        setToAccount(null);
        setShowTypeSheet(false);
    };

    const handleConfirm = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero'); return;
        }
        if (!reason.trim()) {
            Alert.alert('Falta la razón', 'Describe brevemente el movimiento'); return;
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
                tagIds: selectedTagIds,
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
            tagIds: selectedTagIds,
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
                        <IconChevronLeft color={theme.ink} size={16} />
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
            <GlassCard style={styles.sheetWrap}>
                <ScrollView
                    style={styles.sheet}
                    contentContainerStyle={styles.sheetContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Reason / name — the only descriptive field now, and
                    what History/Home actually show for this movement */}
                    <Text style={styles.fieldLabel}>¿EN QUÉ? <Text style={styles.requiredMark}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Describe el movimiento"
                        placeholderTextColor={theme.muted}
                    />

                    {/* Tags — fully optional, purely for a future
                    breakdown by tag. Same pillsWrap pattern as
                    accounts/MSI months below, plus a trailing "+
                    Nueva" pill that opens the inline creator sheet. */}
                    <Text style={styles.fieldLabel}>ETIQUETAS <Text style={styles.optionalHint}>(opcional)</Text></Text>
                    <View style={styles.pillsWrap}>
                        {tags.map(tag => {
                            const TagIcon = getTagIcon(tag.icon);
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                                <TouchableOpacity
                                    key={tag.id}
                                    style={[
                                        styles.tagPill,
                                        isSelected
                                            ? { backgroundColor: theme.brandSoft, borderColor: theme.brand }
                                            : { borderColor: theme.border },
                                    ]}
                                    onPress={() => toggleTag(tag.id)}
                                >
                                    <TagIcon color={isSelected ? theme.brand : theme.muted} size={14} />
                                    <Text style={[styles.tagPillText, { color: isSelected ? theme.brand : theme.muted }]}>
                                        {tag.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity style={styles.tagAddPill} onPress={() => setShowNewTag(true)}>
                            <IconPlus color={theme.muted} size={12} />
                            <Text style={styles.tagPillText}>Nueva</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Account(s) */}
                    {type === 'transfer' ? (
                        <>
                            <Text style={styles.fieldLabel}>CUENTA ORIGEN <Text style={styles.requiredMark}>*</Text></Text>
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

                            <Text style={styles.fieldLabel}>CUENTA DESTINO <Text style={styles.requiredMark}>*</Text></Text>
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
                            <Text style={styles.fieldLabel}>CUENTA <Text style={styles.requiredMark}>*</Text></Text>
                            {type === 'expense' && creditCards.length > 0 && (
                                <TouchableOpacity
                                    style={styles.toggle}
                                    onPress={() => { setUseCredit(!useCredit); setIsMSI(false); }}
                                >
                                    <View style={[styles.checkbox, useCredit && styles.checkboxOn]}>
                                        {useCredit && <IconCheck color={theme.bg} size={11} />}
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

                    {/* MSI toggle — uses theme.msi, the same accent MSI
                    installments show in History/Home once scheduled,
                    so the color already means "MSI" before the person
                    even confirms. */}
                    {canUseMSI && (
                        <>
                            <TouchableOpacity
                                style={styles.toggle}
                                onPress={() => setIsMSI(!isMSI)}
                            >
                                <View style={[styles.checkbox, isMSI && { backgroundColor: theme.msi, borderColor: theme.msi }]}>
                                    {isMSI && <IconCheck color={theme.msiOn} size={11} />}
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
                                                        ? { backgroundColor: theme.msi, borderColor: theme.msi }
                                                        : { borderColor: theme.border },
                                                ]}
                                                onPress={() => setMsiMonths(m)}
                                            >
                                                <Text style={[
                                                    styles.catPillText,
                                                    msiMonths === m ? { color: theme.msiOn } : { color: theme.muted },
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
                        style={[styles.confirmBtn, { backgroundColor: isMSI ? theme.msi : cur.color }]}
                        onPress={handleConfirm}
                    >
                        <Text style={[styles.confirmText, { color: isMSI ? theme.msiOn : cur.on }]}>
                            {isMSI ? `Registrar MSI · ${msiMonths} meses` : `Registrar ${cur.label}`}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: Spacing.xl + insets.bottom }} />
                </ScrollView>
            </GlassCard>

            {/* "Otro tipo" — just Traspaso now; Fondos programados
                moved to Home's own section, not reachable from here. */}
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

            {/* "+ Nueva" tag — centered card over a blurred backdrop,
                not a bottom sheet (see tagModalOverlay in the
                stylesheet for why). Icon picker built from the same
                TAG_ICON_OPTIONS list every default tag draws from, so
                there's no separate icon set to maintain. */}
            <Modal visible={showNewTag} transparent animationType="fade" onRequestClose={() => setShowNewTag(false)}>
                <BlurView intensity={40} tint="dark" style={styles.tagModalOverlay}>
                    <TouchableOpacity style={styles.tagModalBackdrop} activeOpacity={1} onPress={() => setShowNewTag(false)} />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.tagModalKav}
                    >
                        <View style={styles.tagModalCard}>
                            <Text style={styles.typeSheetTitle}>Nueva etiqueta</Text>
                            <TextInput
                                style={styles.input}
                                value={newTagName}
                                onChangeText={setNewTagName}
                                placeholder="Nombre de la etiqueta"
                                placeholderTextColor={theme.muted}
                                autoFocus
                            />
                            <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>ÍCONO</Text>
                            <View style={styles.pillsWrap}>
                                {TAG_ICON_OPTIONS.map(key => {
                                    const OptIcon = getTagIcon(key);
                                    const isSelected = newTagIcon === key;
                                    return (
                                        <TouchableOpacity
                                            key={key}
                                            style={[
                                                styles.iconOption,
                                                isSelected
                                                    ? { backgroundColor: theme.brand, borderColor: theme.brand }
                                                    : { borderColor: theme.border },
                                            ]}
                                            onPress={() => setNewTagIcon(key)}
                                        >
                                            <OptIcon color={isSelected ? theme.brandOn : theme.muted} size={16} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.brand, marginTop: Spacing.lg }]}
                                onPress={handleCreateTag}
                            >
                                <Text style={[styles.confirmText, { color: theme.brandOn }]}>Crear etiqueta</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </BlurView>
            </Modal>
        </View>
    );
}