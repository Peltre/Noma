// Hojas y piezas de APARTADO, compartidas por Ahorros y Tarjetas.
// Un apartado es una parte con nombre del saldo de una tarjeta (cajita
// Nu, apartado BBVA). Aquí viven: crear, apartar/quitar, interés y la
// hoja de detalle. Ver el modelo en useSavings.js.
import { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useFinance } from '../../store/FinanceContext';
import { useTheme } from '../../store/useTheme';
import { AccentProvider } from '../../store/useAccent';
import { SAVINGS_COLORS, LINKABLE_TYPES } from '../../store/savingsStore';
import { formatCurrencyShort } from '../../utils';

import { FontSize, Spacing } from '../../constants';
import createSavingsStyles from '../../screens/SavingsScreen.styles';
import DecimalInput from '../DecimalInput';
import { IconCheck, IconWarningTriangle, IconChevronRight } from '../Icons';
import { Sheet, Pill, Button, Field, FieldLabel, Money, GlassCard, fieldSurface } from '../ui';

// Only débito/efectivo can back an apartado — same rule useSavings.js
// enforces server-side, mirrored here so the picker never even shows
// an option that would get rejected.

// Color picker (bye bye emoji picker)
export function ColorPicker({ selected, onSelect }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    return (
        <View style={styles.colorRow}>
            {SAVINGS_COLORS.map((c) => (
                <TouchableOpacity
                    key={c}
                    style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        selected === c && { borderColor: theme.ink },
                    ]}
                    onPress={() => onSelect(c)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selected === c }}
                />
            ))}
        </View>
    );
}

// Colored circle dot used in cards and chips
function AccountDot({ color, size = 40 }) {
    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
            }}
        />
    );
}

// Pick which real débito/efectivo account an apartado is linked to.
// Shows how much of each is currently free, so the choice already
// carries the info that decides how much can be earmarked.
function AccountPicker({ accounts, selectedId, onSelect, getFreeRoom }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const linkable = accounts.filter((a) => LINKABLE_TYPES.includes(a.type));

    if (linkable.length === 0) {
        return <Text style={styles.hint}>Primero agrega una cuenta de débito en Tarjetas</Text>;
    }
    return (
        <View style={styles.pillRow}>
            {linkable.map((a) => (
                <Pill
                    key={a.id}
                    label={`${a.name} · ${formatCurrencyShort(getFreeRoom(a.id))} libres`}
                    selected={selectedId === a.id}
                    onPress={() => onSelect(a.id)}
                />
            ))}
        </View>
    );
}

// Casilla — misma anatomía que el toggle de TransactionScreen.
export function Toggle({ on, label, onPress, accent, accentOn }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const tone = accent || theme.brand;
    return (
        <TouchableOpacity
            style={styles.toggle}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
        >
            <View style={[styles.checkbox, on && { backgroundColor: tone, borderColor: tone }]}>
                {on && <IconCheck color={accentOn || theme.brandOn} size={12} />}
            </View>
            <Text style={styles.toggleText}>{label}</Text>
        </TouchableOpacity>
    );
}

// Empty/default shape for the interest form, shared by AddApartadoSheet
// and EditInterestSheet below. Kept as strings until submit, like
// every other money field in this app.
const EMPTY_INTEREST = { enabled: false, rate: '', cap: '', rateAboveCap: '' };

