// Screen to view, edit, and delete scheduled funds — both recurring
// income reminders (quincena, renta) AND MSI installments. Purely a
// list now: creating/editing an income fund happens on its own screen
// (AddScheduledFundScreen), same split CardsScreen has with
// AddCardScreen — this avoids landing every new fund on the same
// screen you're already looking at.
//
// Neither fund type moves money automatically; the person confirms
// each payment from Home, which is what actually advances the date.
import { useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";
import { formatCurrencyShort } from "../utils";
import { FREQUENCY_LABELS } from '../constants';
import DatePickerField from '../components/DatePickerField';
import { IconCalendar, IconCalendarClock, IconChevronLeft, IconPencil, IconPlus } from '../components/Icons';
import GlassCard from '../components/GlassCard';
import createScheduledFundsStyles from './ScheduledFundsScreen.styles';

const FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'income', label: 'Ingresos' },
    { key: 'msi', label: 'Mensualidades' },
];

export default function ScheduledFundsScreen() {
    const navigation = useNavigation();
    const {
        accounts,
        creditCards,
        scheduledFunds,
        updateScheduledFund,
        removeScheduledFund,
        getFundStatus,
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createScheduledFundsStyles(theme), [theme]);

    // Both fund types live in the same array (see useScheduleFunds.js),
    // split here purely for how differently they need to be shown —
    // an MSI has no `frequency`/`amount`, it has `months`/
    // `monthlyAmount`/`paidMonths` instead.
    const incomeFunds = scheduledFunds.filter(f => f.type !== 'msi');
    const msiFunds = scheduledFunds.filter(f => f.type === 'msi');

    const [activeFilter, setActiveFilter] = useState('all');
    const showIncome = activeFilter !== 'msi';
    const showMSI = activeFilter !== 'income';
    const visibleIncome = showIncome ? incomeFunds : [];
    const visibleMSI = showMSI ? msiFunds : [];
    const nothingVisible = visibleIncome.length === 0 && visibleMSI.length === 0;

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

    // ── MSI edit modal — name + date only. See updateScheduledFund's
    // comment in useScheduleFunds.js for why the rest is locked, and
    // why this stays a small modal here instead of its own screen
    // the way income funds get. ──
    const [editingMSI, setEditingMSI] = useState(null);
    const [msiName, setMsiName] = useState('');
    const [msiDate, setMsiDate] = useState(null);

    const openEditMSI = (fund) => {
        setMsiName(fund.name);
        setMsiDate(parseISO(fund.nextDate));
        setEditingMSI(fund);
    };

    const handleSaveMSI = async () => {
        if (!msiName.trim()) {
            Alert.alert('Falta el nombre', 'Ingresa un nombre.');
            return;
        }
        if (!msiDate) {
            Alert.alert('Falta la fecha', 'Selecciona la próxima fecha.');
            return;
        }
        await updateScheduledFund(editingMSI.id, {
            name: msiName.trim(),
            nextDate: msiDate.toISOString(),
        });
        setEditingMSI(null);
    };

    const handleDeleteMSI = (fund) => {
        Alert.alert(
            'Eliminar mensualidad',
            `Se dejará de mostrar "${fund.name}" como recordatorio. Esto no modifica la deuda que ya está registrada en tu tarjeta — si aún debes esos pagos, la tarjeta lo va a seguir reflejando; solo perderías el conteo de "pago ${fund.paidMonths} de ${fund.months}".`,
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

    // Same "Venció/Próximo" wording PendingFundCard uses on Home —
    // urgency comes through in the words and (below) the card's
    // border, not a colored background. A fund that isn't due soon
    // just gets a plain date, no urgency framing.
    const getDateLabel = (status, nextDate) => {
        const formatted = format(parseISO(nextDate), 'd MMM yyyy', { locale: es });
        if (status === 'overdue') return `Venció · ${formatted}`;
        if (status === 'upcoming') return `Próximo · ${formatted}`;
        return `Próximo: ${formatted}`;
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
                            <IconChevronLeft color={theme.ink} size={16} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Fondos programados</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => navigation.navigate('AddScheduledFund')}
                    >
                        <IconPlus color={theme.brandOn} size={18} />
                    </TouchableOpacity>
                </View>

                {/* Filter — only worth showing once there's a mix to
                    actually filter between */}
                {scheduledFunds.length > 0 && (
                    <View style={styles.filterWrap}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.filterRow}>
                                {FILTERS.map(f => (
                                    <TouchableOpacity
                                        key={f.key}
                                        style={[styles.chip, activeFilter === f.key && styles.chipActive]}
                                        onPress={() => setActiveFilter(f.key)}
                                    >
                                        <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
                                            {f.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Nothing at all yet, of either type */}
                {scheduledFunds.length === 0 && (
                    <View style={styles.emptyState}>
                        <IconCalendar color={theme.muted} size={40} />
                        <Text style={styles.emptyText}>Sin fondos programados</Text>
                        <Text style={styles.emptySubtext}>
                            Crea uno y aparecerá como recordatorio en tu Dashboard cuando se acerque la fecha
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyBtn}
                            onPress={() => navigation.navigate('AddScheduledFund')}
                        >
                            <IconPlus color={theme.brandOn} size={14} />
                            <Text style={styles.emptyBtnText}>Nuevo fondo</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* There's data, but this specific filter has nothing
                    to show for it (e.g. "Mensualidades" with zero MSI
                    active right now) — different message than the
                    true-empty one above, and no "+" here when it's
                    the MSI filter, since those can't be created from
                    this screen at all. */}
                {scheduledFunds.length > 0 && nothingVisible && (
                    <View style={styles.emptyState}>
                        <IconCalendar color={theme.muted} size={40} />
                        <Text style={styles.emptyText}>
                            {activeFilter === 'msi' ? 'Sin mensualidades activas' : 'Sin fondos de ingreso'}
                        </Text>
                        {activeFilter === 'msi' ? (
                            <Text style={styles.emptySubtext}>
                                Una mensualidad aparece aquí sola cuando pagas algo con MSI desde Nuevo movimiento
                            </Text>
                        ) : (
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => navigation.navigate('AddScheduledFund')}
                            >
                                <IconPlus color={theme.brandOn} size={14} />
                                <Text style={styles.emptyBtnText}>Nuevo fondo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Income funds */}
                {visibleIncome.length > 0 && (
                    <View style={styles.listContainer}>
                        <Text style={styles.sectionLabel}>Fondos programados</Text>
                        {visibleIncome.map(fund => {
                            const status = getFundStatus(fund);
                            const account = accounts.find(a => a.id === fund.accountId);
                            const isPending = status !== 'ok';
                            return (
                                <GlassCard
                                    key={fund.id}
                                    style={[styles.fundCard, isPending && styles.fundCardPending]}
                                >
                                    <View style={styles.fundTop}>
                                        <View style={styles.fundIconBox}>
                                            <IconCalendarClock color={theme.muted} size={15} />
                                        </View>
                                        <Text style={styles.fundName} numberOfLines={1}>{fund.name}</Text>
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
                                        <Text style={[styles.fundMetaText, status === 'overdue' && styles.fundMetaTextOverdue]}>
                                            {getDateLabel(status, fund.nextDate)}
                                        </Text>
                                        {account && (
                                            <Text style={styles.fundMetaText}>
                                                → {account.name}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.fundActions}>
                                        <TouchableOpacity
                                            style={styles.editBtnRow}
                                            onPress={() => navigation.navigate('AddScheduledFund', { editFund: fund })}
                                        >
                                            <IconPencil color={theme.ink} size={12} />
                                            <Text style={styles.editBtnText}>Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(fund)}>
                                            <Text style={styles.deleteBtnText}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </GlassCard>
                            );
                        })}
                    </View>
                )}

                {/* MSI installments — a purchase already made, being
                    paid off in pieces. No "add" flow lives here (that
                    only happens from Nuevo Movimiento) — the "Sin
                    mensualidades activas" empty state above reflects
                    that by never offering a "+" for this one. */}
                {visibleMSI.length > 0 && (
                    <View style={styles.listContainer}>
                        <Text style={styles.sectionLabel}>Mensualidades (MSI)</Text>
                        {visibleMSI.map(fund => {
                            const status = getFundStatus(fund);
                            const card = creditCards.find(c => c.id === fund.creditCardId);
                            const isPending = status !== 'ok';
                            return (
                                <GlassCard
                                    key={fund.id}
                                    style={[styles.fundCard, isPending && styles.fundCardPending]}
                                >
                                    <View style={styles.fundTop}>
                                        <View style={styles.fundIconBox}>
                                            <IconCalendarClock color={theme.muted} size={15} />
                                        </View>
                                        <Text style={styles.fundName} numberOfLines={1}>{fund.name}</Text>
                                        <Text style={styles.fundAmount}>
                                            −{formatCurrencyShort(fund.monthlyAmount)}
                                        </Text>
                                    </View>
                                    <View style={styles.fundMeta}>
                                        <View style={styles.fundMetaBadge}>
                                            <Text style={styles.fundMetaBadgeText}>
                                                Pago {fund.paidMonths + 1} de {fund.months}
                                            </Text>
                                        </View>
                                        <Text style={[styles.fundMetaText, status === 'overdue' && styles.fundMetaTextOverdue]}>
                                            {getDateLabel(status, fund.nextDate)}
                                        </Text>
                                        {card && (
                                            <Text style={styles.fundMetaText}>
                                                {card.name}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.fundActions}>
                                        <TouchableOpacity
                                            style={styles.editBtnRow}
                                            onPress={() => openEditMSI(fund)}
                                        >
                                            <IconPencil color={theme.ink} size={12} />
                                            <Text style={styles.editBtnText}>Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteMSI(fund)}>
                                            <Text style={styles.deleteBtnText}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </GlassCard>
                            );
                        })}
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* MSI edit modal — name + date only, on purpose (see
                updateScheduledFund's comment in useScheduleFunds.js) */}
            <Modal
                visible={!!editingMSI}
                transparent
                animationType="fade"
                onRequestClose={() => setEditingMSI(null)}
            >
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditingMSI(null)}>
                    <TouchableOpacity style={styles.modalSheet} activeOpacity={1} onPress={() => { }}>
                        <Text style={styles.modalTitle}>Editar mensualidad</Text>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={msiName}
                                onChangeText={setMsiName}
                                placeholder="Ej. Laptop, Refrigerador..."
                                placeholderTextColor={theme.muted}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Próxima fecha de pago</Text>
                            <DatePickerField
                                value={msiDate}
                                onChange={setMsiDate}
                                placeholder="Selecciona una fecha"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setEditingMSI(null)}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveBtn}
                                onPress={handleSaveMSI}
                            >
                                <Text style={styles.modalSaveText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}