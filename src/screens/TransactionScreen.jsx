// Screen to register a new expense, income, or transfer.
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
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FontSize, Spacing, getTagIcon, TAG_ICON_OPTIONS } from '../constants';
import { formatCurrency } from '../utils';
import createTransactionStyles from './TransactionScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import { IconChevronLeft, IconCheck, IconPlus } from '../components/Icons';
import { Sheet, Pill, Button, Field, FieldLabel, Money, GlassCard } from '../components/ui';

// Type accents: the two fixed-meaning colors (moneyOut/moneyIn) plus
// transfer's own token. No 'withdrawal' entry here — a plain retiro
// (no destination account, no category) isn't offered anywhere in
// this screen on purpose, see SECONDARY_TYPES below.
function getTypes(theme) {
    return {
        expense: { label: 'Gasto', color: theme.moneyOut, on: theme.brandOn },
        income: { label: 'Ingreso', color: theme.moneyIn, on: theme.brandOn },
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

    // Casilla de verificación — misma anatomía para "pagar con
    // crédito" y para MSI, solo cambia el acento.
    const Toggle = ({ on, accent, accentOn, label, onPress }) => (
        <TouchableOpacity style={styles.toggle} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
            <View style={[
                styles.checkbox,
                on && { backgroundColor: accent, borderColor: accent },
            ]}>
                {on && <IconCheck color={accentOn} size={11} />}
            </View>
            <Text style={styles.toggleText}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.root}>

            {/* ── Hero — type + amount ── */}
            <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
                {/* Colored glow behind amount */}
                <View style={[styles.heroGlow, { backgroundColor: cur.color + '22' }]} />

                {/* Back + title */}
                <View style={styles.heroTop}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Regresar"
                    >
                        <IconChevronLeft color={theme.ink} size={16} />
                    </TouchableOpacity>
                    <Text style={styles.heroTitle}>Nuevo movimiento</Text>
                    <View style={{ width: 38 }} />
                </View>

                {/* Type pills — only the two everyday ones, plus a
                    single control for everything else */}
                <View style={styles.typeRow}>
                    <Pill
                        label={TYPES.expense.label}
                        selected={type === 'expense'}
                        accent={TYPES.expense.color}
                        onPress={() => handleTypeChange('expense')}
                        style={styles.typePill}
                    />
                    <Pill
                        label={TYPES.income.label}
                        selected={type === 'income'}
                        accent={TYPES.income.color}
                        onPress={() => handleTypeChange('income')}
                        style={styles.typePill}
                    />
                    <Pill
                        label={isSecondaryType ? cur.label : 'Otro ›'}
                        selected={isSecondaryType}
                        accent={cur.color}
                        onPress={() => setShowTypeSheet(true)}
                        style={styles.typePill}
                    />
                </View>

                {/* Amount input */}
                <View style={styles.amountRow}>
                    <Text style={[styles.currencySign, { color: cur.color }]}>$</Text>
                    <DecimalInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor={theme.inkDim}
                        autoFocus
                    />
                </View>

                {/* MSI preview inline */}
                {isMSI && totalAmt > 0 && (
                    <View style={[styles.msiBanner, { borderColor: cur.color + '55' }]}>
                        <View style={styles.msiBannerRow}>
                            <Text style={styles.msiBannerText}>{msiMonths} pagos de</Text>
                            <Money value={monthly} size={FontSize.md} color={theme.msi} />
                            <Text style={styles.msiBannerText}>/mes</Text>
                        </View>
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
                    <Field
                        label="¿En qué?"
                        required
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Describe el movimiento"
                    />

                    {/* Tags — fully optional, purely for a future
                    breakdown by tag. Same pill row as accounts/MSI
                    months below, plus a trailing "+ Nueva" pill that
                    opens the inline creator sheet. */}
                    <FieldLabel optional>Etiquetas</FieldLabel>
                    <View style={styles.pillsWrap}>
                        {tags.map(tag => (
                            <Pill
                                key={tag.id}
                                label={tag.label}
                                icon={getTagIcon(tag.icon)}
                                selected={selectedTagIds.includes(tag.id)}
                                onPress={() => toggleTag(tag.id)}
                            />
                        ))}
                        <Pill label="Nueva" icon={IconPlus} onPress={() => setShowNewTag(true)} />
                    </View>

                    {/* Account(s) */}
                    {type === 'transfer' ? (
                        <>
                            <FieldLabel required>Cuenta origen</FieldLabel>
                            <View style={styles.pillsWrap}>
                                {accounts.map(item => (
                                    <Pill
                                        key={item.id}
                                        label={item.name}
                                        selected={selectedAccount === item.id}
                                        onPress={() => {
                                            setAccount(item.id);
                                            // Origin just changed — if it now
                                            // matches the destination, clear
                                            // the destination instead of
                                            // silently leaving an invalid
                                            // "same account" pair selected.
                                            if (toAccount === item.id) setToAccount(null);
                                        }}
                                    />
                                ))}
                            </View>

                            <FieldLabel required>Cuenta destino</FieldLabel>
                            <View style={styles.pillsWrap}>
                                {accounts.filter(item => item.id !== selectedAccount).map(item => (
                                    <Pill
                                        key={item.id}
                                        label={item.name}
                                        selected={toAccount === item.id}
                                        accent={theme.transfer}
                                        onPress={() => setToAccount(item.id)}
                                    />
                                ))}
                            </View>
                        </>
                    ) : (
                        <>
                            <FieldLabel required>Cuenta</FieldLabel>
                            {type === 'expense' && creditCards.length > 0 && (
                                <Toggle
                                    on={useCredit}
                                    accent={theme.cardPayment}
                                    accentOn={theme.cardPaymentOn}
                                    label="Pagar con tarjeta de crédito"
                                    onPress={() => { setUseCredit(!useCredit); setIsMSI(false); }}
                                />
                            )}
                            {/* One list, never both at once: débito while
                            useCredit is off, tarjetas while it's on —
                            picking a payment method replaces the list
                            instead of adding a second one below it. */}
                            <View style={styles.pillsWrap}>
                                {(useCredit ? creditCards : accounts).map(item => (
                                    <Pill
                                        key={item.id}
                                        label={item.name}
                                        selected={useCredit ? selectedCard === item.id : selectedAccount === item.id}
                                        accent={useCredit ? theme.cardPayment : undefined}
                                        onPress={() => useCredit ? setCard(item.id) : setAccount(item.id)}
                                    />
                                ))}
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
                                    <View style={styles.hintRow}>
                                        <Text style={[styles.fieldHint, overLimit && styles.fieldHintError]}>
                                            Disponible:{' '}
                                        </Text>
                                        <Money
                                            value={available}
                                            size={FontSize.xs + 1}
                                            color={overLimit ? theme.moneyOut : theme.inkMid}
                                            decimals={false}
                                        />
                                        <Text style={[styles.fieldHint, overLimit && styles.fieldHintError]}>
                                            {' '}de{' '}
                                        </Text>
                                        <Money
                                            value={card.limit}
                                            size={FontSize.xs + 1}
                                            color={theme.inkDim}
                                            decimals={false}
                                        />
                                    </View>
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
                            <Toggle
                                on={isMSI}
                                accent={theme.msi}
                                accentOn={theme.msiOn}
                                label="Meses sin intereses (MSI)"
                                onPress={() => setIsMSI(!isMSI)}
                            />

                            {isMSI && (
                                <>
                                    <FieldLabel>Meses</FieldLabel>
                                    <View style={styles.pillsWrap}>
                                        {MSI_OPTIONS.map(m => (
                                            <Pill
                                                key={m}
                                                label={`${m}m`}
                                                selected={msiMonths === m}
                                                accent={theme.msi}
                                                onPress={() => setMsiMonths(m)}
                                            />
                                        ))}
                                    </View>
                                </>
                            )}
                        </>
                    )}

                    {/* Confirm button */}
                    <View style={styles.actions}>
                        <Button
                            label={isMSI ? `Registrar MSI · ${msiMonths} meses` : `Registrar ${cur.label}`}
                            accent={isMSI ? theme.msi : cur.color}
                            accentOn={isMSI ? theme.msiOn : cur.on}
                            onPress={handleConfirm}
                        />
                    </View>

                    <View style={{ height: Spacing.xl + insets.bottom }} />
                </ScrollView>
            </GlassCard>

            {/* "Otro tipo" — just Traspaso now; Fondos programados
                moved to Home's own section, not reachable from here. */}
            {showTypeSheet && (
                <Sheet onClose={() => setShowTypeSheet(false)} title="Otro tipo de movimiento">
                    {SECONDARY_TYPES.map(key => (
                        <TouchableOpacity
                            key={key}
                            style={styles.typeOption}
                            onPress={() => handleTypeChange(key)}
                            accessibilityRole="button"
                        >
                            <View style={[styles.typeOptionDot, { backgroundColor: TYPES[key].color }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.typeOptionLabel}>{TYPES[key].label}</Text>
                                <Text style={styles.typeOptionDesc}>{TYPE_DESCRIPTIONS[key]}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </Sheet>
            )}

            {/* "+ Nueva" etiqueta — antes era una tarjeta centrada
                sobre un blur propio; ahora es la misma Sheet que el
                resto de la app, para no tener dos gramáticas de modal
                en la misma pantalla. El icono sale del mismo
                TAG_ICON_OPTIONS del que salen las etiquetas por
                defecto, así no hay un set aparte que mantener. */}
            {showNewTag && (
                <Sheet onClose={() => setShowNewTag(false)} title="Nueva etiqueta">
                    <Field
                        label="Nombre"
                        required
                        value={newTagName}
                        onChangeText={setNewTagName}
                        placeholder="Nombre de la etiqueta"
                        autoFocus
                    />

                    <FieldLabel>Ícono</FieldLabel>
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
                                            ? { backgroundColor: theme.brand + '29', borderColor: theme.brand }
                                            : { borderColor: theme.border },
                                    ]}
                                    onPress={() => setNewTagIcon(key)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                >
                                    <OptIcon color={isSelected ? theme.brand : theme.muted} size={16} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.actions}>
                        <Button label="Cancelar" variant="secondary" onPress={() => setShowNewTag(false)} />
                        <Button label="Crear etiqueta" onPress={handleCreateTag} style={{ flex: 2 }} />
                    </View>
                </Sheet>
            )}
        </View>
    );
}