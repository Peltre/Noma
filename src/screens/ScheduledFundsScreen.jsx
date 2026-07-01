// Screen to view and create scheduled funds
// Funds are not automatic **yet at least, they show as prefilled reminders on homescreen
// User confirms payment amount
import { useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";
import { formatCurrencyShort } from "../utils";
import { ACCOUNT_LABELS, FREQUENCY_LABELS } from '../constants';
import createScheduledFundsStyles from './ScheduledFundsScreen.styles';

const FREQUENCIES = [
    { key: 'weekly', label: 'Semanal' },
    { key: 'biweekly', label: 'Quincenal' },
    { key: 'monthly', label: 'Mensual' },
];

export default function ScheduledFundsScreen() {
    const navigation = useNavigation();
    const {
        accounts,
        scheduledFunds,
        addScheduledFund,
        removeScheduledFund,
        getFundStatus
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createScheduledFundsStyles(theme), [theme]);

    // form state
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('biweekly');
    const [accountId, setAccountId] = useState(accounts[0]?.id || null);
    const [nextDate, setNextDate] = useState('');

    const handleAdd = async () => {
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Ej. Quincena, Renta, etc.');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero.');
            return;
        }
        if (!nextDate.trim()) {
            Alert.alert('Falta la fecha', 'Ingresa la próxima fecha en formato YYYY-MM-DD.');
            return;
        }
        if (!accountId) {
            Alert.alert('Falta la cuenta', 'Selecciona una cuenta destino.');
            return;
        }

        // Validate date format
        const dateObj = new Date(nextDate);
        if (isNaN(dateObj.getTime())) {
            Alert.alert('Fecha inválida', 'Usa el formato YYYY-MM-DD. Ej: 2025-07-15');
            return;
        }

        await addScheduledFund({
            name: name.trim(),
            amount: parseFloat(amount),
            frequency,
            accountId,
            nextDate: dateObj.toISOString(),
        });

        // Reset form
        setName('');
        setAmount('');
        setNextDate('');
        Alert.alert('✓ Fondo creado', `"${name.trim()}" aparecerá como recordatorio cuando se acerque la fecha.`);
    };

    const handleDelete = (fund) => {
        Alert.alert(
            'Eliminar fondo',
            `¿Eliminar "${fund.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => removeScheduledFund(fund.id),
                },
            ]
        );
    };

    // Status color for each fund card — overdue leans on moneyOut
    // (needs attention), upcoming leans on moneyIn (money coming
    // soon), same fixed accents as everywhere else in the app.
    const getStatusColor = (status) => {
        if (status === 'overdue') return theme.moneyOutSoft;
        if (status === 'upcoming') return theme.moneyInSoft;
        return theme.surface;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Fondos programados</Text>
                    </View>
                </View>

                {/* Active funds list */}
                {scheduledFunds.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📅</Text>
                        <Text style={styles.emptyText}>Sin fondos programados</Text>
                        <Text style={styles.emptySubtext}>
                            Crea uno abajo y aparecerá como recordatorio en tu Dashboard cuando se acerque la fecha
                        </Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {scheduledFunds.map(fund => {
                            const status = getFundStatus(fund);
                            const account = accounts.find(a => a.id === fund.accountId);
                            return (
                                <View
                                    key={fund.id}
                                    style={[
                                        styles.fundCard,
                                        { backgroundColor: getStatusColor(status) }
                                    ]}
                                >
                                    <View style={styles.fundTop}>
                                        <Text style={styles.fundName}>
                                            {status === 'overdue' ? '⚠️ ' : ''}
                                            {status === 'upcoming' ? '📅 ' : ''}
                                            {fund.name}
                                        </Text>
                                        <Text style={styles.fundAmount}>
                                            +{formatCurrencyShort(fund.amount)}
                                        </Text>
                                    </View>
                                    <View style={styles.fundMeta}>
                                        <View style={styles.fundMetaBadge}>
                                            <Text style={styles.fundMetaBadgeText}>
                                                {FREQUENCY_LABELS[fund.frequency]}
                                            </Text>
                                        </View>
                                        <Text style={styles.fundMetaText}>
                                            Próximo: {format(parseISO(fund.nextDate), 'd MMM yyyy', { locale: es })}
                                        </Text>
                                        {account && (
                                            <Text style={styles.fundMetaText}>
                                                → {ACCOUNT_LABELS[account.type]}
                                            </Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => handleDelete(fund)}
                                    >
                                        <Text style={styles.deleteBtnText}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.divider} />

                {/* Form to create new fund */}
                <View style={styles.formSection}>
                    <Text style={styles.formTitle}>Nuevo fondo</Text>

                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ej. Quincena, Renta, Freelance..."
                            placeholderTextColor={theme.muted}
                        />
                    </View>

                    {/* Amount */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Monto esperado</Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="$0.00"
                            placeholderTextColor={theme.muted}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    {/* Next date */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Próxima fecha</Text>
                        <TextInput
                            style={styles.input}
                            value={nextDate}
                            onChangeText={setNextDate}
                            placeholder="YYYY-MM-DD  (Ej. 2025-07-15)"
                            placeholderTextColor={theme.muted}
                        />
                    </View>

                    {/* Frequency */}
                    <View style={styles.fieldGroup}>
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
                    </View>

                    {/* Account */}
                    <View style={styles.fieldGroup}>
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
                                        {ACCOUNT_LABELS[acc.type]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Confirm */}
                    <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={handleAdd}
                    >
                        <Text style={styles.confirmBtnText}>Crear fondo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}