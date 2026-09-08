// Screen to create or edit a scheduled fund (a recurring income
// reminder — quincena, renta, freelance). Same create/edit-in-one-
// screen pattern as AddCardScreen: route.params?.editFund decides
// which mode this is, one form serves both.
//
// MSI installments don't come through here — they're created only
// from Nuevo Movimiento (paying with credit + MSI), and their own
// edit surface is a small sheet on ScheduledFundsScreen, not this
// screen, since almost none of their fields (amount, months, which
// card) are safe to change after the purchase already happened. See
// updateScheduledFund's comment in useScheduleFunds.js for why.
import { useMemo, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parseISO } from 'date-fns';
import { Spacing } from '../constants';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import DatePickerField from '../components/DatePickerField';
import { ScreenHeader, Field, FieldLabel, Pill, Button, fieldSurface } from '../components/ui';
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
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <ScreenHeader
                    title={isEdit ? 'Editar fondo' : 'Nuevo fondo'}
                    onBack={() => navigation.goBack()}
                />

                <View style={styles.form}>
                    <Field
                        label="Nombre"
                        required
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. Quincena, Renta, Freelance..."
                    />

                    <FieldLabel required>Monto esperado</FieldLabel>
                    <DecimalInput
                        style={[styles.decimalInput, fieldSurface(theme)]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.inkDim}
                    />

                    <FieldLabel required>Próxima fecha</FieldLabel>
                    <DatePickerField
                        value={nextDate}
                        onChange={setNextDate}
                        placeholder="Selecciona una fecha"
                        minimumDate={isEdit ? undefined : new Date()}
                    />

                    <FieldLabel>Frecuencia</FieldLabel>
                    <View style={styles.pillRow}>
                        {FREQUENCIES.map(f => (
                            <Pill
                                key={f.key}
                                label={f.label}
                                selected={frequency === f.key}
                                onPress={() => setFrequency(f.key)}
                            />
                        ))}
                    </View>

                    <FieldLabel required>Cuenta destino</FieldLabel>
                    <View style={styles.pillRow}>
                        {accounts.map(acc => (
                            <Pill
                                key={acc.id}
                                label={acc.name}
                                selected={accountId === acc.id}
                                onPress={() => setAccountId(acc.id)}
                            />
                        ))}
                    </View>

                    <View style={styles.actions}>
                        <Button
                            label={isEdit ? 'Guardar cambios' : 'Crear fondo'}
                            loading={loading}
                            loadingLabel="Guardando…"
                            onPress={handleSubmit}
                        />
                    </View>

                    {isEdit && (
                        <View style={styles.actionsSecondary}>
                            <Button label="Eliminar fondo" variant="danger" onPress={handleDelete} />
                        </View>
                    )}
                </View>

                <View style={{ height: Spacing.xl + insets.bottom }} />
            </ScrollView>
        </View>
    );
}