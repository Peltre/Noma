// Savings tab — apartados linked to real débito/efectivo accounts,
// and goals funded from one or several of them. See useSavings.js for
// the full model: nothing here ever moves real money except the
// "Marcar como comprado" redeem flow, which is the one place a goal
// actually spends for real.
import { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { format, parseISO, differenceInCalendarMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import { SAVINGS_COLORS } from '../store/useSavings';
import { formatCurrencyShort } from '../utils';
import { round2 } from '../utils/formatCurrency';
import { FontSize, Spacing } from '../constants';
import createSavingsStyles from './SavingsScreen.styles';
import DecimalInput from '../components/DecimalInput';
import DatePickerField from '../components/DatePickerField';
import {
    IconCheck,
    IconWarningTriangle,
    IconSavings,
    IconChevronRight,
} from '../components/Icons';
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
    GlassCard,
    fieldSurface,
} from '../components/ui';

// Only débito/efectivo can back an apartado — same rule useSavings.js
// enforces server-side, mirrored here so the picker never even shows
// an option that would get rejected.
const LINKABLE_TYPES = ['debit', 'cash'];

// Color picker (bye bye emoji picker)
function ColorPicker({ selected, onSelect }) {
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
                    accent={theme.savings}
                    onPress={() => onSelect(a.id)}
                />
            ))}
        </View>
    );
}

