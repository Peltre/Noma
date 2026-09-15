// Ahorros — tres bloques:
//   1. Todo tu dinero: por tarjeta (el lugar físico), con sus apartados
//      colgando debajo y lo "sin apartar" al final.
//   2. Ahorro: la suma de los objetivos, en grande.
//   3. Objetivos: una fila por objetivo; el detalle vive en su hoja.
//
// Modelo (ver useSavings.js): tarjeta → apartado (parte del saldo de la
// tarjeta) → objetivo (vive en un lugar: la tarjeta o uno de sus
// apartados). No hay aportaciones ni fuentes.
//
// Los apartados no tienen sección propia: se ven dentro de "Todo tu
// dinero" y en cada objetivo, y se administran desde el detalle de su
// tarjeta en Tarjetas (o con el atajo del formulario de objetivo).
import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { format, parseISO, differenceInCalendarMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import { AccentProvider } from '../store/useAccent';
import { SAVINGS_COLORS, LINKABLE_TYPES } from '../store/savingsStore';
import { formatCurrencyShort } from '../utils';
import { round2 } from '../utils/formatCurrency';
import { FontSize, Spacing } from '../constants';
import createSavingsStyles from './SavingsScreen.styles';
import DecimalInput from '../components/DecimalInput';
import DatePickerField from '../components/DatePickerField';
import { IconWarningTriangle, IconGoal, IconChevronRight } from '../components/Icons';
import {
    ScreenHeader, EmptyState, Sheet, Pill, Button, Field, FieldLabel, Money, GlassCard, fieldSurface,
} from '../components/ui';
import {
    ColorPicker, Toggle, AddApartadoSheet, MoveMoneySheet, EditInterestSheet, ApartadoSheet,
} from '../components/savings/ApartadoSheets';

// ── Helpers ──────────────────────────────────────────────────────────

const accountColor = (a, theme) => a.color || (a.type === 'cash' ? theme.cashTone : theme.inkDim);

// El lugar de un objetivo, resuelto: tarjeta + apartado (si lo hay).
function resolvePlace(goal, accounts, savingsAccounts) {
    const account = accounts.find((a) => a.id === goal.accountId) || null;
    const apartado = goal.savingsAccountId
        ? savingsAccounts.find((s) => s.id === goal.savingsAccountId) || null
        : null;
    return { account, apartado };
}

// Los números que comparten la fila y la hoja de un objetivo.
function describeGoal(goal, place, theme, getMonthlySuggestion, getGoalRisk) {
    const percentage = goal.targetAmount > 0
        ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100) : 0;
    // Completo con montos reales, nunca con el porcentaje redondeado.
    const isComplete = goal.targetAmount > 0 && goal.savedAmount >= goal.targetAmount;
    const suggestion = getMonthlySuggestion(goal);
    const atRisk = getGoalRisk(goal);
    const riskPct = goal.targetAmount > 0 ? Math.min((atRisk / goal.targetAmount) * 100, percentage) : 0;
    const color = goal.color || place.apartado?.color || (place.account ? accountColor(place.account, theme) : null);
    const monthsLeft = goal.deadline ? differenceInCalendarMonths(parseISO(goal.deadline), new Date()) : null;
    const hasPlace = !!goal.accountId;
    return { percentage, isComplete, suggestion, atRisk, riskPct, color, monthsLeft, hasPlace };
}

function GoalRing({ pct, riskPct, theme, color, size = 74, stroke = size >= 60 ? 5 : 3 }) {
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const safePct = Math.max(0, pct - riskPct);
    const dash = (p) => `${(circumference * p) / 100}, ${circumference}`;
    return (
        <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.border} strokeWidth={stroke} fill="none" />
            {pct > 0 && (
                <Circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={color || theme.ink} strokeWidth={stroke} fill="none"
                    strokeDasharray={dash(pct)}
                    strokeLinecap={riskPct > 0 ? 'butt' : 'round'}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            )}
            {riskPct > 0 && (
                <Circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={theme.moneyOut} strokeWidth={stroke} fill="none"
                    strokeDasharray={dash(riskPct)} strokeLinecap="butt"
                    transform={`rotate(${-90 + safePct * 3.6} ${size / 2} ${size / 2})`}
                />
            )}
        </Svg>
    );
}

// "BBVA › Viaje" con los dos colores, o sólo la tarjeta.
function PlaceLine({ place, theme, styles, strong }) {
    if (!place.account) return <Text style={styles.goalRowSub}>Sin lugar todavía</Text>;
    return (
        <View style={styles.placeLine}>
            <View style={[styles.legendDot, { backgroundColor: accountColor(place.account, theme) }]} />
            <Text style={[styles.placeText, strong && !place.apartado && styles.placeTextStrong]} numberOfLines={1}>
                {place.account.name}
            </Text>
            {place.apartado && (
                <>
                    <Text style={styles.placeSep}>›</Text>
                    <View style={[styles.legendDot, { backgroundColor: place.apartado.color }]} />
                    <Text style={[styles.placeText, strong && styles.placeTextStrong]} numberOfLines={1}>
                        {place.apartado.name}
                    </Text>
                </>
            )}
        </View>
    );
}