// Rate/cap fields for "this apartado grows on its own" — shared
// between creation and editing so both stay in sync.
function InterestFields({ value, onChange }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const hasCap = parseFloat(value.cap) > 0;

    return (
        <>
            <Toggle
                on={value.enabled}
                label="Generar interés (opcional)"
                onPress={() => onChange({ ...value, enabled: !value.enabled })}
            />

            {value.enabled && (
                <View style={styles.interestBox}>
                    <Text style={styles.hint}>
                        Este apartado crecerá solo, como una cuenta de ahorro real: el interés se deposita de
                        verdad en tu cuenta ligada y se suma aquí.
                    </Text>

                    <FieldLabel required>Tasa anual</FieldLabel>
                    <View style={styles.percentRow}>
                        <DecimalInput
                            style={[styles.decimalInput, fieldSurface(theme), styles.percentInput]}
                            value={value.rate}
                            onChangeText={(rate) => onChange({ ...value, rate })}
                            placeholder="13.00"
                            placeholderTextColor={theme.inkDim}
                        />
                        <Text style={styles.percentSign}>% anual</Text>
                    </View>

                    <FieldLabel optional>Tope</FieldLabel>
                    <DecimalInput
                        style={[styles.decimalInput, fieldSurface(theme)]}
                        value={value.cap}
                        onChangeText={(cap) => onChange({ ...value, cap })}
                        placeholder="Sin tope — aplica a todo"
                        placeholderTextColor={theme.inkDim}
                    />
                    <Text style={styles.hint}>
                        Ej. como en Nu: 13% anual hasta $25,000 pesos — arriba de eso, baja la tasa.
                        Déjalo vacío para que la tasa aplique a cualquier cantidad.
                    </Text>

                    {hasCap && (
                        <>
                            <FieldLabel>Tasa arriba del tope</FieldLabel>
                            <View style={styles.percentRow}>
                                <DecimalInput
                                    style={[styles.decimalInput, fieldSurface(theme), styles.percentInput]}
                                    value={value.rateAboveCap}
                                    onChangeText={(rateAboveCap) => onChange({ ...value, rateAboveCap })}
                                    placeholder="0.00"
                                    placeholderTextColor={theme.inkDim}
                                />
                                <Text style={styles.percentSign}>% anual</Text>
                            </View>
                            <Text style={styles.hint}>
                                Lo que exceda el tope gana esta tasa reducida en vez de la normal. Déjalo
                                vacío si arriba del tope no quieres que gane nada.
                            </Text>
                        </>
                    )}
                </View>
            )}
        </>
    );
}

