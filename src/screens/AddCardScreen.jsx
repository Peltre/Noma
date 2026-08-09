// Unified add/edit flow for both débito and crédito — one screen,
// type picked up front (locked once editing, since an existing
// account/card can't switch identity), live CardFace preview that
// fills in as you type.
import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatCurrencyShort } from '../utils';
import { Spacing } from '../constants';
import createAddCardStyles from './AddCardScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import CardFace, { CARD_PATTERNS } from '../components/CardFace';
import { IconChevronLeft } from '../components/Icons';

export default function AddCardScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const {
        addCreditCard, updateCreditCard, deleteCreditCard,
        addAccount, updateAccountDetails, deleteAccount,
        accounts, creditCards, savingsAccounts,
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createAddCardStyles(theme), [theme]);

    const editCard = route.params?.editCard || null;
    const isEdit = !!editCard;

    const [cardType, setCardType] = useState(editCard?.cardType || route.params?.presetType || 'debit'); // 'debit' | 'credit'
    const [name, setName] = useState(editCard?.name || '');
    const [limit, setLimit] = useState(editCard?.limit ? String(editCard.limit) : '');
    const [cutoffDay, setCutoffDay] = useState(editCard?.cutoffDay ? String(editCard.cutoffDay) : '');
    const [paymentDay, setPaymentDay] = useState(editCard?.paymentDay ? String(editCard.paymentDay) : '');
    // Cycle the default color through the active theme's own card
    // palette (constants/themes.js) instead of the fixed palette
    // Ahorros sub-accounts use — a card someone colors on Brasa should
    // feel like it belongs there, not an arbitrary color wheel that
    // happens to be the same one savings apartados use. Picked once
    // at mount, not recalculated on every render.
    const [color, setColor] = useState(() => {
        if (editCard?.color) return editCard.color;
        const count = accounts.filter(a => a.type === 'debit').length + creditCards.length;
        return theme.cardColors[count % theme.cardColors.length];
    });
    const [pattern, setPattern] = useState(editCard?.pattern || 'none');
    const [loading, setLoading] = useState(false);

    const typeIsCredit = cardType === 'credit';
    // A débito account with linked apartados can't be deleted either
    // (see FinanceContext's wrapped deleteAccount) — checked here too
    // so the button already shows as disabled instead of only
    // failing with an Alert after it's tapped.
    const hasLinkedApartados = isEdit && !typeIsCredit
        && savingsAccounts.some(sa => sa.linkedAccountId === editCard.id);
    const canDeleteNow = isEdit
        && (typeIsCredit ? editCard.currentDebt === 0 : editCard.balance === 0 && !hasLinkedApartados);

    // Live validity for the two day fields — same "show it before
    // Guardar, not just after" idea as the credit-available hint.
    // Empty is left alone here (not yet an error mid-typing); the
    // hard block for empty/out-of-range still happens in
    // handleConfirm below.
    const cutoffOutOfRange = cutoffDay !== '' && (parseInt(cutoffDay, 10) < 1 || parseInt(cutoffDay, 10) > 31);
    const paymentOutOfRange = paymentDay !== '' && (parseInt(paymentDay, 10) < 1 || parseInt(paymentDay, 10) > 31);
    const sameDayError = !cutoffOutOfRange && !paymentOutOfRange
        && cutoffDay && paymentDay && parseInt(cutoffDay, 10) === parseInt(paymentDay, 10);

    const handleConfirm = async () => {
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Ingresa el nombre de la tarjeta'); return;
        }
        if (typeIsCredit) {
            if (!limit || parseFloat(limit) <= 0) {
                Alert.alert('Límite inválido', 'Ingresa un límite mayor a 0'); return;
            }
            if (!cutoffDay || parseInt(cutoffDay, 10) < 1 || parseInt(cutoffDay, 10) > 31) {
                Alert.alert('Día inválido', 'El día de corte debe ser entre 1 y 31'); return;
            }
            if (!paymentDay || parseInt(paymentDay, 10) < 1 || parseInt(paymentDay, 10) > 31) {
                Alert.alert('Día inválido', 'El día de pago debe ser entre 1 y 31'); return;
            }
            // The one ordering that's wrong no matter how the two days
            // get interpreted. Both are stored as a plain "day of
            // month" (1–31) with no month attached, and a payment day
            // that's numerically SMALLER than the cutoff day is
            // usually the normal case in real life (e.g. corte día
            // 28, pago día 15 — of the following month), so that
            // can't be flagged without risking rejecting the most
            // common real-world setup. The exact same day, though, is
            // never valid — every real card leaves at least a few
            // days between the statement closing and payment being due.
            if (parseInt(cutoffDay, 10) === parseInt(paymentDay, 10)) {
                Alert.alert('Días iguales', 'El día de corte y el día de pago no pueden ser el mismo.'); return;
            }
        }

        setLoading(true);
        let result;
        if (isEdit) {
            result = typeIsCredit
                ? await updateCreditCard(editCard.id, {
                    name, color, pattern,
                    limit: parseFloat(limit),
                    cutoffDay: parseInt(cutoffDay, 10),
                    paymentDay: parseInt(paymentDay, 10),
                })
                : await updateAccountDetails({ accountId: editCard.id, name, color, pattern });
        } else {
            result = typeIsCredit
                ? await addCreditCard({
                    name, color, pattern,
                    limit: parseFloat(limit),
                    cutoffDay: parseInt(cutoffDay, 10),
                    paymentDay: parseInt(paymentDay, 10),
                })
                : await addAccount({ name, type: 'debit', color, pattern });
        }
        setLoading(false);
        if (result?.error) {
            Alert.alert('No se pudo guardar', result.error);
            return;
        }
        navigation.goBack();
    };

    const handleDelete = () => {
        if (!canDeleteNow) return;
        Alert.alert(
            'Eliminar tarjeta',
            `¿Eliminar "${editCard.name}"? Esto no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive', onPress: async () => {
                        const result = typeIsCredit
                            ? await deleteCreditCard(editCard.id)
                            : await deleteAccount(editCard.id);
                        if (result?.error) {
                            Alert.alert('No se pudo eliminar', result.error);
                            return;
                        }
                        navigation.goBack();
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <IconChevronLeft color={theme.ink} size={16} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{isEdit ? 'Editar tarjeta' : 'Nueva tarjeta'}</Text>
                </View>

                {/* Live card preview — same component the grid and
                    detail sheet use, so what you design here is
                    exactly what you'll see everywhere else. */}
                <View style={styles.previewWrap}>
                    <CardFace
                        name={name}
                        type={cardType}
                        color={color}
                        pattern={pattern}
                        variant="preview"
                        placeholder="Nombre tarjeta"
                        valueLabel={typeIsCredit ? 'LÍMITE' : undefined}
                        valueText={typeIsCredit ? (limit ? formatCurrencyShort(parseFloat(limit)) : '—') : undefined}
                    />
                </View>

                <View style={styles.form}>

                    {/* Type — locked once editing */}
                    {!isEdit && (
                        <>
                            <Text style={styles.fieldLabel}>TIPO DE TARJETA</Text>
                            <View style={styles.typeRow}>
                                <TouchableOpacity
                                    style={[styles.typeBtn, cardType === 'debit' && styles.typeBtnActive]}
                                    onPress={() => setCardType('debit')}
                                >
                                    <Text style={[styles.typeBtnText, cardType === 'debit' && styles.typeBtnTextActive]}>
                                        Débito
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeBtn, cardType === 'credit' && styles.typeBtnActive]}
                                    onPress={() => setCardType('credit')}
                                >
                                    <Text style={[styles.typeBtnText, cardType === 'credit' && styles.typeBtnTextActive]}>
                                        Crédito
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    <Text style={styles.fieldLabel}>NOMBRE DE LA TARJETA</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. BBVA Azul, Amex Gold..."
                        placeholderTextColor={theme.muted}
                    />

                    {typeIsCredit && (
                        <>
                            <Text style={styles.fieldLabel}>LÍMITE DE CRÉDITO</Text>
                            <DecimalInput
                                style={styles.input}
                                value={limit}
                                onChangeText={setLimit}
                                placeholder="$0.00"
                                placeholderTextColor={theme.muted}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fieldLabel}>DÍA DE CORTE</Text>
                                    <DecimalInput
                                        style={styles.input}
                                        value={cutoffDay}
                                        onChangeText={setCutoffDay}
                                        placeholder="5"
                                        placeholderTextColor={theme.muted}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                    <Text style={[styles.inputHint, cutoffOutOfRange && { color: theme.moneyOut, fontWeight: '700' }]}>
                                        Día del mes (1–31)
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fieldLabel}>DÍA DE PAGO</Text>
                                    <DecimalInput
                                        style={styles.input}
                                        value={paymentDay}
                                        onChangeText={setPaymentDay}
                                        placeholder="25"
                                        placeholderTextColor={theme.muted}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                    <Text style={[styles.inputHint, paymentOutOfRange && { color: theme.moneyOut, fontWeight: '700' }]}>
                                        Día del mes (1–31)
                                    </Text>
                                </View>
                            </View>

                            {/* Same live-feedback pattern as the credit-
                                available hint below the account pills:
                                show the problem before "Guardar", not
                                only after. */}
                            {sameDayError && (
                                <Text style={[styles.inputHint, { color: theme.moneyOut, fontWeight: '700' }]}>
                                    El día de corte y el día de pago no pueden ser el mismo
                                </Text>
                            )}
                        </>
                    )}

                    {!typeIsCredit && isEdit && (
                        <Text style={styles.inputHint}>
                            Saldo actual: {formatCurrencyShort(editCard.balance)}. Se mueve con Traspasos o Ingresos — no se edita aquí.
                        </Text>
                    )}

                    <Text style={styles.fieldLabel}>COLOR</Text>
                    <View style={styles.colorRow}>
                        {theme.cardColors.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
                                onPress={() => setColor(c)}
                            />
                        ))}
                    </View>

                    <Text style={styles.fieldLabel}>PATRÓN</Text>
                    <View style={styles.patternRow}>
                        {CARD_PATTERNS.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={[styles.patternChip, pattern === p.id && styles.patternChipActive]}
                                onPress={() => setPattern(p.id)}
                            >
                                <Text style={[styles.patternChipText, pattern === p.id && styles.patternChipTextActive]}>
                                    {p.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        <Text style={styles.confirmBtnText}>
                            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar tarjeta'}
                        </Text>
                    </TouchableOpacity>

                    {isEdit && (
                        <TouchableOpacity
                            style={[styles.deleteBtn, !canDeleteNow && styles.deleteBtnDisabled]}
                            onPress={handleDelete}
                            disabled={!canDeleteNow}
                        >
                            <Text style={[styles.deleteBtnText, !canDeleteNow && styles.deleteBtnTextDisabled]}>
                                {canDeleteNow
                                    ? 'Eliminar tarjeta'
                                    : (typeIsCredit
                                        ? 'Paga la deuda antes de eliminar'
                                        : hasLinkedApartados
                                            ? 'Quita los apartados ligados antes de eliminar'
                                            : 'Vacía la cuenta antes de eliminar')}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ height: Spacing.xl + Spacing.lg }} />
                </View>
            </ScrollView>
        </View>
    );
}