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
import { SAVINGS_COLORS } from '../store/useSavings';

export default function AddCardScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const {
        addCreditCard, updateCreditCard, deleteCreditCard,
        addAccount, updateAccountDetails, deleteAccount,
        accounts, creditCards,
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createAddCardStyles(theme), [theme]);

    const editCard = route.params?.editCard || null;
    const isEdit = !!editCard;

    const [cardType, setCardType] = useState(editCard?.cardType || 'debit'); // 'debit' | 'credit'
    const [name, setName] = useState(editCard?.name || '');
    const [limit, setLimit] = useState(editCard?.limit ? String(editCard.limit) : '');
    const [cutoffDay, setCutoffDay] = useState(editCard?.cutoffDay ? String(editCard.cutoffDay) : '');
    const [paymentDay, setPaymentDay] = useState(editCard?.paymentDay ? String(editCard.paymentDay) : '');
    // Cycle the default color through the same palette Ahorros
    // sub-accounts use, so a brand new card doesn't default to plain
    // black — picked once at mount, not recalculated on every render.
    const [color, setColor] = useState(() => {
        if (editCard?.color) return editCard.color;
        const count = accounts.filter(a => a.type === 'debit').length + creditCards.length;
        return SAVINGS_COLORS[count % SAVINGS_COLORS.length];
    });
    const [pattern, setPattern] = useState(editCard?.pattern || 'none');
    const [loading, setLoading] = useState(false);

    const typeIsCredit = cardType === 'credit';
    const canDeleteNow = isEdit && (typeIsCredit ? editCard.currentDebt === 0 : editCard.balance === 0);

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
                        <Text style={styles.backText}>←</Text>
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
                                    <Text style={styles.inputHint}>Día del mes (1–31)</Text>
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
                                    <Text style={styles.inputHint}>Día del mes (1–31)</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {!typeIsCredit && isEdit && (
                        <Text style={styles.inputHint}>
                            Saldo actual: {formatCurrencyShort(editCard.balance)}. Se mueve con Traspasos o Ingresos — no se edita aquí.
                        </Text>
                    )}

                    <Text style={styles.fieldLabel}>COLOR</Text>
                    <View style={styles.colorRow}>
                        {SAVINGS_COLORS.map(c => (
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
                                    : (typeIsCredit ? 'Paga la deuda antes de eliminar' : 'Vacía la cuenta antes de eliminar')}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ height: Spacing.xl + Spacing.lg }} />
                </View>
            </ScrollView>
        </View>
    );
}