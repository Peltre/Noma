// Unified add/edit flow for both débito and crédito — one screen,
// type picked up front (locked once editing, since an existing
// account/card can't switch identity), live CardFace preview that
// fills in as you type.
import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontSize, Spacing } from '../constants';
import createAddCardStyles from './AddCardScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import CardFace, { CARD_PATTERNS } from '../components/CardFace';
import ColorPicker from 'react-native-wheel-color-picker';
import { ScreenHeader, Field, FieldLabel, Pill, Button, Money, fieldSurface } from '../components/ui';
import AppBackground from '../components/AppBackground';

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
    // Cycle the default color through the theme's own card palette
    // (constants/themes.js) instead of the fixed palette Ahorros
    // sub-accounts use — a card should feel like it belongs to the
    // app's night palette, not an arbitrary color wheel that happens
    // to be the same one savings apartados use. Picked once at mount,
    // not recalculated on every render.
    // Default: el acento de la app (turquesa) para la primera tarjeta;
    // las siguientes recorren la paleta del tema para que no salgan
    // todas iguales. Al editar, el color que ya tiene.
    const [color, setColor] = useState(() => {
        if (editCard?.color) return editCard.color;
        const count = accounts.filter(a => a.type === 'debit').length + creditCards.length;
        if (count === 0) return theme.cardDefault || '#236B61';
        return theme.cardColors[(count - 1) % theme.cardColors.length];
    });
    const [pattern, setPattern] = useState(editCard?.pattern || 'none');
    const [loading, setLoading] = useState(false);
    // Drives the ScrollView's scrollEnabled below — the color wheel's
    // own drag gesture and the form's scroll gesture both want to own
    // a vertical (or any) finger drag, and without this the ScrollView
    // can steal the gesture mid-drag on the wheel. True only for the
    // duration of an actual wheel/slider interaction, not the whole
    // time the picker is visible.
    const [pickerActive, setPickerActive] = useState(false);

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

    // El motivo por el que no se puede borrar, en el hint del botón:
    // el disabled explica en vez de solo no responder.
    const deleteHint = canDeleteNow
        ? null
        : typeIsCredit
            ? 'Paga la deuda antes de eliminar'
            : hasLinkedApartados
                ? 'Quita los apartados ligados antes de eliminar'
                : 'Vacía la cuenta antes de eliminar';

    return (
        <View style={styles.safeArea}>
            {/* Fondo propio: la pantalla sube desde abajo y, siendo
                transparente, mostraba Inicio detrás mientras llegaba. */}
            <AppBackground />
            <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEnabled={!pickerActive}
                keyboardShouldPersistTaps="handled"
            >
                <ScreenHeader
                    title={isEdit ? 'Editar tarjeta' : 'Nueva tarjeta'}
                    onBack={() => navigation.goBack()}
                />

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
                        valueAmount={typeIsCredit && limit ? Math.round(parseFloat(limit) || 0) : undefined}
                        valueText={typeIsCredit && !limit ? '—' : undefined}
                    />
                </View>

                <View style={styles.form}>

                    {/* Type — locked once editing */}
                    {!isEdit && (
                        <>
                            <FieldLabel>Tipo de tarjeta</FieldLabel>
                            <View style={styles.pillRow}>
                                <Pill
                                    label="Débito"
                                    selected={cardType === 'debit'}
                                    onPress={() => setCardType('debit')}
                                />
                                <Pill
                                    label="Crédito"
                                    selected={cardType === 'credit'}
                                    accent={theme.msi}
                                    onPress={() => setCardType('credit')}
                                />
                            </View>
                        </>
                    )}

                    <Field
                        label="Nombre de la tarjeta"
                        required
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. BBVA Azul, Amex Gold..."
                    />

                    {typeIsCredit && (
                        <>
                            <FieldLabel required>Límite de crédito</FieldLabel>
                            <DecimalInput
                                style={[styles.decimalInput, fieldSurface(theme)]}
                                value={limit}
                                onChangeText={setLimit}
                                placeholder="$0.00"
                                placeholderTextColor={theme.inkDim}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <FieldLabel required>Día de corte</FieldLabel>
                                    <DecimalInput
                                        style={[
                                            styles.decimalInput,
                                            fieldSurface(theme, { error: !!cutoffOutOfRange }),
                                        ]}
                                        value={cutoffDay}
                                        onChangeText={setCutoffDay}
                                        placeholder="5"
                                        placeholderTextColor={theme.inkDim}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                    <Text style={[styles.hint, cutoffOutOfRange && styles.hintError]}>
                                        Día del mes (1–31)
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FieldLabel required>Día de pago</FieldLabel>
                                    <DecimalInput
                                        style={[
                                            styles.decimalInput,
                                            fieldSurface(theme, { error: !!paymentOutOfRange }),
                                        ]}
                                        value={paymentDay}
                                        onChangeText={setPaymentDay}
                                        placeholder="25"
                                        placeholderTextColor={theme.inkDim}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                    <Text style={[styles.hint, paymentOutOfRange && styles.hintError]}>
                                        Día del mes (1–31)
                                    </Text>
                                </View>
                            </View>

                            {/* Same live-feedback pattern as the credit-
                                available hint below the account pills:
                                show the problem before "Guardar", not
                                only after. */}
                            {sameDayError && (
                                <Text style={[styles.hint, styles.hintError]}>
                                    El día de corte y el día de pago no pueden ser el mismo
                                </Text>
                            )}
                        </>
                    )}

                    {!typeIsCredit && isEdit && (
                        <View style={styles.balanceHintRow}>
                            <Text style={styles.hint}>Saldo actual: </Text>
                            <Money value={editCard.balance} size={FontSize.xs + 1} color={theme.inkMid} decimals={false} />
                            <Text style={styles.hint}> · se mueve con Traspasos o Ingresos, no se edita aquí.</Text>
                        </View>
                    )}

                    <FieldLabel>Color</FieldLabel>
                    {/* Any color at all, full HSV — no preset row above
                        this anymore. theme.cardColors still picks the
                        DEFAULT color for a brand new card (see the
                        color state's own comment above), just isn't
                        shown as tappable swatches here anymore.
                        swatches={false} because the library's own
                        default palette is generic and wouldn't fit any
                        theme in particular. useNativeLayout avoids a
                        layout-measurement footgun this screen already
                        hit once with a hand-rolled slider (see the
                        removed HueSlider.jsx, no longer used) — same
                        class of bug, this prop is the library's own
                        fix for it. onInteractionStart/
                        onColorChangeComplete bracket each drag to
                        disable the ScrollView above for just that
                        duration — see pickerActive's own comment for
                        why. */}
                    <View style={styles.pickerWrap}>
                        <ColorPicker
                            color={color}
                            onColorChange={setColor}
                            onInteractionStart={() => setPickerActive(true)}
                            onColorChangeComplete={(c) => {
                                setColor(c);
                                setPickerActive(false);
                            }}
                            thumbSize={30}
                            sliderSize={24}
                            swatches={false}
                            useNativeLayout={true}
                        />
                    </View>

                    <FieldLabel>Patrón</FieldLabel>
                    <View style={styles.pillRow}>
                        {CARD_PATTERNS.map(p => (
                            <Pill
                                key={p.id}
                                label={p.label}
                                selected={pattern === p.id}
                                onPress={() => setPattern(p.id)}
                            />
                        ))}
                    </View>

                    <View style={styles.actions}>
                        <Button
                            label={isEdit ? 'Guardar cambios' : 'Guardar tarjeta'}
                            loading={loading}
                            loadingLabel="Guardando…"
                            onPress={handleConfirm}
                        />
                    </View>

                    {isEdit && (
                        <>
                            <View style={styles.actionsSecondary}>
                                <Button
                                    label="Eliminar tarjeta"
                                    variant="danger"
                                    disabled={!canDeleteNow}
                                    onPress={handleDelete}
                                />
                            </View>
                            {!!deleteHint && (
                                <Text style={[styles.hint, styles.hintCentered]}>{deleteHint}</Text>
                            )}
                        </>
                    )}

                    <View style={{ height: Spacing.xl + Spacing.lg + insets.bottom }} />
                </View>
            </ScrollView>
        </View>
    );
}