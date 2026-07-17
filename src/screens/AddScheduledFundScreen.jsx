// Screen to create or edit a scheduled fund (a recurring income
// reminder — quincena, renta, freelance). Same create/edit-in-one-
// screen pattern as AddCardScreen: route.params?.editFund decides
// which mode this is, one form serves both.
//
// MSI installments don't come through here — they're created only
// from Nuevo Movimiento (paying with credit + MSI), and their own
// edit surface is a small modal on ScheduledFundsScreen, not this
// screen, since almost none of their fields (amount, months, which
// card) are safe to change after the purchase already happened. See
// updateScheduledFund's comment in useScheduleFunds.js for why.
import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parseISO } from 'date-fns';
import { Spacing } from '../constants';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import { IconChevronLeft } from '../components/Icons';
import DecimalInput from '../components/DecimalInput';
import DatePickerField from '../components/DatePickerField';
import createAddScheduledFundStyles from './AddScheduledFundScreen.styles';

const FREQUENCIES = [
    { key: 'weekly', label: 'Semanal' },
    { key: 'biweekly', label: 'Quincenal' },
    { key: 'monthly', label: 'Mensual' },
];

export default function AddScheduledFundScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { accounts, addScheduledFund, updateScheduledFund, removeScheduledFund } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createAddScheduledFundStyles(theme), [theme]);

    const editFund = route.params?.editFund || null;
    const isEdit = !!editFund;

    const [name, setName] = useState(editFund?.name || '');
    const [amount, setAmount] = useState(editFund ? String(editFund.amount) : '');
    const [frequency, setFrequency] = useState(editFund?.frequency || 'biweekly');
    const [accountId, setAccountId] = useState(editFund?.accountId || accounts[0]?.id || null);
    const [nextDate, setNextDate] = useState(editFund ? parseISO(editFund.nextDate) : null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Ej. Quincena, Renta, Freelance...');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero.');
            return;
        }
        if (!nextDate) {
            Alert.alert('Falta la fecha', 'Selecciona la próxima fecha.');
            return;
        }
        if (!accountId) {
            Alert.alert('Falta la cuenta', 'Selecciona una cuenta destino.');
            return;
        }

        setLoading(true);
        const payload = {
            name: name.trim(),
            amount: parseFloat(amount),
            frequency,
            accountId,
            nextDate: nextDate.toISOString(),
        };

        if (isEdit) {
            await updateScheduledFund(editFund.id, payload);
        } else {
            await addScheduledFund(payload);
        }
        setLoading(false);

        Alert.alert(
            isEdit ? 'Actualizado' : 'Fondo creado',
            isEdit
                ? `"${payload.name}" se guardó correctamente.`
                : `"${payload.name}" aparecerá como recordatorio cuando se acerque la fecha.`
        );
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar fondo',
            `¿Eliminar "${editFund.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await removeScheduledFund(editFund.id);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <IconChevronLeft color={theme.ink} size={16} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{isEdit ? 'Editar fondo' : 'Nuevo fondo'}</Text>
                </View>

                <View style={styles.form}>
                    {/* Name */}
                    <Text style={styles.fieldLabel}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. Quincena, Renta, Freelance..."
                        placeholderTextColor={theme.muted}
                    />

                    {/* Amount */}
                    <Text style={styles.fieldLabel}>Monto esperado</Text>
                    <DecimalInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.muted}
                    />

                    {/* Next date */}
                    <Text style={styles.fieldLabel}>Próxima fecha</Text>
                    <DatePickerField
                        value={nextDate}
                        onChange={setNextDate}
                        placeholder="Selecciona una fecha"
                        minimumDate={isEdit ? undefined : new Date()}
                    />

                    {/* Frequency */}
                    <Text style={styles.fieldLabel}>Frecuencia</Text>
                    <View style={styles.frequencyRow}>
                        {FREQUENCIES.map(f => (
                            <TouchableOpacity
                                key={f.key}
                                style={[
                                    styles.frequencyBtn,
                                    frequency === f.key && styles.frequencyBtnActive,
                                ]}
                                onPress={() => setFrequency(f.key)}
                            >
                                <Text style={[
                                    styles.frequencyBtnText,
                                    frequency === f.key && styles.frequencyBtnTextActive,
                                ]}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Account */}
                    <Text style={styles.fieldLabel}>Cuenta destino</Text>
                    <View style={styles.accountList}>
                        {accounts.map(acc => (
                            <TouchableOpacity
                                key={acc.id}
                                style={[
                                    styles.accountOption,
                                    accountId === acc.id && styles.accountOptionSelected,
                                ]}
                                onPress={() => setAccountId(acc.id)}
                            >
                                <Text style={[
                                    styles.accountOptionText,
                                    accountId === acc.id && { color: theme.bg },
                                ]}>
                                    {acc.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.confirmBtnText}>
                            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear fondo'}
                        </Text>
                    </TouchableOpacity>

                    {isEdit && (
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                            <Text style={styles.deleteBtnText}>Eliminar fondo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: Spacing.xl + insets.bottom }} />
            </ScrollView>
        </View>
    );
}