// Casilla — misma anatomía que el toggle de TransactionScreen.
function Toggle({ on, label, onPress, accent, accentOn }) {
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
                accent={theme.savings}
                accentOn={theme.savingsOn}
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
function AddApartadoSheet({ onClose, accounts, getFreeRoom }) {
    const { addSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [color, setColor] = useState(SAVINGS_COLORS[0]);
    const [linkedAccountId, setLinkedAccountId] = useState(null);
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
                    accent={theme.savings}
                    accentOn={theme.savingsOn}
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
function EditInterestSheet({ onClose, savingsAccount }) {
    const { updateSavingsAccountInterest } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [interest, setInterest] = useState(EMPTY_INTEREST);
    const [loading, setLoading] = useState(false);

    // Re-sync every time a different (or the same, freshly reopened)
    // apartado's sheet opens — mirrors the userName sync pattern in
    // SettingsScreen (a plain useEffect keyed off the prop that can
    // change out from under this component).
    useEffect(() => {
        if (!savingsAccount) return;
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

    const handleSave = async () => {
        if (interestRateMissing || loading) return;
        setLoading(true);
        const result = await updateSavingsAccountInterest(savingsAccount.id, {
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
        <Sheet onClose={onClose} dismissable={!loading} scroll>
            <View style={styles.sheetTitleRow}>
                <AccountDot color={savingsAccount.color} size={28} />
                <Text style={styles.sheetTitle}>Interés de {savingsAccount.name}</Text>
            </View>

            <InterestFields value={interest} onChange={setInterest} />

            <View style={styles.sheetBtns}>
                <Button label="Cancelar" variant="secondary" onPress={onClose} />
                <Button
                    label="Guardar"
                    accent={theme.savings}
                    accentOn={theme.savingsOn}
                    loading={loading}
                    loadingLabel="Guardando…"
                    disabled={interestRateMissing}
                    onPress={handleSave}
                    style={{ flex: 2 }}
                />
            </View>
        </Sheet>
    );
}

// Add/remove money from an apartado. Never touches the linked
// account's real balance — only how much of it is claimed.
function MoveMoneySheet({ onClose, savingsAccount, getFreeRoom, mode }) {
    const { addToSavingsAccount, removeFromSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [amount, setAmount] = useState('');
    const isDeposit = mode === 'deposit';
    const free = savingsAccount ? getFreeRoom(savingsAccount.linkedAccountId) : 0;
    const ceiling = isDeposit ? free : (savingsAccount?.earmarkedAmount ?? 0);
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
                    accent={theme.savings}
                    accentOn={theme.savingsOn}
                    disabled={!amt || amt <= 0 || overCeiling}
                    onPress={handleConfirm}
                    style={{ flex: 2 }}
                />
            </View>
        </Sheet>
    );
}

// New Goal sheet — a goal itself doesn't know about apartados until
// someone contributes to it.
function AddGoalSheet({ onClose }) {
    const { addSavingsGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [hasDeadline, setHasDeadline] = useState(false);
    const [deadline, setDeadline] = useState(null);

    const handleAdd = async () => {
        if (!name.trim() || !parseFloat(targetAmount)) return;
        await addSavingsGoal({
            name: name.trim(),
            targetAmount: parseFloat(targetAmount),
            deadline: hasDeadline && deadline ? deadline.toISOString() : null,
        });
        onClose();
    };

    const canSave = name.trim() && parseFloat(targetAmount) > 0 && (!hasDeadline || deadline);

    return (
        <Sheet onClose={onClose} title="Nuevo objetivo" scroll>
            <Field
                label="¿Qué quieres?"
                required
                value={name}
                onChangeText={setName}
                placeholder="Ej. AirPods 4, Viaje NYC..."
            />

            <FieldLabel required>¿Cuánto cuesta?</FieldLabel>
            <DecimalInput
                style={[styles.decimalInputLarge, fieldSurface(theme)]}
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="$0.00"
                placeholderTextColor={theme.inkDim}
            />

            <Toggle
                on={hasDeadline}
                label="Establecer fecha límite"
                onPress={() => setHasDeadline(!hasDeadline)}
            />

            {hasDeadline && (
                <>
                    <FieldLabel required>Fecha límite</FieldLabel>
                    <DatePickerField
                        value={deadline}
                        onChange={setDeadline}
                        placeholder="Selecciona una fecha"
                        minimumDate={new Date()}
                        displayFormat="MMMM yyyy"
                    />
                </>
            )}

            <View style={styles.sheetBtns}>
                <Button label="Cancelar" variant="secondary" onPress={onClose} />
                <Button label="Crear objetivo" disabled={!canSave} onPress={handleAdd} style={{ flex: 2 }} />
            </View>
        </Sheet>
    );
}

// Contribute to (or withdraw from) a goal — one apartado at a time.
// To fund a goal from several apartados, just do this more than once;
// each contribution keeps its own source, which is exactly what lets
// the risk calculation trace things back later.
function GoalContributeSheet({ onClose, goal, savingsAccounts, mode }) {
    const { contributeToGoal, withdrawFromGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [amount, setAmount] = useState('');
    const [selectedAccId, setSelectedAccId] = useState(savingsAccounts[0]?.id || '');
    const isDeposit = mode === 'deposit';
    const remaining = Math.max(0, (goal?.targetAmount || 0) - (goal?.savedAmount || 0));
    const wouldOverflow = isDeposit && parseFloat(amount) > remaining;

    const handleConfirm = async () => {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0 || !selectedAccId) return;
        const result = isDeposit
            ? await contributeToGoal({ goalId: goal.id, fromSavingsAccountId: selectedAccId, amount: amt })
            : await withdrawFromGoal({ goalId: goal.id, toSavingsAccountId: selectedAccId, amount: amt });
        if (result?.error) {
            Alert.alert('Error', result.error);
            return;
        }
        setAmount('');
        onClose();
    };

    return (
        <Sheet
            onClose={onClose}
            title={isDeposit ? 'Aportar al objetivo' : 'Retirar del objetivo'}
            subtitle={goal?.name}
            scroll
        >
            <FieldLabel required>Cantidad</FieldLabel>
            <DecimalInput
                style={[styles.decimalInputLarge, fieldSurface(theme, { error: !!wouldOverflow })]}
                value={amount}
                onChangeText={setAmount}
                placeholder="$0.00"
                placeholderTextColor={theme.inkDim}
                autoFocus
            />

            {/* The store already blocks an overflowing contribution
                outright — this is just letting the person see it
                (and fix it in one tap) before they hit "Aportar"
                instead of only after. */}
            {isDeposit && (
                <TouchableOpacity onPress={() => setAmount(remaining.toFixed(2))} accessibilityRole="button">
                    <Text style={[styles.hintTappable, wouldOverflow && styles.hintError]}>
                        Faltan {formatCurrencyShort(remaining)} para completarlo — toca para llenar
                    </Text>
                </TouchableOpacity>
            )}

            <FieldLabel required>{isDeposit ? 'Desde qué apartado' : 'Regresar a'}</FieldLabel>
            {savingsAccounts.length === 0 ? (
                <Text style={styles.hint}>Primero crea un apartado</Text>
            ) : (
                <View style={styles.pillRow}>
                    {savingsAccounts.map((a) => (
                        <Pill
                            key={a.id}
                            label={`${a.name} · ${formatCurrencyShort(a.earmarkedAmount)}`}
                            selected={selectedAccId === a.id}
                            accent={theme.savings}
                            onPress={() => setSelectedAccId(a.id)}
                        />
                    ))}
                </View>
            )}
            {isDeposit && (
                <Text style={styles.hint}>
                    ¿No te alcanza con uno? Aporta lo que tenga, guarda, y repite eligiendo otro apartado.
                </Text>
            )}

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
                    label={isDeposit ? 'Aportar' : 'Retirar'}
                    disabled={!amount || !selectedAccId}
                    onPress={handleConfirm}
                    style={{ flex: 2 }}
                />
            </View>
        </Sheet>
    );
}

// Anillo de progreso del objetivo. Mete dos datos en una sola forma:
// el arco turquesa es lo reunido, y el tramo ámbar del final es la
// parte de eso que está en riesgo. Antes el riesgo era un renglón
// aparte debajo de la barra, así que la tarjeta crecía cuando había
// mala noticia — justo cuando menos quieres que se descuadre.
//
// El ámbar arranca donde termina lo seguro, no en cero: leerlo de
// afuera hacia adentro es "esto es lo último que llegó y es lo primero
// que se puede perder", que es exactamente lo que significa.
function GoalRing({ pct, riskPct, theme, size = 74 }) {
    const stroke = 5;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const safePct = Math.max(0, pct - riskPct);
    const dash = (p) => `${(circumference * p) / 100}, ${circumference}`;

    return (
        <Svg width={size} height={size}>
            <Circle
                cx={size / 2} cy={size / 2} r={r}
                stroke={theme.border} strokeWidth={stroke} fill="none"
            />
            {pct > 0 && (
                <Circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={theme.brand} strokeWidth={stroke} fill="none"
                    strokeDasharray={dash(pct)}
                    // Con riesgo encima, un remate redondo asomaría por
                    // debajo del tramo ámbar. Sin riesgo sí va redondo.
                    strokeLinecap={riskPct > 0 ? 'butt' : 'round'}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            )}
            {riskPct > 0 && (
                <Circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={theme.moneyOut} strokeWidth={stroke} fill="none"
                    strokeDasharray={dash(riskPct)}
                    strokeLinecap="butt"
                    // 3.6° por punto porcentual.
                    transform={`rotate(${-90 + safePct * 3.6} ${size / 2} ${size / 2})`}
                />
            )}
        </Svg>
    );
}

// Retirar y eliminar de un objetivo, fuera de la tarjeta. Misma razón
// que ApartadoActionsSheet: eliminar era el único ícono tocable de la
// tarjeta y bastaba un toque para llegar al diálogo destructivo,
// mientras que aportar —lo que de verdad haces seguido— era un botón
// más abajo.
function GoalActionsSheet({ onClose, goal, atRisk, onWithdraw, onDelete }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    if (!goal) return null;

    return (
        <Sheet onClose={onClose} title={goal.name}>
            <View style={styles.actionsTotal}>
                <Money value={goal.savedAmount} size={FontSize.xl} color={theme.ink} />
                <Text style={styles.backingNote}>
                    reunidos de {formatCurrencyShort(goal.targetAmount)}
                    {atRisk > 0 ? ` · ${formatCurrencyShort(atRisk)} en riesgo` : ''}
                </Text>
            </View>

            {goal.savedAmount > 0 && (
                <View style={styles.sheetBtns}>
                    <Button label="Retirar a un apartado" variant="secondary" onPress={onWithdraw} />
                </View>
            )}
            <View style={styles.sheetBtnsTight}>
                <Button label="Eliminar objetivo" variant="danger" onPress={onDelete} />
            </View>
        </Sheet>
    );
}

// Goal card
function GoalCard({ goal, savingsAccounts, sources = [], onDelete, onRedeem, getMonthlySuggestion, getGoalRisk }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [showContribute, setShowContribute] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const percentage =
        goal.targetAmount > 0 ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100) : 0;
    // Complete has to come from the real amounts, never from the
    // rounded `percentage` above — that one is only for display.
    // Math.round would flip this to true as early as 99.5% funded
    // (e.g. $995 of a $1,000 goal), which used to let "Marcar como
    // comprado" fire while less money than promised was actually
    // sitting in the source apartados.
    const isComplete = goal.targetAmount > 0 && goal.savedAmount >= goal.targetAmount;
    const suggestion = getMonthlySuggestion(goal);
    const atRisk = getGoalRisk(goal);
    // Acotado a `percentage` para que el tramo ámbar nunca sea más
    // largo que el arco sobre el que se dibuja.
    const riskPct = goal.targetAmount > 0
        ? Math.min((atRisk / goal.targetAmount) * 100, percentage)
        : 0;

    const monthsLeft = goal.deadline
        ? differenceInCalendarMonths(parseISO(goal.deadline), new Date())
        : null;

    // Una sola línea de estado en vez de dos bloques apilados. Riesgo y
    // sugerencia decían cosas distintas con el mismo peso visual y cada
    // una empujaba la tarjeta hacia abajo; ahora se combinan en una
    // frase: qué pasa, y qué hacer al respecto.
    //
    // Sin riesgo, la sugerencia no se pinta de ámbar: no hay nada mal,
    // solo hay algo que decir.
    let status = null;
    if (atRisk > 0) {
        status = {
            urgent: true,
            text: `${formatCurrencyShort(atRisk)} en riesgo — un apartado de origen tiene menos saldo del que prometía.`
                + (suggestion && !isComplete ? ` Ahorra ${formatCurrencyShort(suggestion)}/mes para llegar a tiempo.` : ''),
        };
    } else if (suggestion && !isComplete) {
        status = { urgent: false, text: `Ahorra ${formatCurrencyShort(suggestion)}/mes para llegar a tiempo` };
    }

    const handleDelete = () => {
        Alert.alert(
            'Eliminar objetivo',
            goal.savedAmount > 0
                ? `Este objetivo tiene ${formatCurrencyShort(goal.savedAmount)} aportados. Al eliminarlo, regresan a los apartados de donde salieron.`
                : '¿Eliminar este objetivo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: onDelete },
            ]
        );
    };

    return (
        <GlassCard style={[styles.goalCard, isComplete && { borderColor: theme.moneyIn, borderWidth: 1.5 }]}>
            {/* Anillo + información. Dos columnas en vez de siete
                bloques apilados: la altura de la tarjeta ya no depende
                de cuántas cosas apliquen. */}
            <View style={styles.goalMain}>
                <View style={styles.goalRingWrap}>
                    <GoalRing pct={percentage} riskPct={riskPct} theme={theme} />
                    <View style={styles.goalRingCenter} pointerEvents="none">
                        <Text style={styles.goalRingPct}>{percentage}%</Text>
                        <Text style={styles.goalRingLabel}>
                            {isComplete ? 'LISTO' : 'REUNIDO'}
                        </Text>
                    </View>
                </View>

                <View style={styles.goalInfo}>
                    <View style={styles.goalHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
                            {!!goal.deadline && (
                                <Text style={styles.goalDeadline} numberOfLines={1}>
                                    {format(parseISO(goal.deadline), "MMMM 'de' yyyy", { locale: es })}
                                    {monthsLeft > 0 ? ` · faltan ${monthsLeft} ${monthsLeft === 1 ? 'mes' : 'meses'}` : ''}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.kebabBtn}
                            onPress={() => setShowActions(true)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
                            accessibilityRole="button"
                            accessibilityLabel={`Más acciones de ${goal.name}`}
                        >
                            <View style={styles.kebabDot} />
                            <View style={styles.kebabDot} />
                            <View style={styles.kebabDot} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.goalAmountRow}>
                        <Money value={goal.savedAmount} size={FontSize.xl - 1} color={theme.ink} decimals={false} compact />
                        <Text style={styles.goalOf}>de {formatCurrencyShort(goal.targetAmount)}</Text>
                    </View>

                    {/* De dónde sale este dinero. Sigue estando, pero como
                        puntos encimados y una línea de nombres en vez de
                        un bloque con divisor, etiqueta y fichas. */}
                    {sources.length > 0 && (
                        <View style={styles.goalSrcRow}>
                            <View style={styles.stackDots}>
                                {sources.slice(0, 4).map((src, i) => {
                                    const sa = savingsAccounts.find((a) => a.id === src.savingsAccountId);
                                    return (
                                        <View
                                            key={src.savingsAccountId}
                                            style={[
                                                styles.stackDot,
                                                i === 0 && styles.stackDotFirst,
                                                { backgroundColor: sa?.color || theme.inkDim },
                                            ]}
                                        />
                                    );
                                })}
                            </View>
                            <Text style={styles.goalSrcText} numberOfLines={1}>
                                {sources
                                    .map((src) => savingsAccounts.find((a) => a.id === src.savingsAccountId)?.name ?? 'eliminado')
                                    .join(' · ')}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {!!status && (
                <View style={[styles.statusBox, !status.urgent && styles.statusBoxQuiet]}>
                    {status.urgent && <IconWarningTriangle color={theme.moneyOut} size={13} />}
                    <Text style={[styles.statusText, !status.urgent && styles.statusTextQuiet]}>
                        {status.text}
                    </Text>
                </View>
            )}

            {/* Una sola acción principal inline. Retirar y eliminar
                viven en la hoja del "···" — son las raras, y una de
                ellas no se deshace. */}
            <View style={styles.goalBtns}>
                {isComplete ? (
                    <Button
                        label="Marcar como comprado"
                        accent={theme.moneyIn}
                        accentOn={theme.brandOn}
                        compact
                        onPress={() => onRedeem(goal)}
                        style={{ flex: 1 }}
                    />
                ) : (
                    <Button
                        label="+ Aportar"
                        compact
                        onPress={() => setShowContribute(true)}
                        style={{ flex: 1 }}
                    />
                )}
            </View>

            {showActions && (
                <GoalActionsSheet
                    goal={goal}
                    atRisk={atRisk}
                    onClose={() => setShowActions(false)}
                    onWithdraw={() => { setShowActions(false); setShowWithdraw(true); }}
                    onDelete={() => { setShowActions(false); handleDelete(); }}
                />
            )}
            {showContribute && (
                <GoalContributeSheet
                    onClose={() => setShowContribute(false)}
                    goal={goal}
                    savingsAccounts={savingsAccounts}
                    mode="deposit"
                />
            )}
            {showWithdraw && (
                <GoalContributeSheet
                    onClose={() => setShowWithdraw(false)}
                    goal={goal}
                    savingsAccounts={savingsAccounts}
                    mode="withdraw"
                />
            )}
        </GlassCard>
    );
}

// Las cuatro acciones de un apartado. Antes eran botones de 30x30
// pegados en la propia fila —por debajo del mínimo táctil de 44 y
// compitiendo con el contenido—; ahora la fila entera es el disparador
// y aquí caben con su nombre.
function ApartadoActionsSheet({ onClose, savingsAccount, backing, atRisk = 0, onDeposit, onWithdraw, onInterest, onDelete }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    if (!savingsAccount) return null;

    return (
        <Sheet onClose={onClose}>
            <View style={styles.sheetTitleRow}>
                <AccountDot color={savingsAccount.color} size={28} />
                <Text style={styles.sheetTitle}>{savingsAccount.name}</Text>
            </View>

            <View style={styles.actionsTotal}>
                <Money value={backing.total} size={FontSize.xl} color={theme.ink} />
                <Text style={styles.backingNote}>
                    {backing.committed > 0
                        ? `${formatCurrencyShort(backing.free)} libres · ${formatCurrencyShort(backing.committed)} con destino`
                        : 'todo libre'}
                </Text>
            </View>

            {/* La cifra que la fila ya no carga: ahí solo hay un punto
                ámbar, el detalle está aquí. */}
            {atRisk > 0 && (
                <View style={styles.riskRow}>
                    <IconWarningTriangle color={theme.moneyOut} size={13} />
                    <Text style={styles.riskText}>
                        {formatCurrencyShort(atRisk)} en riesgo — la cuenta ligada tiene menos saldo del que
                        este apartado promete
                    </Text>
                </View>
            )}

            <View style={styles.sheetBtns}>
                <Button label="Apartar" accent={theme.savings} accentOn={theme.savingsOn} onPress={onDeposit} />
                <Button label="Quitar" variant="secondary" onPress={onWithdraw} />
            </View>
            <View style={styles.sheetBtnsTight}>
                <Button
                    label={savingsAccount.interest?.enabled ? 'Editar interés' : 'Generar interés'}
                    variant="secondary"
                    onPress={onInterest}
                />
            </View>
            <View style={styles.sheetBtnsTight}>
                <Button label="Eliminar apartado" variant="danger" onPress={onDelete} />
            </View>
        </Sheet>
    );
}

// Main screen
export default function SavingsScreen() {
    const {
        accounts,
        savingsAccounts,
        savingsGoals,
        deleteSavingsAccount,
        deleteSavingsGoal,
        getMonthlySuggestion,
        addTransactionsBatch,
        getFreeRoom,
        getSavingsAccountRisk,
        getGoalRisk,
        getGoalCommitments,
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);

    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [moveMoneyTarget, setMoveMoneyTarget] = useState(null);
    const [editInterestTarget, setEditInterestTarget] = useState(null);
    // Las cuatro acciones ya no viven en la fila (eran botones de 30x30
    // pegados entre sí): la fila entera abre esta hoja.
    const [actionsTarget, setActionsTarget] = useState(null);

    // Total ahorros = everything currently earmarked in an apartado +
    // everything currently sitting inside a goal. Never double-counted:
    // contributing to a goal moves the amount OUT of the apartado's
    // own earmarkedAmount, so each peso is counted in exactly one of
    // the two sums below.
    // Una sola pasada para toda la pantalla: la usan las filas de
    // apartado y las fichas "sale de" de cada objetivo.
    const commitments = getGoalCommitments();

    const apartadosTotal = round2(savingsAccounts.reduce((s, a) => s + a.earmarkedAmount, 0));
    const goalsTotal = round2(savingsGoals.reduce((s, g) => s + g.savedAmount, 0));
    const totalSavings = round2(apartadosTotal + goalsTotal);

    const totalAtRisk = round2(
        savingsAccounts.reduce((s, a) => s + getSavingsAccountRisk(a.id).atRisk, 0) +
        savingsGoals.reduce((s, g) => s + getGoalRisk(g), 0),
    );

    const handleDeleteAccount = (acc) => {
        // Con dinero apartado no hay nada que confirmar: se explica por
        // qué no se puede y ya.
        if (acc.earmarkedAmount > 0) {
            Alert.alert(
                'Eliminar apartado',
                `Este apartado tiene ${formatCurrencyShort(acc.earmarkedAmount)} asignados. Quítaselos antes de eliminarlo.`,
                [{ text: 'Entendido' }]
            );
            return;
        }
        Alert.alert(
            'Eliminar apartado',
            `¿Eliminar "${acc.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => deleteSavingsAccount(acc.id),
                },
            ]
        );
    };

    // Redeem a completed goal: one real expense per apartado that fed
    // it, each charged against that apartado's own linked account.
    // Applied through one addTransactionsBatch call, not a loop of
    // addTransaction() — that reads accounts/transactions by closure,
    // so looping it would silently drop every source but the last.
    // The batch validates everything first (so a since-depleted
    // account fails with a clear error instead of spending money
    // that isn't there) and only applies once all sources pass, so a
    // goal never ends up half-redeemed.
    const handleRedeemGoal = (goal) => {
        const bySource = {};
        goal.contributions.forEach((c) => {
            const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
            if (!key) return;
            const sign = c.type === 'deposit' ? 1 : -1;
            bySource[key] = round2((bySource[key] || 0) + sign * c.amount);
        });
        const sources = Object.entries(bySource)
            .filter(([, amt]) => amt > 0)
            .map(([savingsAccountId, amt]) => ({
                amount: amt,
                sa: savingsAccounts.find((a) => a.id === savingsAccountId),
            }))
            // An apartado deleted before redeeming has nothing left to
            // trace this slice back to — skip it here, once, instead
            // of re-checking `source.sa` at every other use below.
            .filter((source) => source.sa);

        // What the confirmation below promises to deduct — the real
        // sum of what's about to be charged, not goal.targetAmount.
        const totalToDeduct = round2(sources.reduce((sum, s) => sum + s.amount, 0));

        Alert.alert(
            'Marcar como comprado',
            `Se descontarán ${formatCurrencyShort(totalToDeduct)} de tus cuentas y quedará registrado en tu historial.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar', onPress: async () => {
                        const result = await addTransactionsBatch(
                            sources.map((source) => ({
                                amount: source.amount,
                                reason: goal.name,
                                category: 'goal',
                                accountId: source.sa.linkedAccountId,
                            })),
                        );
                        if (result.error) {
                            const failedSource = sources[result.index];
                            Alert.alert(
                                'No se pudo',
                                `${result.error}${failedSource ? ` (al descontar de ${failedSource.sa.name})` : ''}`,
                            );
                            return;
                        }
                        await deleteSavingsGoal(goal.id, { returnFunds: false });
                        if (result.savingsWarnings?.length > 0) {
                            const lines = result.savingsWarnings
                                .map((w) => `· ${formatCurrencyShort(w.newlyAtRisk)} en ${w.accountName}`)
                                .join('\n');
                            Alert.alert(
                                'Comprado — con aviso',
                                `Esta compra también usó fondos de otros apartados en la misma cuenta:\n${lines}`,
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Ahorros"
                    subtitle={`${savingsAccounts.length} ${savingsAccounts.length === 1 ? 'apartado' : 'apartados'} · ${savingsGoals.length} ${savingsGoals.length === 1 ? 'objetivo' : 'objetivos'}`}
                />

                {/* Un solo bote, dos estados. Antes eran dos tarjetas
                    —"Total" y luego "Apartados | Objetivos"— pero el
                    total YA es la suma de esas dos, así que la segunda
                    repetía el mismo hecho partido en pedazos.
                    
                    Y partirlo como "Apartados vs Objetivos" sugería dos
                    montones separados de dinero, cuando es uno solo:
                    todo vive en las cuentas ligadas, y un objetivo
                    apenas le pone destino a una parte. Por eso el mismo
                    azul en dos opacidades y no dos colores distintos.
                    
                    La píldora de crecimiento (vs. mes pasado) sigue
                    pendiente: los movimientos de apartado no llevan
                    fecha en el modelo. */}
                <GlassCard style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total apartado</Text>
                    <Money value={totalSavings} size={FontSize.hero - 4} />

                    {totalSavings > 0 && (
                        <>
                            <View style={styles.splitBar}>
                                <View
                                    style={[
                                        styles.splitFree,
                                        { flex: Math.max(apartadosTotal, 0.0001) },
                                    ]}
                                />
                                {goalsTotal > 0 && (
                                    <View style={[styles.splitCommitted, { flex: goalsTotal }]} />
                                )}
                            </View>
                            <View style={styles.legendRow}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, styles.splitFree]} />
                                    <Text style={styles.legendLabel}>Libre</Text>
                                    <Money
                                        value={apartadosTotal}
                                        size={FontSize.sm}
                                        decimals={false}
                                        compact
                                    />
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, styles.splitCommitted]} />
                                    <Text style={styles.legendLabel}>Con destino</Text>
                                    <Money
                                        value={goalsTotal}
                                        size={FontSize.sm}
                                        decimals={false}
                                        compact
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {totalAtRisk > 0 && (
                        <View style={styles.riskRow}>
                            <IconWarningTriangle color={theme.moneyOut} size={13} />
                            <Text style={styles.riskText}>
                                {formatCurrencyShort(totalAtRisk)} en riesgo — alguna cuenta ligada tiene
                                menos saldo del que sus apartados prometen
                            </Text>
                        </View>
                    )}
                </GlassCard>

                {/* ── Mis apartados ── */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Mis apartados"
                        actionLabel="+ Nuevo"
                        onAction={() => setShowAddAccount(true)}
                    />

                    {savingsAccounts.length === 0 ? (
                        <EmptyState
                            icon={IconSavings}
                            accent={theme.savings}
                            title="Sin apartados"
                            description="Reserva parte del saldo de una tarjeta que ya tienes, sin mover el dinero de lugar."
                            actionLabel="Crear apartado"
                            onAction={() => setShowAddAccount(true)}
                        />
                    ) : (
                        <GlassCard style={styles.accountsGroup}>
                            {savingsAccounts.map((acc, i) => {
                                const linkedAccount = accounts.find((a) => a.id === acc.linkedAccountId);
                                const { atRisk } = getSavingsAccountRisk(acc.id);
                                // Lo que este apartado respalda de verdad:
                                // lo libre más lo que ya prometió. Ver
                                // getGoalCommitments en useSavings.js.
                                const mine = commitments.byAccount[acc.id] || [];
                                const committed = round2(mine.reduce((s2, c) => s2 + c.amount, 0));
                                const backing = round2(acc.earmarkedAmount + committed);
                                const destinos = mine
                                    .map((c) => savingsGoals.find((g) => g.id === c.goalId)?.name)
                                    .filter(Boolean);

                                // El subtítulo dice el estado del dinero
                                // primero y la cuenta ligada después:
                                // "a dónde va" cambia, "de dónde sale"
                                // casi nunca.
                                const linkedName = linkedAccount ? linkedAccount.name : 'cuenta eliminada';
                                let subLabel;
                                if (committed > 0) {
                                    const destino = destinos.length === 1
                                        ? destinos[0]
                                        : `${destinos.length} objetivos`;
                                    subLabel = `${formatCurrencyShort(committed)} → ${destino}  ·  ${linkedName}`;
                                } else if (backing > 0) {
                                    subLabel = `Todo libre  ·  ${linkedName}`;
                                } else {
                                    subLabel = `Vacío  ·  ${linkedName}`;
                                }

                                return (
                                    <TouchableOpacity
                                        key={acc.id}
                                        style={[
                                            styles.accountRow,
                                            i === savingsAccounts.length - 1 && styles.accountRowLast,
                                        ]}
                                        onPress={() => setActionsTarget(acc)}
                                        activeOpacity={0.7}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${acc.name}, ver acciones`}
                                    >
                                        <View style={[styles.accountDot, { backgroundColor: acc.color }]} />

                                        <View style={styles.accountInfo}>
                                            <View style={styles.accountNameRow}>
                                                <Text style={styles.accountName} numberOfLines={1}>
                                                    {acc.name}
                                                </Text>
                                                {acc.interest?.enabled && (
                                                    <View style={styles.ratePill}>
                                                        <Text style={styles.ratePillText}>
                                                            {acc.interest.rate}%
                                                        </Text>
                                                    </View>
                                                )}
                                                {/* El monto en riesgo ya no se
                                                    concatena al subtítulo: aquí
                                                    solo avisa que lo hay, y la
                                                    hoja de acciones da la cifra. */}
                                                {atRisk > 0 && <View style={styles.riskDot} />}
                                            </View>

                                            {/* La barra vive DENTRO del subtítulo,
                                                no debajo de la fila. Antes crecía
                                                la fila cuando había compromisos, y
                                                además caía al lado del contenido en
                                                vez de abajo, porque accountRow ya
                                                era flexDirection:'row'. */}
                                            <View style={styles.accountSub}>
                                                <View style={styles.miniBar}>
                                                    {backing > 0 && (
                                                        <>
                                                            <View style={[
                                                                styles.splitFree,
                                                                { flex: Math.max(acc.earmarkedAmount, 0.0001) },
                                                            ]} />
                                                            {committed > 0 && (
                                                                <View style={[styles.splitCommitted, { flex: committed }]} />
                                                            )}
                                                        </>
                                                    )}
                                                </View>
                                                <Text style={styles.accountLinked} numberOfLines={1}>
                                                    {subLabel}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.accountRight}>
                                            <Money
                                                value={backing}
                                                size={FontSize.md}
                                                color={theme.ink}
                                                decimals={false}
                                            />
                                            {acc.totalInterestEarned > 0 && (
                                                <Text style={styles.earnedText}>
                                                    +{formatCurrencyShort(acc.totalInterestEarned)} ganados
                                                </Text>
                                            )}
                                        </View>

                                        <IconChevronRight color={theme.inkDim} size={13} />
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Cierra el grupo con su propia suma, que
                                antes solo existía arriba mezclada con lo
                                que está dentro de objetivos. */}
                            <View style={styles.accountsFooter}>
                                <Text style={styles.accountsFooterLabel}>
                                    {savingsAccounts.length} {savingsAccounts.length === 1 ? 'apartado' : 'apartados'}
                                </Text>
                                <Money
                                    value={round2(apartadosTotal + goalsTotal)}
                                    size={FontSize.sm + 1}
                                    color={theme.inkMid}
                                    decimals={false}
                                    compact
                                />
                            </View>
                        </GlassCard>
                    )}
                </View>

                {/* ── Objetivos ── */}
                <View style={styles.section}>
                    <SectionHeader
                        title="A dónde va"
                        actionLabel="+ Nuevo"
                        onAction={() => setShowAddGoal(true)}
                    />

                    {savingsGoals.length === 0 ? (
                        <EmptyState
                            icon={IconSavings}
                            title="Sin objetivos"
                            description="AirPods, un viaje, un fondo de emergencia — algo concreto a lo que apuntar tus apartados."
                            actionLabel="Crear objetivo"
                            onAction={() => setShowAddGoal(true)}
                        />
                    ) : (
                        savingsGoals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                savingsAccounts={savingsAccounts}
                                sources={commitments.byGoal[goal.id] || []}
                                onDelete={() => deleteSavingsGoal(goal.id)}
                                onRedeem={handleRedeemGoal}
                                getMonthlySuggestion={getMonthlySuggestion}
                                getGoalRisk={getGoalRisk}
                            />
                        ))
                    )}
                </View>

                <View style={{ height: Spacing.xl + Spacing.lg }} />
            </ScrollView>

            {showAddAccount && (
                <AddApartadoSheet
                    onClose={() => setShowAddAccount(false)}
                    accounts={accounts}
                    getFreeRoom={getFreeRoom}
                />
            )}
            {showAddGoal && <AddGoalSheet onClose={() => setShowAddGoal(false)} />}
            {moveMoneyTarget && (
                <MoveMoneySheet
                    onClose={() => setMoveMoneyTarget(null)}
                    savingsAccount={moveMoneyTarget.account}
                    getFreeRoom={getFreeRoom}
                    mode={moveMoneyTarget.mode}
                />
            )}
            {actionsTarget && (
                <ApartadoActionsSheet
                    onClose={() => setActionsTarget(null)}
                    savingsAccount={actionsTarget}
                    atRisk={getSavingsAccountRisk(actionsTarget.id).atRisk}
                    backing={(() => {
                        const mine = commitments.byAccount[actionsTarget.id] || [];
                        const committed = round2(mine.reduce((s2, c) => s2 + c.amount, 0));
                        return {
                            free: actionsTarget.earmarkedAmount,
                            committed,
                            total: round2(actionsTarget.earmarkedAmount + committed),
                        };
                    })()}
                    onDeposit={() => {
                        const acc = actionsTarget;
                        setActionsTarget(null);
                        setMoveMoneyTarget({ account: acc, mode: 'deposit' });
                    }}
                    onWithdraw={() => {
                        const acc = actionsTarget;
                        setActionsTarget(null);
                        setMoveMoneyTarget({ account: acc, mode: 'withdraw' });
                    }}
                    onInterest={() => {
                        const acc = actionsTarget;
                        setActionsTarget(null);
                        setEditInterestTarget(acc);
                    }}
                    onDelete={() => {
                        const acc = actionsTarget;
                        setActionsTarget(null);
                        handleDeleteAccount(acc);
                    }}
                />
            )}
            {editInterestTarget && (
                <EditInterestSheet
                    onClose={() => setEditInterestTarget(null)}
                    savingsAccount={editInterestTarget}
                />
            )}
        </View>
    );
}