// Selector de lugar: las tarjetas y, debajo de cada una, sus apartados,
// cada opción con cuánto tiene sin destino. Última línea: "+ Nuevo
// apartado" (atajo). `sameAccountOnly` limita a una tarjeta (mover).
function PlacePicker({ accounts, savingsAccounts, value, onChange, getPlaceFree, onNewApartado, sameAccountOnly }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const linkable = accounts.filter((a) => LINKABLE_TYPES.includes(a.type) && (!sameAccountOnly || a.id === sameAccountOnly));
    const isSel = (accountId, savingsAccountId) =>
        value?.accountId === accountId && (value?.savingsAccountId || null) === (savingsAccountId || null);
    return (
        <View>
            {linkable.map((a) => {
                const mine = savingsAccounts.filter((s) => s.linkedAccountId === a.id);
                return (
                    <View key={a.id} style={styles.placeGroup}>
                        <Pill
                            icon={() => <View style={[styles.legendDot, { backgroundColor: accountColor(a, theme) }]} />}
                            label={`${a.name} · ${formatCurrencyShort(getPlaceFree({ accountId: a.id }))}`}
                            selected={isSel(a.id, null)}
                            onPress={() => onChange({ accountId: a.id, savingsAccountId: null })}
                        />
                        {mine.length > 0 && (
                            <View style={styles.placeChildren}>
                                {mine.map((s) => (
                                    <Pill
                                        key={s.id}
                                        icon={() => <View style={[styles.legendDot, { backgroundColor: s.color }]} />}
                                        label={`${s.name} · ${formatCurrencyShort(getPlaceFree({ accountId: a.id, savingsAccountId: s.id }))}`}
                                        selected={isSel(a.id, s.id)}
                                        onPress={() => onChange({ accountId: a.id, savingsAccountId: s.id })}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}
            {onNewApartado && (
                <TouchableOpacity style={styles.newApartadoLink} onPress={onNewApartado} accessibilityRole="button">
                    <Text style={styles.newApartadoText}>+ Nuevo apartado en una tarjeta</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ── Sheets ───────────────────────────────────────────────────────────

// Nuevo objetivo: nombre, meta, fecha opcional, dónde vive, color y
// "empezar con lo que ya hay libre ahí".
function AddGoalSheet({ onClose, accounts, savingsAccounts, getPlaceFree, initialPlace = null }) {
    const { addSavingsGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [hasDeadline, setHasDeadline] = useState(false);
    const [deadline, setDeadline] = useState(null);
    const [place, setPlace] = useState(initialPlace);
    const [color, setColor] = useState(SAVINGS_COLORS[0]);
    const [startWithFree, setStartWithFree] = useState(false);
    const [newApartado, setNewApartado] = useState(false);

    const free = place ? getPlaceFree(place) : 0;
    const target = parseFloat(targetAmount) || 0;
    const startAmount = target > 0 ? Math.min(free, target) : free;
    const initialAmount = startWithFree ? startAmount : 0;
    const canSave = name.trim() && target > 0 && place && (!hasDeadline || deadline);

    const handleAdd = async () => {
        if (!canSave) return;
        const result = await addSavingsGoal({
            name: name.trim(),
            targetAmount: target,
            deadline: hasDeadline && deadline ? deadline.toISOString() : null,
            accountId: place.accountId,
            savingsAccountId: place.savingsAccountId || null,
            color,
            initialAmount,
        });
        if (result?.error) { Alert.alert('No se pudo crear', result.error); return; }
        onClose();
    };

    if (newApartado) {
        return (
            <AddApartadoSheet
                onClose={() => setNewApartado(false)}
                accounts={accounts}
                getFreeRoom={(id) => getPlaceFree({ accountId: id })}
                initialAccountId={place?.accountId || null}
                onCreated={(sa) => setPlace({ accountId: sa.linkedAccountId, savingsAccountId: sa.id })}
            />
        );
    }

    return (
        <AccentProvider color={color} on={theme.brandOn}>
            <Sheet onClose={onClose} title="Nuevo objetivo" scroll>
                <Field label="¿Qué quieres?" required value={name} onChangeText={setName} placeholder="Ej. Enganche, viaje, laptop…" />

                <FieldLabel required>Meta</FieldLabel>
                <DecimalInput
                    style={[styles.decimalInputLarge, fieldSurface(theme)]}
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    placeholder="$0.00"
                    placeholderTextColor={theme.inkDim}
                />

                <Toggle on={hasDeadline} label="Establecer fecha límite" onPress={() => setHasDeadline(!hasDeadline)} accent={color} accentOn={theme.brandOn} />
                {hasDeadline && (
                    <>
                        <FieldLabel required>Fecha límite</FieldLabel>
                        <DatePickerField value={deadline} onChange={setDeadline} placeholder="Selecciona una fecha" minimumDate={new Date()} displayFormat="MMMM yyyy" />
                    </>
                )}

                <FieldLabel required>¿Dónde vive este dinero?</FieldLabel>
                <Text style={styles.hint}>La tarjeta o el apartado donde está (o estará) guardado. Cada opción muestra cuánto tiene sin destino.</Text>
                <PlacePicker
                    accounts={accounts}
                    savingsAccounts={savingsAccounts}
                    value={place}
                    onChange={(p) => { setPlace(p); setStartWithFree(false); }}
                    getPlaceFree={getPlaceFree}
                    onNewApartado={() => setNewApartado(true)}
                />

                <FieldLabel>Color</FieldLabel>
                <ColorPicker selected={color} onSelect={setColor} />

                {place && free > 0 && (
                    <Toggle
                        on={startWithFree}
                        label={`Empezar con lo que ya hay libre ahí (${formatCurrencyShort(startAmount)})`}
                        onPress={() => setStartWithFree(!startWithFree)}
                        accent={color}
                        accentOn={theme.brandOn}
                    />
                )}

                <View style={styles.sheetBtns}>
                    <Button label="Cancelar" variant="secondary" onPress={onClose} />
                    <Button label="Crear objetivo" disabled={!canSave} onPress={handleAdd} style={{ flex: 2 }} />
                </View>
            </Sheet>
        </AccentProvider>
    );
}

// Editar nombre, meta, fecha y color.
function EditGoalSheet({ onClose, goal }) {
    const { updateSavingsGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState(goal.name);
    const [targetAmount, setTargetAmount] = useState(String(goal.targetAmount));
    const [hasDeadline, setHasDeadline] = useState(!!goal.deadline);
    const [deadline, setDeadline] = useState(goal.deadline ? parseISO(goal.deadline) : null);
    const [color, setColor] = useState(goal.color || SAVINGS_COLORS[0]);
    const target = parseFloat(targetAmount) || 0;
    const canSave = name.trim() && target > 0 && (!hasDeadline || deadline);

    const handleSave = async () => {
        if (!canSave) return;
        const result = await updateSavingsGoal(goal.id, {
            name: name.trim(),
            targetAmount: target,
            deadline: hasDeadline && deadline ? deadline.toISOString() : null,
            color,
        });
        if (result?.error) { Alert.alert('No se pudo guardar', result.error); return; }
        onClose();
    };

    return (
        <AccentProvider color={color} on={theme.brandOn}>
            <Sheet onClose={onClose} title="Editar objetivo" scroll>
                <Field label="Nombre" required value={name} onChangeText={setName} />
                <FieldLabel required>Meta</FieldLabel>
                <DecimalInput style={[styles.decimalInputLarge, fieldSurface(theme)]} value={targetAmount} onChangeText={setTargetAmount} placeholder="$0.00" placeholderTextColor={theme.inkDim} />
                <Toggle on={hasDeadline} label="Fecha límite" onPress={() => setHasDeadline(!hasDeadline)} accent={color} accentOn={theme.brandOn} />
                {hasDeadline && (
                    <>
                        <FieldLabel required>Fecha límite</FieldLabel>
                        <DatePickerField value={deadline} onChange={setDeadline} placeholder="Selecciona una fecha" displayFormat="MMMM yyyy" />
                    </>
                )}
                <FieldLabel>Color</FieldLabel>
                <ColorPicker selected={color} onSelect={setColor} />
                <View style={styles.sheetBtns}>
                    <Button label="Cancelar" variant="secondary" onPress={onClose} />
                    <Button label="Guardar" disabled={!canSave} onPress={handleSave} style={{ flex: 2 }} />
                </View>
            </Sheet>
        </AccentProvider>
    );
}

// Ahorrar / Sacar: un monto, con el tope visible.
function GoalAmountSheet({ onClose, goal, mode, available, accent }) {
    const { saveToGoal, takeFromGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [amount, setAmount] = useState('');
    const isSave = mode === 'save';
    const requested = parseFloat(amount) || 0;
    const over = requested > available;
    const canDo = requested > 0 && !over;

    const handle = async () => {
        if (!canDo) return;
        const result = isSave
            ? await saveToGoal({ goalId: goal.id, amount: requested })
            : await takeFromGoal({ goalId: goal.id, amount: requested });
        if (result?.error) { Alert.alert('No se pudo', result.error); return; }
        onClose();
    };

    return (
        <AccentProvider color={accent} on={theme.brandOn}>
            <Sheet onClose={onClose} title={isSave ? `Ahorrar en ${goal.name}` : `Sacar de ${goal.name}`}>
                <Text style={styles.hint}>
                    {isSave
                        ? `Puedes ahorrar hasta ${formatCurrencyShort(available)}: lo que hay sin destino donde vive el objetivo, sin pasar de la meta.`
                        : `Vuelve a quedar sin destino en el mismo lugar. Ahorrado: ${formatCurrencyShort(available)}.`}
                </Text>
                <DecimalInput
                    style={[styles.decimalInputLarge, fieldSurface(theme, { error: over })]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="$0.00"
                    placeholderTextColor={theme.inkDim}
                    autoFocus
                />
                {over && <Text style={[styles.hint, { color: theme.moneyOut }]}>Sólo hay {formatCurrencyShort(available)}.</Text>}
                <View style={styles.sheetBtns}>
                    <Button label="Cancelar" variant="secondary" onPress={onClose} />
                    <Button label={isSave ? 'Ahorrar' : 'Sacar'} disabled={!canDo} onPress={handle} style={{ flex: 2 }} />
                </View>
            </Sheet>
        </AccentProvider>
    );
}

// Mover a otro lugar dentro de la misma tarjeta.
function MoveGoalSheet({ onClose, goal, accounts, savingsAccounts, getPlaceFree, accent }) {
    const { moveGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [place, setPlace] = useState(goal.accountId ? { accountId: goal.accountId, savingsAccountId: goal.savingsAccountId || null } : null);
    const changed = !!place && (place.accountId !== goal.accountId || (place.savingsAccountId || null) !== (goal.savingsAccountId || null));
    // Al moverlo, su propio dinero cuenta como libre en su lugar actual.
    const freeFor = (p) => {
        const base = getPlaceFree(p);
        const same = p.accountId === goal.accountId && (p.savingsAccountId || null) === (goal.savingsAccountId || null);
        return same ? round2(base + goal.savedAmount) : base;
    };
    const handle = async () => {
        const result = await moveGoal({ goalId: goal.id, ...place });
        if (result?.error) { Alert.alert('No se pudo mover', result.error); return; }
        onClose();
    };
    const locked = goal.accountId && goal.savedAmount > 0 ? goal.accountId : null;
    return (
        <AccentProvider color={accent} on={theme.brandOn}>
            <Sheet onClose={onClose} title={goal.accountId ? 'Mover a otro lugar' : 'Elegir dónde vive'} scroll>
                <Text style={styles.hint}>
                    {locked
                        ? 'Dentro de la misma tarjeta: a la tarjeta o a uno de sus apartados. Para cambiar de tarjeta, primero haz un traspaso del dinero.'
                        : 'Elige la tarjeta o el apartado donde vive este dinero.'}
                </Text>
                <PlacePicker
                    accounts={accounts}
                    savingsAccounts={savingsAccounts}
                    value={place}
                    onChange={setPlace}
                    getPlaceFree={freeFor}
                    sameAccountOnly={locked}
                />
                <View style={styles.sheetBtns}>
                    <Button label="Cancelar" variant="secondary" onPress={onClose} />
                    <Button label="Mover" disabled={!changed} onPress={handle} style={{ flex: 2 }} />
                </View>
            </Sheet>
        </AccentProvider>
    );
}

// La hoja del objetivo: explica y luego actúa.
function GoalSheet({ onClose, goal, accounts, savingsAccounts, getPlaceFree, getMonthlySuggestion, getGoalRisk, onRedeem, onDelete, onOpenApartado }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [sub, setSub] = useState(null); // 'save' | 'take' | 'edit' | 'move'
    const place = resolvePlace(goal, accounts, savingsAccounts);
    const g = describeGoal(goal, place, theme, getMonthlySuggestion, getGoalRisk);
    const accent = g.color || theme.brand;
    const remaining = Math.max(round2(goal.targetAmount - goal.savedAmount), 0);
    const freeHere = g.hasPlace ? getPlaceFree(goal) : 0;

    const handleDelete = () => {
        Alert.alert(
            'Eliminar objetivo',
            goal.savedAmount > 0
                ? `Tiene ${formatCurrencyShort(goal.savedAmount)} ahorrados. Al eliminarlo, ese dinero se queda donde está, sólo sin destino.`
                : '¿Eliminar este objetivo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => { onClose(); onDelete(); } },
            ]
        );
    };

    if (sub === 'save' || sub === 'take') {
        return <GoalAmountSheet onClose={() => setSub(null)} goal={goal} mode={sub} accent={accent} available={sub === 'save' ? Math.min(freeHere, remaining) : goal.savedAmount} />;
    }
    if (sub === 'edit') return <EditGoalSheet onClose={() => setSub(null)} goal={goal} />;
    if (sub === 'move') return <MoveGoalSheet onClose={() => setSub(null)} goal={goal} accounts={accounts} savingsAccounts={savingsAccounts} getPlaceFree={getPlaceFree} accent={accent} />;

    return (
        <AccentProvider color={accent} on={theme.brandOn}>
            <Sheet onClose={onClose} scroll>
                <View style={styles.goalSheetHead}>
                    <View style={styles.goalRingWrap}>
                        <GoalRing pct={g.percentage} riskPct={g.riskPct} theme={theme} color={g.color} size={84} />
                        <View style={styles.goalRingCenter} pointerEvents="none">
                            <Text style={[styles.goalRingPct, g.percentage >= 100 && styles.goalRingPctFull]}>{g.percentage}%</Text>
                            <Text style={styles.goalRingLabel}>{g.isComplete ? 'LISTO' : 'REUNIDO'}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.goalSheetName} numberOfLines={2}>{goal.name}</Text>
                        {!!goal.deadline && (
                            <Text style={styles.goalDeadline} numberOfLines={1}>
                                {format(parseISO(goal.deadline), "MMMM 'de' yyyy", { locale: es })}
                                {g.monthsLeft > 0 ? ` · faltan ${g.monthsLeft} ${g.monthsLeft === 1 ? 'mes' : 'meses'}` : ''}
                            </Text>
                        )}
                        <View style={styles.goalAmountRow}>
                            <Money value={goal.savedAmount} size={FontSize.xl} color={theme.ink} decimals={false} compact />
                            <Text style={styles.goalOf}>de {formatCurrencyShort(goal.targetAmount)}</Text>
                        </View>
                    </View>
                </View>

                {!g.isComplete && (
                    <GlassCard style={[styles.goalPaceBox, g.atRisk > 0 && { borderColor: theme.moneyOut }]}>
                        {!!g.suggestion && (
                            <View style={styles.sheetRow}>
                                <Text style={styles.sheetRowLabel}>Para llegar a tiempo</Text>
                                <Text style={styles.sheetRowValue}>{formatCurrencyShort(g.suggestion)} / mes</Text>
                            </View>
                        )}
                        <View style={[styles.sheetRow, !!g.suggestion && styles.sheetRowBorder]}>
                            <Text style={styles.sheetRowLabel}>Faltan</Text>
                            <Text style={styles.sheetRowValue}>{formatCurrencyShort(remaining)}</Text>
                        </View>
                        {g.atRisk > 0 && (
                            <View style={[styles.riskRow, { marginTop: 0, paddingBottom: Spacing.sm }]}>
                                <IconWarningTriangle color={theme.moneyOut} size={13} />
                                <Text style={styles.riskText}>
                                    {formatCurrencyShort(g.atRisk)} en riesgo — la tarjeta donde vive tiene menos saldo del que reclaman sus apartados y objetivos.
                                </Text>
                            </View>
                        )}
                    </GlassCard>
                )}

                <FieldLabel>Vive en</FieldLabel>
                <GlassCard style={styles.sheetGroup}>
                    <TouchableOpacity
                        style={styles.sheetRow}
                        onPress={place.apartado ? () => onOpenApartado(place.apartado) : undefined}
                        disabled={!place.apartado}
                        accessibilityRole={place.apartado ? 'button' : undefined}
                    >
                        <PlaceLine place={place} theme={theme} styles={styles} strong />
                        {place.apartado && <IconChevronRight color={theme.inkDim} size={13} />}
                    </TouchableOpacity>
                    {g.hasPlace && (
                        <View style={[styles.sheetRow, styles.sheetRowBorder]}>
                            <Text style={styles.sheetRowLabel}>Sin destino ahí</Text>
                            <Text style={styles.sheetRowValue}>{formatCurrencyShort(freeHere)}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={[styles.sheetRow, styles.sheetRowBorder]} onPress={() => setSub('move')} accessibilityRole="button">
                        <Text style={[styles.sheetRowText, { color: accent }]}>{g.hasPlace ? 'Mover a otro lugar' : 'Elegir dónde vive'}</Text>
                        <IconChevronRight color={accent} size={13} />
                    </TouchableOpacity>
                </GlassCard>

                {g.isComplete ? (
                    <>
                        <View style={styles.sheetBtns}>
                            <Button label="Marcar como comprado" accent={theme.moneyIn} accentOn={theme.brandOn} onPress={() => { onClose(); onRedeem(goal); }} />
                        </View>
                        <View style={styles.sheetBtnsTight}>
                            <Button label="Sacar" variant="secondary" onPress={() => setSub('take')} style={{ flex: 1 }} />
                            <Button label="Editar" variant="secondary" onPress={() => setSub('edit')} style={{ flex: 1 }} />
                        </View>
                    </>
                ) : (
                    <View style={styles.sheetBtns}>
                        <Button label="+ Ahorrar" disabled={!g.hasPlace} onPress={() => setSub('save')} style={{ flex: 2 }} />
                        {goal.savedAmount > 0 && <Button label="Sacar" variant="secondary" onPress={() => setSub('take')} style={{ flex: 1 }} />}
                        <Button label="Editar" variant="secondary" onPress={() => setSub('edit')} style={{ flex: 1 }} />
                    </View>
                )}
                <View style={styles.sheetBtnsTight}>
                    <Button label="Eliminar objetivo" variant="danger" onPress={handleDelete} />
                </View>
            </Sheet>
        </AccentProvider>
    );
}

// ── Rows ─────────────────────────────────────────────────────────────

function GoalRow({ goal, accounts, savingsAccounts, getMonthlySuggestion, getGoalRisk, onPress, last }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const place = resolvePlace(goal, accounts, savingsAccounts);
    const g = describeGoal(goal, place, theme, getMonthlySuggestion, getGoalRisk);

    let sub = `${formatCurrencyShort(goal.savedAmount)} de ${formatCurrencyShort(goal.targetAmount)}`;
    if (g.isComplete) sub += ' · listo';
    else if (goal.deadline) sub += ` · ${format(parseISO(goal.deadline), 'MMM yyyy', { locale: es })}`;
    if (!g.isComplete && g.atRisk === 0 && g.suggestion) sub += ` · ${formatCurrencyShort(g.suggestion)}/mes`;

    return (
        <TouchableOpacity
            style={[styles.goalRow, last && styles.accountRowLast]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${goal.name}, ${g.percentage}% reunido`}
        >
            <View style={styles.goalRowRing}>
                <GoalRing pct={g.percentage} riskPct={g.riskPct} theme={theme} color={g.color} size={36} />
                <View style={styles.goalRowRingCenter} pointerEvents="none">
                    <Text style={[styles.goalRowPct, g.percentage >= 100 && styles.goalRowPctFull, !g.hasPlace && { color: theme.inkDim }]}>{g.percentage}%</Text>
                </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.goalRowName} numberOfLines={1}>{goal.name}</Text>
                <Text style={styles.goalRowSub} numberOfLines={1}>
                    {sub}
                    {g.atRisk > 0 && <Text style={styles.goalRowUrgent}>  · {formatCurrencyShort(g.atRisk)} en riesgo</Text>}
                </Text>
                <PlaceLine place={place} theme={theme} styles={styles} />
            </View>
            <IconChevronRight color={theme.inkDim} size={13} />
        </TouchableOpacity>
    );
}

// ── Screen ───────────────────────────────────────────────────────────

export default function SavingsScreen() {
    const {
        accounts, savingsAccounts, savingsGoals,
        deleteSavingsAccount, deleteSavingsGoal,
        getMonthlySuggestion, addTransaction,
        getFreeRoom, getApartadoFree, getPlaceFree, getSavingsAccountRisk, getGoalRisk, getAccountDeficit,
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);

    const [showAddGoal, setShowAddGoal] = useState(false);
    // 'general' = sólo tarjetas; 'detalle' = con sus apartados y lo sin apartar.
    const [breakdown, setBreakdown] = useState('general');
    const [goalTarget, setGoalTarget] = useState(null);
    const [apartadoTarget, setApartadoTarget] = useState(null);
    const [moveMoneyTarget, setMoveMoneyTarget] = useState(null);
    const [editInterestTarget, setEditInterestTarget] = useState(null);

    const totalMoney = round2(accounts.reduce((sum, a) => sum + (a.balance || 0), 0));
    const totalSaved = round2(savingsGoals.reduce((s, g) => s + g.savedAmount, 0));
    const savedPct = totalMoney > 0 ? Math.round((totalSaved / totalMoney) * 100) : 0;
    const moneyAccounts = accounts.filter((a) => a.balance > 0 || savingsAccounts.some((s) => s.linkedAccountId === a.id));
    // Riesgo total = déficit de cada tarjeta, una sola vez por tarjeta.
    const totalAtRisk = round2(accounts.reduce((s, a) => s + getAccountDeficit(a.id).deficit, 0));

    const handleDeleteApartado = (acc) => {
        Alert.alert('Eliminar apartado', `¿Eliminar "${acc.name}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar', style: 'destructive', onPress: async () => {
                    const r = await deleteSavingsAccount(acc.id);
                    if (r?.error) Alert.alert('No se pudo eliminar', r.error);
                }
            },
        ]);
    };

    // Marcar como comprado: el dinero sale de verdad (gasto en la tarjeta
    // donde vive) y el objetivo desaparece sin devolver nada.
    const handleRedeemGoal = (goal) => {
        const account = accounts.find((a) => a.id === goal.accountId);
        if (!account) { Alert.alert('Sin lugar', 'Este objetivo no tiene una tarjeta. Elige dónde vive antes de marcarlo.'); return; }
        Alert.alert(
            'Marcar como comprado',
            `Se descontarán ${formatCurrencyShort(goal.savedAmount)} de ${account.name} y quedará en tu historial.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar', onPress: async () => {
                        const result = await addTransaction({
                            type: 'expense', amount: goal.savedAmount, reason: goal.name, category: 'goal', accountId: account.id,
                        });
                        if (result?.error) { Alert.alert('No se pudo', result.error); return; }
                        await deleteSavingsGoal(goal.id, { returnFunds: false });
                    }
                },
            ]
        );
    };

    const liveGoal = goalTarget ? savingsGoals.find((g) => g.id === goalTarget.id) : null;
    const liveApartado = apartadoTarget ? savingsAccounts.find((s) => s.id === apartadoTarget.id) : null;

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Ahorros"
                    subtitle={`${savingsGoals.length} ${savingsGoals.length === 1 ? 'objetivo' : 'objetivos'} en ${moneyAccounts.length} ${moneyAccounts.length === 1 ? 'lugar' : 'lugares'}`}
                />

                {/* ── Todo tu dinero ── */}
                <GlassCard style={styles.totalCard}>
                    <View style={styles.totalHead}>
                        <View>
                            <Text style={styles.totalLabel}>Todo tu dinero</Text>
                            <Money value={totalMoney} size={FontSize.hero - 4} />
                        </View>
                        {savingsAccounts.length > 0 && (
                            <View style={styles.segment} accessibilityRole="tablist">
                                {[['general', 'General'], ['detalle', 'Detalle']].map(([key, label]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[styles.segmentBtn, breakdown === key && styles.segmentBtnOn]}
                                        onPress={() => setBreakdown(key)}
                                        accessibilityRole="tab"
                                        accessibilityState={{ selected: breakdown === key }}
                                    >
                                        <Text style={[styles.segmentText, breakdown === key && styles.segmentTextOn]}>{label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {totalMoney > 0 && (
                        <>
                            <View style={styles.splitBar}>
                                {moneyAccounts.map((a) => a.balance > 0 && (
                                    <View key={a.id} style={{ flex: a.balance, backgroundColor: accountColor(a, theme) }} />
                                ))}
                            </View>

                            {moneyAccounts.map((a) => {
                                const mine = savingsAccounts.filter((s) => s.linkedAccountId === a.id);
                                const free = getFreeRoom(a.id);
                                return (
                                    <View key={a.id} style={styles.acctBlock}>
                                        <View style={styles.acctRow}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 }}>
                                                <View style={[styles.legendDot, { backgroundColor: accountColor(a, theme) }]} />
                                                <Text style={styles.acctName} numberOfLines={1}>{a.name}</Text>
                                            </View>
                                            <Money value={a.balance} size={FontSize.sm} color={theme.ink} decimals={false} />
                                            <Text style={styles.acctPct}>{Math.round((a.balance / totalMoney) * 100)}%</Text>
                                        </View>
                                        {breakdown === 'detalle' && mine.length > 0 && (
                                            <View style={styles.acctChildren}>
                                                {mine.map((s) => (
                                                    <TouchableOpacity key={s.id} style={styles.acctChild} onPress={() => setApartadoTarget(s)} accessibilityRole="button" accessibilityLabel={`Apartado ${s.name}`}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 }}>
                                                            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                                                            <Text style={styles.acctChildName} numberOfLines={1}>{s.name}</Text>
                                                            {s.interest?.enabled && <Text style={styles.acctChip}>{s.interest.rate}%</Text>}
                                                        </View>
                                                        <Money value={s.earmarkedAmount} size={FontSize.xs + 1} color={theme.inkMid} decimals={false} />
                                                    </TouchableOpacity>
                                                ))}
                                                <View style={styles.acctChild}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 }}>
                                                        <View style={[styles.legendDot, styles.legendDotFree]} />
                                                        <Text style={styles.acctChildName}>Sin apartar</Text>
                                                    </View>
                                                    <Money value={free} size={FontSize.xs + 1} color={theme.inkDim} decimals={false} />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </>
                    )}

                    {totalAtRisk > 0 && (
                        <View style={styles.riskRow}>
                            <IconWarningTriangle color={theme.moneyOut} size={13} />
                            <Text style={styles.riskText}>
                                {formatCurrencyShort(totalAtRisk)} en riesgo — alguna tarjeta tiene menos saldo del que reclaman sus apartados y objetivos
                            </Text>
                        </View>
                    )}
                </GlassCard>

                {/* ── Objetivos ── */}
                <View style={styles.section}>
                    {/* El encabezado de la lista ES el total: "Ahorro $X" y su
                        desglose debajo. Sin tarjeta propia: pesa lo que dice. */}
                    <View style={styles.goalsHead}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={styles.goalsHeadLabel}>Ahorro</Text>
                            <View style={styles.goalsHeadRow}>
                                <Money value={totalSaved} size={FontSize.xl} color={theme.ink} decimals={false} />
                                {savingsGoals.length > 0 && (
                                    <Text style={styles.goalsHeadSub} numberOfLines={1}>
                                        {' · '}{savingsGoals.length} {savingsGoals.length === 1 ? 'objetivo' : 'objetivos'}
                                        {' · '}<Text style={styles.savedStrong}>{savedPct}%</Text>
                                    </Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setShowAddGoal(true)} accessibilityRole="button" hitSlop={8}>
                            <Text style={styles.goalsHeadAction}>+ Nuevo</Text>
                        </TouchableOpacity>
                    </View>
                    {savingsGoals.length === 0 ? (
                        <EmptyState
                            icon={IconGoal}
                            title="Sin objetivos"
                            description="Un enganche, un viaje, un fondo de emergencia — dile a una parte de tu dinero para qué es."
                            actionLabel="Crear objetivo"
                            onAction={() => setShowAddGoal(true)}
                        />
                    ) : (
                        <GlassCard style={styles.accountsGroup}>
                            {savingsGoals.map((goal, i) => (
                                <GoalRow
                                    key={goal.id}
                                    goal={goal}
                                    accounts={accounts}
                                    savingsAccounts={savingsAccounts}
                                    getMonthlySuggestion={getMonthlySuggestion}
                                    getGoalRisk={getGoalRisk}
                                    last={i === savingsGoals.length - 1}
                                    onPress={() => setGoalTarget(goal)}
                                />
                            ))}
                        </GlassCard>
                    )}
                </View>

                <View style={{ height: Spacing.xl + Spacing.lg }} />
            </ScrollView>

            {showAddGoal && (
                <AddGoalSheet
                    onClose={() => setShowAddGoal(false)}
                    accounts={accounts}
                    savingsAccounts={savingsAccounts}
                    getPlaceFree={getPlaceFree}
                />
            )}
            {liveGoal && (
                <GoalSheet
                    onClose={() => setGoalTarget(null)}
                    goal={liveGoal}
                    accounts={accounts}
                    savingsAccounts={savingsAccounts}
                    getPlaceFree={getPlaceFree}
                    getMonthlySuggestion={getMonthlySuggestion}
                    getGoalRisk={getGoalRisk}
                    onRedeem={handleRedeemGoal}
                    onDelete={() => deleteSavingsGoal(liveGoal.id)}
                    onOpenApartado={(sa) => { setGoalTarget(null); setApartadoTarget(sa); }}
                />
            )}
            {liveApartado && (() => {
                const acc = liveApartado;
                const goalsHere = savingsGoals.filter((g) => g.savingsAccountId === acc.id);
                const committed = round2(goalsHere.reduce((s, g) => s + g.savedAmount, 0));
                const linked = accounts.find((a) => a.id === acc.linkedAccountId);
                return (
                    <ApartadoSheet
                        onClose={() => setApartadoTarget(null)}
                        savingsAccount={acc}
                        atRisk={getSavingsAccountRisk(acc.id).atRisk}
                        backing={{ free: getApartadoFree(acc.id), committed, total: acc.earmarkedAmount }}
                        destinos={goalsHere.map((g) => ({ goal: g, amount: g.savedAmount }))}
                        linkedAccount={linked}
                        linkedFree={linked ? getFreeRoom(linked.id) : 0}
                        onOpenGoal={(goal) => { setApartadoTarget(null); setGoalTarget(goal); }}
                        onDeposit={() => { setApartadoTarget(null); setMoveMoneyTarget({ account: acc, mode: 'deposit' }); }}
                        onWithdraw={() => { setApartadoTarget(null); setMoveMoneyTarget({ account: acc, mode: 'withdraw' }); }}
                        onInterest={() => { setApartadoTarget(null); setEditInterestTarget(acc); }}
                        onDelete={() => { setApartadoTarget(null); handleDeleteApartado(acc); }}
                    />
                );
            })()}
            {moveMoneyTarget && (
                <MoveMoneySheet
                    onClose={() => setMoveMoneyTarget(null)}
                    savingsAccount={moveMoneyTarget.account}
                    getFreeRoom={getFreeRoom}
                    getApartadoFree={getApartadoFree}
                    mode={moveMoneyTarget.mode}
                />
            )}
            {editInterestTarget && (
                <EditInterestSheet onClose={() => setEditInterestTarget(null)} savingsAccount={editInterestTarget} />
            )}
        </View>
    );
}