// New apartado sheet
export function AddApartadoSheet({ onClose, accounts, getFreeRoom, initialAccountId = null, onCreated }) {
    const { addSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [color, setColor] = useState(SAVINGS_COLORS[0]);
    const [linkedAccountId, setLinkedAccountId] = useState(initialAccountId);
    const [initialAmount, setInitialAmount] = useState('');
    const [interest, setInterest] = useState(EMPTY_INTEREST);
    const [loading, setLoading] = useState(false);

    const free = linkedAccountId ? getFreeRoom(linkedAccountId) : 0;
    const requested = parseFloat(initialAmount) || 0;
    const exceedsAvailable = linkedAccountId && requested > free;
    const interestRateMissing = interest.enabled && !(parseFloat(interest.rate) > 0);
    const canSave = name.trim() && linkedAccountId && !interestRateMissing && !loading;

    const handleAdd = async () => {
        if (!canSave) return;
        setLoading(true);
        const result = await addSavingsAccount({
            name: name.trim(),
            color,
            linkedAccountId,
            initialAmount: requested,
            interest: interest.enabled
                ? {
                    enabled: true,
                    rate: parseFloat(interest.rate) || 0,
                    cap: parseFloat(interest.cap) || 0,
                    rateAboveCap: parseFloat(interest.rateAboveCap) || 0,
                }
                : null,
        });
        setLoading(false);
        if (result?.error) {
            Alert.alert('No se pudo crear', result.error);
            return;
        }
        onClose();
        // Para el atajo desde "Nuevo objetivo": regresa con el apartado listo.
        onCreated?.(result.newAcc);
    };

    return (
        <Sheet onClose={onClose} dismissable={!loading} title="Nuevo apartado" scroll>
            {/* Live preview */}
            <View style={styles.preview}>
                <AccountDot color={color} size={44} />
                <Text style={styles.previewName} numberOfLines={1}>
                    {name || 'Nombre del apartado'}
                </Text>
            </View>

            <FieldLabel>Color</FieldLabel>
            <ColorPicker selected={color} onSelect={setColor} />

            <Field
                label="Nombre"
                required
                value={name}
                onChangeText={setName}
                placeholder="Ej. Cajita Nu, Apartado BBVA..."
            />

            <FieldLabel required>¿De qué cuenta sale?</FieldLabel>
            <AccountPicker
                accounts={accounts}
                selectedId={linkedAccountId}
                onSelect={setLinkedAccountId}
                getFreeRoom={getFreeRoom}
            />
            <Text style={styles.hint}>
                No mueve el dinero — tu tarjeta sigue mostrando su saldo real completo. Solo reserva parte de
                él.
            </Text>

            {linkedAccountId && (
                <>
                    <FieldLabel optional>Apartar ahora</FieldLabel>
                    <DecimalInput
                        style={[
                            styles.decimalInput,
                            fieldSurface(theme, { error: !!exceedsAvailable }),
                        ]}
                        value={initialAmount}
                        onChangeText={setInitialAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.inkDim}
                    />
                    <Text style={[styles.hint, exceedsAvailable && styles.hintError]}>
                        {exceedsAvailable
                            ? `Solo tienes ${formatCurrencyShort(free)} libres en esa cuenta`
                            : `Disponible ahí: ${formatCurrencyShort(free)}`}
                    </Text>
                </>
            )}

            <InterestFields value={interest} onChange={setInterest} />

            <View style={styles.sheetBtns}>
                <Button label="Cancelar" variant="secondary" onPress={onClose} />
                <Button
                    label="Crear apartado"
                    loading={loading}
                    loadingLabel="Creando…"
                    disabled={!canSave}
                    onPress={handleAdd}
                    style={{ flex: 2 }}
                />
            </View>
        </Sheet>
    );
}

// Edit an existing apartado's interest settings — same fields as
// creation, reachable any time afterward (the % button on each
// apartado row), since interest here is meant to be something the
// person can turn on, tune, or turn back off whenever they want.
export function EditInterestSheet({ onClose, savingsAccount }) {
    const { updateSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [color, setColor] = useState(SAVINGS_COLORS[0]);
    const [interest, setInterest] = useState(EMPTY_INTEREST);
    const [loading, setLoading] = useState(false);

    // Re-sync cada vez que se abre para un apartado (el mismo u otro).
    useEffect(() => {
        if (!savingsAccount) return;
        setName(savingsAccount.name);
        setColor(savingsAccount.color || SAVINGS_COLORS[0]);
        const i = savingsAccount.interest;
        setInterest({
            enabled: !!i?.enabled,
            rate: i?.rate ? String(i.rate) : '',
            cap: i?.cap ? String(i.cap) : '',
            rateAboveCap: i?.rateAboveCap ? String(i.rateAboveCap) : '',
        });
    }, [savingsAccount?.id]);

    if (!savingsAccount) return null;

    const interestRateMissing = interest.enabled && !(parseFloat(interest.rate) > 0);
    const canSave = name.trim() && !interestRateMissing && !loading;

    const handleSave = async () => {
        if (!canSave) return;
        setLoading(true);
        const result = await updateSavingsAccount(savingsAccount.id, {
            name: name.trim(),
            color,
            enabled: interest.enabled,
            rate: parseFloat(interest.rate) || 0,
            cap: parseFloat(interest.cap) || 0,
            rateAboveCap: parseFloat(interest.rateAboveCap) || 0,
        });
        setLoading(false);
        if (result?.error) {
            Alert.alert('No se pudo guardar', result.error);
            return;
        }
        onClose();
    };

    return (
        // El acento sigue al color que se está eligiendo.
        <AccentProvider color={color} on={theme.brandOn}>
            <Sheet onClose={onClose} dismissable={!loading} title="Editar apartado" scroll>
                <View style={styles.preview}>
                    <AccountDot color={color} size={44} />
                    <Text style={styles.previewName} numberOfLines={1}>
                        {name.trim() || savingsAccount.name}
                    </Text>
                </View>

                <FieldLabel>Color</FieldLabel>
                <ColorPicker selected={color} onSelect={setColor} />

                <Field label="Nombre" required value={name} onChangeText={setName} placeholder="Ej. Cajita Nu, Apartado BBVA..." />

                <InterestFields value={interest} onChange={setInterest} />

                <View style={styles.sheetBtns}>
                    <Button label="Cancelar" variant="secondary" onPress={onClose} />
                    <Button
                        label="Guardar"
                        loading={loading}
                        loadingLabel="Guardando…"
                        disabled={!canSave}
                        onPress={handleSave}
                        style={{ flex: 2 }}
                    />
                </View>
            </Sheet>
        </AccentProvider>
    );
}

// Add/remove money from an apartado. Never touches the linked
// account's real balance — only how much of it is claimed.
export function MoveMoneySheet({ onClose, savingsAccount, getFreeRoom, mode, getApartadoFree }) {
    const { addToSavingsAccount, removeFromSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [amount, setAmount] = useState('');
    const isDeposit = mode === 'deposit';
    const free = savingsAccount ? getFreeRoom(savingsAccount.linkedAccountId) : 0;
    // Quitar sólo hasta lo que ningún objetivo del apartado reclame.
    const ceiling = isDeposit ? free : (getApartadoFree ? getApartadoFree(savingsAccount.id) : (savingsAccount?.earmarkedAmount ?? 0));
    const amt = parseFloat(amount) || 0;
    const overCeiling = amt > ceiling;

    const handleConfirm = async () => {
        if (!amt || amt <= 0) return;
        const result = isDeposit
            ? await addToSavingsAccount({ savingsAccountId: savingsAccount.id, amount: amt })
            : await removeFromSavingsAccount({ savingsAccountId: savingsAccount.id, amount: amt });
        if (result?.error) {
            Alert.alert('No se puede', result.error);
            return;
        }
        setAmount('');
        onClose();
    };

    return (
        // El acento de la hoja es el color de ESTE apartado.
        <AccentProvider color={savingsAccount.color} on={theme.brandOn}>
            <Sheet onClose={onClose}>
                <View style={styles.sheetTitleRow}>
                    <AccountDot color={savingsAccount?.color} size={28} />
                    <Text style={styles.sheetTitle}>
                        {isDeposit ? 'Apartar más en' : 'Quitar de'} {savingsAccount?.name}
                    </Text>
                </View>

                <FieldLabel required>Cantidad</FieldLabel>
                <DecimalInput
                    style={[styles.decimalInputLarge, fieldSurface(theme, { error: overCeiling })]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="$0.00"
                    placeholderTextColor={theme.inkDim}
                    autoFocus
                />
                <Text style={[styles.hint, overCeiling && styles.hintError]}>
                    {isDeposit
                        ? `Libre en esa cuenta: ${formatCurrencyShort(free)}`
                        : `Apartado actualmente: ${formatCurrencyShort(ceiling)}`}
                </Text>

                <View style={styles.sheetBtns}>
                    <Button
                        label="Cancelar"
                        variant="secondary"
                        onPress={() => {
                            setAmount('');
                            onClose();
                        }}
                    />
                    <Button
                        label={isDeposit ? 'Apartar' : 'Quitar'}
                        disabled={!amt || amt <= 0 || overCeiling}
                        onPress={handleConfirm}
                        style={{ flex: 2 }}
                    />
                </View>
            </Sheet>
        </AccentProvider>
    );
}

// Hoja de un apartado. Antes abría sólo un menú de cuatro botones;
// ahora explica el apartado antes de ofrecer acciones: libre vs con
// destino, a qué objetivos va (tocables), en qué cuenta vive y cuánto
// queda sin apartar ahí. Toda la hoja usa el color del apartado.
export function ApartadoSheet({ onClose, savingsAccount, backing, destinos = [], linkedAccount, linkedFree = 0, atRisk = 0, onDeposit, onWithdraw, onInterest, onDelete, onOpenGoal }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    if (!savingsAccount) return null;
    const rate = savingsAccount.interest?.enabled ? savingsAccount.interest.rate : null;

    return (
        <AccentProvider color={savingsAccount.color} on={theme.brandOn}>
            <Sheet onClose={onClose} scroll>
                <View style={styles.apSheetHead}>
                    <AccountDot color={savingsAccount.color} size={44} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.goalSheetName} numberOfLines={1}>{savingsAccount.name}</Text>
                        <Text style={styles.goalDeadline} numberOfLines={1}>
                            {linkedAccount ? `Vive en ${linkedAccount.name}` : 'Cuenta eliminada'}
                            {rate != null ? ` · genera ${rate}% anual` : ''}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Money value={backing.total} size={FontSize.xl} color={theme.ink} decimals={false} />
                        {savingsAccount.totalInterestEarned > 0 && (
                            <Text style={styles.earnedText}>+{formatCurrencyShort(savingsAccount.totalInterestEarned)} ganados</Text>
                        )}
                    </View>
                </View>

                {backing.total > 0 && (
                    <>
                        <View style={[styles.splitBar, { marginTop: Spacing.md }]}>
                            <View style={[styles.splitFree, { flex: Math.max(backing.free, 0.0001), backgroundColor: savingsAccount.color }]} />
                            {backing.committed > 0 && (
                                <View style={[styles.splitCommitted, { flex: backing.committed, backgroundColor: savingsAccount.color }]} />
                            )}
                        </View>
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: savingsAccount.color }]} />
                                <Text style={styles.legendLabel}>Libre</Text>
                                <Money value={backing.free} size={FontSize.sm} decimals={false} compact />
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: savingsAccount.color, opacity: 0.42 }]} />
                                <Text style={styles.legendLabel}>Con destino</Text>
                                <Money value={backing.committed} size={FontSize.sm} decimals={false} compact />
                            </View>
                        </View>
                    </>
                )}

                {atRisk > 0 && (
                    <View style={styles.riskRow}>
                        <IconWarningTriangle color={theme.moneyOut} size={13} />
                        <Text style={styles.riskText}>
                            {formatCurrencyShort(atRisk)} en riesgo — la cuenta ligada tiene menos saldo del que este apartado promete
                        </Text>
                    </View>
                )}

                {destinos.length > 0 && (
                    <>
                        <FieldLabel>A dónde va</FieldLabel>
                        <GlassCard style={styles.sheetGroup}>
                            {destinos.map((d, i) => (
                                <TouchableOpacity
                                    key={d.goal.id}
                                    style={[styles.sheetRow, i > 0 && styles.sheetRowBorder]}
                                    onPress={() => onOpenGoal(d.goal)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Ver objetivo ${d.goal.name}`}
                                >
                                    <Text style={styles.sheetRowText} numberOfLines={1}>{d.goal.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Money value={d.amount} size={FontSize.sm} color={theme.ink} decimals={false} />
                                        <IconChevronRight color={theme.inkDim} size={13} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </GlassCard>
                    </>
                )}

                {linkedAccount && (
                    <>
                        <FieldLabel>Cuenta respaldo</FieldLabel>
                        <GlassCard style={styles.sheetGroup}>
                            <View style={styles.sheetRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                                    <View style={[styles.legendDot, { backgroundColor: linkedAccount.color || theme.cashTone }]} />
                                    <Text style={styles.sheetRowText}>{linkedAccount.name}</Text>
                                </View>
                                <Text style={styles.sheetRowLabel}>
                                    <Text style={styles.sheetRowValue}>{formatCurrencyShort(linkedAccount.balance)}</Text>
                                    {'  · '}{formatCurrencyShort(linkedFree)} sin apartar
                                </Text>
                            </View>
                        </GlassCard>
                    </>
                )}

                <View style={styles.sheetBtns}>
                    <Button label="Apartar" onPress={onDeposit} style={{ flex: 1 }} />
                    <Button label="Quitar" variant="secondary" onPress={onWithdraw} style={{ flex: 1 }} />
                    <Button label="Editar" variant="secondary" onPress={onInterest} style={{ flex: 1 }} />
                </View>
                <View style={styles.sheetBtnsTight}>
                    <Button label="Eliminar apartado" variant="danger" onPress={onDelete} />
                </View>
            </Sheet>
        </AccentProvider>
    );
}