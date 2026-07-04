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
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";
import { formatCurrencyShort } from "../utils";
import { ACCOUNT_LABELS, FREQUENCY_LABELS } from '../constants';
import DecimalInput from '../components/DecimalInput';
import DatePickerField from '../components/DatePickerField';
import createScheduledFundsStyles from './ScheduledFundsScreen.styles';

const FREQUENCIES = [
    { key: 'weekly', label: 'Semanal' },
    { key: 'biweekly', label: 'Quincenal' },
    { key: 'monthly', label: 'Mensual' },
];

// Small line icons, same stroke language as the rest of the app —
// no emojis.
function IconCalendar({ color, size = 18 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth={1.6} />
            <Path d="M3 9h18" stroke={color} strokeWidth={1.6} />
            <Path d="M8 3v4M16 3v4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
    );
}
function IconWarning({ color, size = 18 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 4l9 15H3l9-15z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M12 10v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
            <Circle cx="12" cy="17" r="0.9" fill={color} />
        </Svg>
    );
}

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
    const [nextDate, setNextDate] = useState(null);

    const handleAdd = async () => {
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Ej. Quincena, Renta, etc.');
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

        await addScheduledFund({
            name: name.trim(),
            amount: parseFloat(amount),
            frequency,
            accountId,
            nextDate: nextDate.toISOString(),
        });

        // Reset form
        setName('');
        setAmount('');
        setNextDate(null);
        Alert.alert('Fondo creado', `"${name.trim()}" aparecerá como recordatorio cuando se acerque la fecha.`);
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
                        <IconCalendar color={theme.muted} size={40} />
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
                            const statusColor = status === 'overdue' ? theme.moneyOut
                                : status === 'upcoming' ? theme.moneyIn
                                    : null;
                            return (
                                <View
                                    key={fund.id}
                                    style={[
                                        styles.fundCard,
                                        { backgroundColor: getStatusColor(status) }
                                    ]}
                                >
                                    <View style={styles.fundTop}>
                                        <View style={styles.fundNameRow}>
                                            {status === 'overdue' && <IconWarning color={statusColor} size={15} />}
                                            {status === 'upcoming' && <IconCalendar color={statusColor} size={15} />}
                                            <Text style={styles.fundName}>{fund.name}</Text>
                                        </View>
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
                        <DecimalInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="$0.00"
                            placeholderTextColor={theme.muted}
                        />
                    </View>

                    {/* Next date */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Próxima fecha</Text>
                        <DatePickerField
                            value={nextDate}
                            onChange={setNextDate}
                            placeholder="Selecciona una fecha"
                            minimumDate={new Date()}
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