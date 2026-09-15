// Screen to view, edit, and delete scheduled funds — both recurring
// income reminders (quincena, renta) AND MSI installments. Purely a
// list now: creating/editing an income fund happens on its own screen
// (AddScheduledFundScreen), same split CardsScreen has with
// AddCardScreen — this avoids landing every new fund on the same
// screen you're already looking at.
//
// Neither fund type moves money automatically; the person confirms
// each payment from Home, which is what actually advances the date.
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFinance } from '../store/FinanceContext';
import { useTheme, useStyles } from '../store/useTheme';
import { FREQUENCY_LABELS, FontSize } from '../constants';

import DatePickerField from '../components/DatePickerField';
import { IconCalendar, IconCalendarClock, IconPencil, IconPlus, IconTrash } from '../components/Icons';
import {
    ScreenHeader,
    SectionHeader,
    EmptyState,
    Sheet,
    Pill,
    Button,
    Field,
    FieldLabel,
    Money,
    GlassCard, useToast,
} from '../components/ui';
import createScheduledFundsStyles from './ScheduledFundsScreen.styles';

const FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'income', label: 'Ingresos' },
    { key: 'msi', label: 'Mensualidades' },
];

export default function ScheduledFundsScreen() {
    const navigation = useNavigation();
    const { accounts, creditCards, scheduledFunds, updateScheduledFund, removeScheduledFund, getFundStatus } =
        useFinance();
    const { theme } = useTheme();
    const toast = useToast();
    const styles = useStyles(createScheduledFundsStyles);

    // Both fund types live in the same array (see useScheduleFunds.js),
    // split here purely for how differently they need to be shown —
    // an MSI has no `frequency`/`amount`, it has `months`/
    // `monthlyAmount`/`paidMonths` instead.
    const incomeFunds = scheduledFunds.filter((f) => f.type !== 'msi');
    const msiFunds = scheduledFunds.filter((f) => f.type === 'msi');

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

    // ── MSI edit sheet — name + date only. See updateScheduledFund's
    // comment in useScheduleFunds.js for why the rest is locked, and
    // why this stays a small sheet here instead of its own screen
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
            toast.error('Falta el nombre', 'Ponle un nombre a la mensualidad.');
            return;
        }
        if (!msiDate) {
            toast.error('Falta la fecha', 'Selecciona la próxima fecha.');
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

    // Una sola receta de tarjeta para los dos tipos: lo único que
    // cambia es el acento, el monto y qué dicen la insignia y el pie.
    const renderFund = ({ fund, accent, sign, amount, badge, meta, onEdit, onDelete }) => {
        const status = getFundStatus(fund);
        const isPending = status !== 'ok';
        return (
            <GlassCard
                key={fund.id}
                style={[styles.fundCard, isPending && styles.fundCardPending]}
            >
                <View style={styles.fundTop}>
                    <View style={[styles.fundIconBox, { backgroundColor: accent + '29' }]}>
                        <IconCalendarClock color={accent} size={15} />
                    </View>
                    <Text style={styles.fundName} numberOfLines={1}>
                        {fund.name}
                    </Text>
                    <Money
                        value={amount}
                        size={FontSize.md}
                        sign={sign}
                        color={accent}
                        decimals={false}
                        compact
                    />
                </View>

                <View style={styles.fundMeta}>
                    <View style={styles.fundBadge}>
                        <Text style={styles.fundBadgeText}>{badge}</Text>
                    </View>
                    <Text style={[styles.fundMetaText, status === 'overdue' && styles.fundMetaTextOverdue]}>
                        {getDateLabel(status, fund.nextDate)}
                    </Text>
                    {!!meta && <Text style={styles.fundMetaText}>{meta}</Text>}
                </View>

                <View style={styles.fundActions}>
                    <TouchableOpacity style={styles.linkBtn} onPress={onEdit} accessibilityRole="button">
                        <IconPencil color={theme.inkMid} size={12} />
                        <Text style={styles.linkBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkBtn} onPress={onDelete} accessibilityRole="button">
                        <IconTrash color={theme.moneyOut} size={12} />
                        <Text style={[styles.linkBtnText, { color: theme.moneyOut }]}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </GlassCard>
        );
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Fondos programados"
                    onBack={() => navigation.goBack()}
                    actionIcon={IconPlus}
                    onAction={() => navigation.navigate('AddScheduledFund')}
                />

                {/* Filter — only worth showing once there's a mix to
                    actually filter between */}
                {scheduledFunds.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRow}
                    >
                        {FILTERS.map((f) => (
                            <Pill
                                key={f.key}
                                label={f.label}
                                selected={activeFilter === f.key}
                                accent={
                                    f.key === 'msi'
                                        ? theme.msi
                                        : f.key === 'income'
                                            ? theme.moneyIn
                                            : undefined
                                }
                                onPress={() => setActiveFilter(f.key)}
                            />
                        ))}
                    </ScrollView>
                )}

                {/* Nothing at all yet, of either type */}
                {scheduledFunds.length === 0 && (
                    <View style={styles.emptyWrap}>
                        <EmptyState
                            icon={IconCalendar}
                            title="Sin fondos programados"
                            description="Crea uno y aparecerá como recordatorio en tu Dashboard cuando se acerque la fecha."
                            actionLabel="Nuevo fondo"
                            onAction={() => navigation.navigate('AddScheduledFund')}
                        />
                    </View>
                )}

                {/* There's data, but this specific filter has nothing
                    to show for it (e.g. "Mensualidades" with zero MSI
                    active right now) — different message than the
                    true-empty one above, and no action here when it's
                    the MSI filter, since those can't be created from
                    this screen at all. */}
                {scheduledFunds.length > 0 && nothingVisible && (
                    <View style={styles.emptyWrap}>
                        {activeFilter === 'msi' ? (
                            <EmptyState
                                icon={IconCalendar}
                                accent={theme.msi}
                                title="Sin mensualidades activas"
                                description="Una mensualidad aparece aquí sola cuando pagas algo con MSI desde Nuevo movimiento."
                            />
                        ) : (
                            <EmptyState
                                icon={IconCalendar}
                                title="Sin fondos de ingreso"
                                description="Los recordatorios de quincena, renta o freelance viven aquí."
                                actionLabel="Nuevo fondo"
                                onAction={() => navigation.navigate('AddScheduledFund')}
                            />
                        )}
                    </View>
                )}

                {/* Income funds */}
                {visibleIncome.length > 0 && (
                    <View style={styles.list}>
                        <SectionHeader title="Ingresos programados" />
                        {visibleIncome.map((fund) =>
                            renderFund({
                                fund,
                                accent: theme.moneyIn,
                                sign: '+',
                                amount: fund.amount,
                                badge: FREQUENCY_LABELS[fund.frequency],
                                meta: accounts.find((a) => a.id === fund.accountId)?.name
                                    ? `→ ${accounts.find((a) => a.id === fund.accountId).name}`
                                    : null,
                                onEdit: () => navigation.navigate('AddScheduledFund', { editFund: fund }),
                                onDelete: () => handleDelete(fund),
                            }),
                        )}
                    </View>
                )}

                {/* MSI installments — a purchase already made, being
                    paid off in pieces. No "add" flow lives here (that
                    only happens from Nuevo Movimiento) — the "Sin
                    mensualidades activas" empty state above reflects
                    that by never offering an action for this one. */}
                {visibleMSI.length > 0 && (
                    <View style={styles.list}>
                        <SectionHeader title="Mensualidades (MSI)" />
                        {visibleMSI.map((fund) =>
                            renderFund({
                                fund,
                                accent: theme.msi,
                                sign: '-',
                                amount: fund.monthlyAmount,
                                badge: `Pago ${fund.paidMonths + 1} de ${fund.months}`,
                                meta: creditCards.find((c) => c.id === fund.creditCardId)?.name ?? null,
                                onEdit: () => openEditMSI(fund),
                                onDelete: () => handleDeleteMSI(fund),
                            }),
                        )}
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* MSI edit sheet — name + date only, on purpose (see
                updateScheduledFund's comment in useScheduleFunds.js) */}
            {!!editingMSI && (
                <Sheet
                    onClose={() => setEditingMSI(null)}
                    title="Editar mensualidad"
                    subtitle={`Pago ${editingMSI.paidMonths + 1} de ${editingMSI.months} · el monto y la tarjeta no se pueden cambiar`}
                >
                    <Field
                        label="Nombre"
                        required
                        value={msiName}
                        onChangeText={setMsiName}
                        placeholder="Ej. Laptop, Refrigerador..."
                    />

                    <FieldLabel required>Próxima fecha de pago</FieldLabel>
                    <DatePickerField
                        value={msiDate}
                        onChange={setMsiDate}
                        placeholder="Selecciona una fecha"
                    />

                    <View style={styles.sheetBtns}>
                        <Button label="Cancelar" variant="secondary" onPress={() => setEditingMSI(null)} />
                        <Button
                            label="Guardar"
                            accent={theme.msi}
                            accentOn={theme.msiOn}
                            onPress={handleSaveMSI}
                            style={{ flex: 2 }}
                        />
                    </View>
                </Sheet>
            )}
        </View>
    );
}