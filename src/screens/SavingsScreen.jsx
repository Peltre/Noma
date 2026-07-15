// Savings tab — apartados linked to real débito/efectivo accounts,
// and goals funded from one or several of them. See useSavings.js for
// the full model: nothing here ever moves real money except the
// "Marcar como comprado" redeem flow, which is the one place a goal
// actually spends for real.
import { useMemo, useState } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, Alert, Modal, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";
import { SAVINGS_COLORS } from "../store/useSavings";
import { formatCurrency, formatCurrencyShort } from "../utils";
import { round2 } from "../utils/formatCurrency";
import { Spacing } from "../constants";
import createSavingsStyles from './SavingsScreen.styles';
import DecimalInput from '../components/DecimalInput';
import DatePickerField from '../components/DatePickerField';
import { IconCheck, IconClose, IconWarningTriangle, IconPlus, IconMinus } from '../components/Icons';

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
            {SAVINGS_COLORS.map(c => (
                <TouchableOpacity
                    key={c}
                    style={[styles.colorDot, { backgroundColor: c },
                    selected === c && styles.colorDotActive]}
                    onPress={() => onSelect(c)}
                />
            ))}
        </View>
    );
}

// Colored circle dot used in cards and chips
function AccountDot({ color, size = 40 }) {
    return (
        <View style={{
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: color,
        }} />
    );
}

// Sheet wrapper
function Sheet({ children, scroll = false }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    if (scroll) {
        return (
            <View style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {children}
                </ScrollView>
            </View>
        );
    }
    return (
        <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {children}
        </View>
    );
}

// Pick which real débito/efectivo account an apartado is linked to.
// Shows how much of each is currently free, so the choice already
// carries the info that decides how much can be earmarked.
function AccountPicker({ accounts, selectedId, onSelect, getFreeRoom }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const linkable = accounts.filter(a => LINKABLE_TYPES.includes(a.type));

    if (linkable.length === 0) {
        return <Text style={styles.emptyChipText}>Primero agrega una cuenta de débito en Tarjetas</Text>;
    }
    return (
        <View style={styles.chipRow}>
            {linkable.map(a => (
                <TouchableOpacity
                    key={a.id}
                    style={[styles.chip, selectedId === a.id && styles.chipActive]}
                    onPress={() => onSelect(a.id)}
                >
                    {a.color && <View style={[styles.chipDot, { backgroundColor: a.color }]} />}
                    <Text style={[styles.chipText, selectedId === a.id && styles.chipTextActive]}>
                        {a.name} · {formatCurrencyShort(getFreeRoom(a.id))} libres
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// New apartado modal
function AddApartadoModal({ visible, onClose, accounts, getFreeRoom }) {
    const { addSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [color, setColor] = useState(SAVINGS_COLORS[0]);
    const [linkedAccountId, setLinkedAccountId] = useState(null);
    const [initialAmount, setInitialAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setName(''); setColor(SAVINGS_COLORS[0]);
        setLinkedAccountId(null); setInitialAmount('');
    };

    const free = linkedAccountId ? getFreeRoom(linkedAccountId) : 0;
    const requested = parseFloat(initialAmount) || 0;
    const exceedsAvailable = linkedAccountId && requested > free;
    const canSave = name.trim() && linkedAccountId && !loading;

    const handleAdd = async () => {
        if (!canSave) return;
        setLoading(true);
        const result = await addSavingsAccount({
            name: name.trim(), color, linkedAccountId, initialAmount: requested,
        });
        setLoading(false);
        if (result?.error) { Alert.alert('No se pudo crear', result.error); return; }
        reset();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Sheet scroll>
                    <Text style={styles.sheetTitle}>Nuevo apartado</Text>

                    {/* Live preview */}
                    <View style={styles.accountPreview}>
                        <AccountDot color={color} size={44} />
                        <Text style={styles.accountPreviewName} numberOfLines={1}>
                            {name || 'Nombre del apartado'}
                        </Text>
                    </View>

                    <Text style={styles.sheetLabel}>COLOR</Text>
                    <ColorPicker selected={color} onSelect={setColor} />

                    <Text style={styles.sheetLabel}>NOMBRE</Text>
                    <TextInput
                        style={styles.sheetInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. Vacaciones, Emergencia..."
                        placeholderTextColor={theme.muted}
                    />

                    <Text style={styles.sheetLabel}>¿DE QUÉ CUENTA SALE?</Text>
                    <AccountPicker
                        accounts={accounts}
                        selectedId={linkedAccountId}
                        onSelect={setLinkedAccountId}
                        getFreeRoom={getFreeRoom}
                    />
                    <Text style={styles.sheetHintSmall}>
                        No mueve el dinero — tu tarjeta sigue mostrando su saldo real completo. Solo reserva parte de él.
                    </Text>

                    {linkedAccountId && (
                        <>
                            <Text style={styles.sheetLabel}>APARTAR AHORA (opcional)</Text>
                            <DecimalInput
                                style={styles.sheetInput}
                                value={initialAmount}
                                onChangeText={setInitialAmount}
                                placeholder="$0.00"
                                placeholderTextColor={theme.muted}
                            />
                            <Text style={[styles.inputHint, exceedsAvailable && { color: theme.moneyOut }]}>
                                {exceedsAvailable
                                    ? `Solo tienes ${formatCurrencyShort(free)} libres en esa cuenta`
                                    : `Disponible ahí: ${formatCurrencyShort(free)}`}
                            </Text>
                        </>
                    )}

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={() => { reset(); onClose(); }}>
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, !canSave && styles.btnDisabled]}
                            onPress={handleAdd}
                            disabled={!canSave}
                        >
                            <Text style={styles.btnPrimaryText}>{loading ? 'Creando...' : 'Crear apartado'}</Text>
                        </TouchableOpacity>
                    </View>
                </Sheet>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Add/remove money from an apartado. Never touches the linked
// account's real balance — only how much of it is claimed.
function MoveMoneyModal({ visible, onClose, savingsAccount, getFreeRoom, mode }) {
    const { addToSavingsAccount, removeFromSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [amount, setAmount] = useState('');
    const isDeposit = mode === 'deposit';
    const free = savingsAccount ? getFreeRoom(savingsAccount.linkedAccountId) : 0;

    const handleConfirm = async () => {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) return;
        const result = isDeposit
            ? await addToSavingsAccount({ savingsAccountId: savingsAccount.id, amount: amt })
            : await removeFromSavingsAccount({ savingsAccountId: savingsAccount.id, amount: amt });
        if (result?.error) { Alert.alert('No se puede', result.error); return; }
        setAmount('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Sheet>
                    <View style={styles.sheetTitleRow}>
                        <AccountDot color={savingsAccount?.color} size={28} />
                        <Text style={styles.sheetTitle}>
                            {isDeposit ? 'Apartar más en' : 'Quitar de'} {savingsAccount?.name}
                        </Text>
                    </View>

                    <Text style={styles.sheetLabel}>CANTIDAD</Text>
                    <DecimalInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.muted}
                        autoFocus
                    />
                    <Text style={styles.inputHint}>
                        {isDeposit
                            ? `Libre en esa cuenta: ${formatCurrencyShort(free)}`
                            : `Apartado actualmente: ${formatCurrencyShort(savingsAccount?.earmarkedAmount ?? 0)}`}
                    </Text>

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={() => { setAmount(''); onClose(); }}>
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, (!amount || parseFloat(amount) <= 0) && styles.btnDisabled]}
                            onPress={handleConfirm}
                            disabled={!amount || parseFloat(amount) <= 0}
                        >
                            <Text style={styles.btnPrimaryText}>{isDeposit ? 'Apartar' : 'Quitar'}</Text>
                        </TouchableOpacity>
                    </View>
                </Sheet>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// New Goal modal — unchanged, a goal itself doesn't know about
// apartados until someone contributes to it.
function AddGoalModal({ visible, onClose }) {
    const { addSavingsGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [hasDeadline, setHasDeadline] = useState(false);
    const [deadline, setDeadline] = useState(null);

    const reset = () => {
        setName(''); setTargetAmount('');
        setHasDeadline(false); setDeadline(null);
    };

    const handleAdd = async () => {
        if (!name.trim() || !parseFloat(targetAmount)) return;
        await addSavingsGoal({
            name: name.trim(),
            targetAmount: parseFloat(targetAmount),
            deadline: (hasDeadline && deadline) ? deadline.toISOString() : null,
        });
        reset();
        onClose();
    };

    const canSave = name.trim() && parseFloat(targetAmount) > 0 &&
        (!hasDeadline || deadline);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Sheet scroll>
                    <Text style={styles.sheetTitle}>Nuevo objetivo</Text>

                    <Text style={styles.sheetLabel}>¿QUÉ QUIERES?</Text>
                    <TextInput
                        style={styles.sheetInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. AirPods 4, Viaje NYC..."
                        placeholderTextColor={theme.muted}
                    />

                    <Text style={styles.sheetLabel}>¿CUÁNTO CUESTA?</Text>
                    <DecimalInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.muted}
                    />

                    <TouchableOpacity style={styles.toggle} onPress={() => setHasDeadline(!hasDeadline)}>
                        <View style={[styles.checkbox, hasDeadline && styles.checkboxActive]}>
                            {hasDeadline && <IconCheck color={theme.brandOn} size={12} />}
                        </View>
                        <Text style={styles.toggleText}>Establecer fecha límite</Text>
                    </TouchableOpacity>

                    {hasDeadline && (
                        <View style={{ marginTop: 4 }}>
                            <Text style={styles.sheetLabel}>FECHA LÍMITE</Text>
                            <DatePickerField
                                value={deadline}
                                onChange={setDeadline}
                                placeholder="Selecciona una fecha"
                                minimumDate={new Date()}
                                displayFormat="MMMM yyyy"
                            />
                        </View>
                    )}

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={() => { reset(); onClose(); }}>
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, !canSave && styles.btnDisabled]}
                            onPress={handleAdd}
                            disabled={!canSave}
                        >
                            <Text style={styles.btnPrimaryText}>Crear objetivo</Text>
                        </TouchableOpacity>
                    </View>
                </Sheet>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Contribute to (or withdraw from) a goal — one apartado at a time.
// To fund a goal from several apartados, just do this more than once;
// each contribution keeps its own source, which is exactly what lets
// the risk calculation trace things back later.
function GoalContributeModal({ visible, onClose, goal, savingsAccounts, mode }) {
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
        if (result?.error) { Alert.alert('Error', result.error); return; }
        setAmount('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Sheet>
                    <Text style={styles.sheetTitle}>
                        {isDeposit ? 'Aportar al objetivo' : 'Retirar del objetivo'}
                    </Text>
                    <Text style={styles.sheetSubtitle}>{goal?.name}</Text>

                    <Text style={styles.sheetLabel}>CANTIDAD</Text>
                    <DecimalInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.muted}
                        autoFocus
                    />

                    {/* The store already blocks an overflowing contribution
                        outright — this is just letting the person see it
                        (and fix it in one tap) before they hit "Aportar"
                        instead of only after. */}
                    {isDeposit && (
                        <TouchableOpacity onPress={() => setAmount(remaining.toFixed(2))}>
                            <Text style={[styles.sheetHint, wouldOverflow && { color: theme.moneyOut, fontWeight: '700' }]}>
                                Faltan {remaining.toFixed(2)} para completarlo — toca para llenar
                            </Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.sheetLabel}>{isDeposit ? 'DESDE QUÉ APARTADO' : 'REGRESAR A'}</Text>
                    {savingsAccounts.length === 0 ? (
                        <Text style={styles.emptyChipText}>Primero crea un apartado</Text>
                    ) : (
                        <View style={styles.chipRow}>
                            {savingsAccounts.map(a => (
                                <TouchableOpacity
                                    key={a.id}
                                    style={[styles.chip, selectedAccId === a.id && styles.chipActive]}
                                    onPress={() => setSelectedAccId(a.id)}
                                >
                                    <View style={[styles.chipDot, { backgroundColor: a.color }]} />
                                    <Text style={[styles.chipText, selectedAccId === a.id && styles.chipTextActive]}>
                                        {a.name} · {formatCurrencyShort(a.earmarkedAmount)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    {isDeposit && (
                        <Text style={styles.sheetHintSmall}>
                            ¿No te alcanza con uno? Aporta lo que tenga, guarda, y repite eligiendo otro apartado.
                        </Text>
                    )}

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={() => { setAmount(''); onClose(); }}>
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, (!amount || !selectedAccId) && styles.btnDisabled]}
                            onPress={handleConfirm}
                            disabled={!amount || !selectedAccId}
                        >
                            <Text style={styles.btnPrimaryText}>{isDeposit ? 'Aportar' : 'Retirar'}</Text>
                        </TouchableOpacity>
                    </View>
                </Sheet>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Goal card
function GoalCard({ goal, savingsAccounts, onDelete, onRedeem, getMonthlySuggestion, getGoalRisk }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [showContribute, setShowContribute] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);

    const percentage = goal.targetAmount > 0
        ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
        : 0;
    // Complete has to come from the real amounts, never from the
    // rounded `percentage` above — that one is only for display.
    // Math.round would flip this to true as early as 99.5% funded
    // (e.g. $995 of a $1,000 goal), which used to let "Marcar como
    // comprado" fire while less money than promised was actually
    // sitting in the source apartados.
    const isComplete = goal.targetAmount > 0 && goal.savedAmount >= goal.targetAmount;
    const suggestion = getMonthlySuggestion(goal);
    const atRisk = getGoalRisk(goal);

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
        <View style={[styles.goalCard, isComplete && styles.goalCardComplete]}>
            {/* Header */}
            <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    {goal.deadline && (
                        <Text style={styles.goalDeadline}>
                            {format(parseISO(goal.deadline), "MMMM 'de' yyyy", { locale: es })}
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <IconClose color={theme.muted} size={13} />
                </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progressBg}>
                <View style={[
                    styles.progressFill,
                    { width: `${percentage}%` },
                    isComplete && styles.progressFillComplete,
                ]} />
            </View>

            <View style={styles.goalAmounts}>
                <Text style={styles.goalSaved}>{formatCurrencyShort(goal.savedAmount)}</Text>
                <Text style={styles.goalPct}>{percentage}%</Text>
                <Text style={styles.goalTarget}>{formatCurrencyShort(goal.targetAmount)}</Text>
            </View>

            {/* Risk warning — one of the apartados feeding this goal has
                less real money behind it than it promised */}
            {atRisk > 0 && (
                <View style={[styles.riskRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs }]}>
                    <IconWarningTriangle color={theme.moneyOut} size={13} />
                    <Text style={styles.riskText}>
                        {formatCurrencyShort(atRisk)} en riesgo — un apartado de origen tiene menos saldo del que prometía
                    </Text>
                </View>
            )}

            {/* Monthly suggestion */}
            {suggestion && !isComplete && (
                <View style={styles.suggestionRow}>
                    <Text style={styles.suggestionText}>
                        Ahorra {formatCurrencyShort(suggestion)}/mes para llegar a tiempo
                    </Text>
                </View>
            )}

            {isComplete && (
                <View style={styles.completeRow}>
                    <Text style={styles.completeText}>Meta alcanzada</Text>
                    <TouchableOpacity style={styles.goalBtnRedeem} onPress={() => onRedeem(goal)}>
                        <Text style={styles.goalBtnRedeemText}>Marcar como comprado</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Actions */}
            {!isComplete && (
                <View style={styles.goalBtns}>
                    <TouchableOpacity style={styles.goalBtnDeposit} onPress={() => setShowContribute(true)}>
                        <Text style={styles.goalBtnDepositText}>+ Aportar</Text>
                    </TouchableOpacity>
                    {goal.savedAmount > 0 && (
                        <TouchableOpacity style={styles.goalBtnWithdraw} onPress={() => setShowWithdraw(true)}>
                            <Text style={styles.goalBtnWithdrawText}>Retirar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <GoalContributeModal visible={showContribute} onClose={() => setShowContribute(false)}
                goal={goal} savingsAccounts={savingsAccounts} mode="deposit" />
            <GoalContributeModal visible={showWithdraw} onClose={() => setShowWithdraw(false)}
                goal={goal} savingsAccounts={savingsAccounts} mode="withdraw" />
        </View>
    );
}

// Main screen
export default function SavingsScreen() {
    const {
        accounts, savingsAccounts, savingsGoals,
        deleteSavingsAccount, deleteSavingsGoal, getMonthlySuggestion,
        addTransaction, getAccountDeficit, getFreeRoom,
        getSavingsAccountRisk, getGoalRisk,
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);

    const insets = useSafeAreaInsets();

    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [moveMoneyTarget, setMoveMoneyTarget] = useState(null);

    // Total ahorros = everything currently earmarked in an apartado +
    // everything currently sitting inside a goal. Never double-counted:
    // contributing to a goal moves the amount OUT of the apartado's
    // own earmarkedAmount, so each peso is counted in exactly one of
    // the two sums below.
    const apartadosTotal = round2(savingsAccounts.reduce((s, a) => s + a.earmarkedAmount, 0));
    const goalsTotal = round2(savingsGoals.reduce((s, g) => s + g.savedAmount, 0));
    const totalSavings = round2(apartadosTotal + goalsTotal);

    const totalAtRisk = round2(
        savingsAccounts.reduce((s, a) => s + getSavingsAccountRisk(a.id).atRisk, 0) +
        savingsGoals.reduce((s, g) => s + getGoalRisk(g), 0)
    );

    const handleDeleteAccount = (acc) => {
        Alert.alert(
            'Eliminar apartado',
            acc.earmarkedAmount > 0
                ? `Este apartado tiene ${formatCurrencyShort(acc.earmarkedAmount)} asignados. Quítaselos antes de eliminarlo.`
                : `¿Eliminar "${acc.name}"?`,
            acc.earmarkedAmount > 0
                ? [{ text: 'Entendido' }]
                : [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: () => deleteSavingsAccount(acc.id) },
                ]
        );
    };

    // Redeem a completed goal: the money actually leaves for real —
    // one real expense transaction per apartado that fed this goal,
    // each charged against THAT apartado's own linked account (a goal
    // funded from two different cards spends from both, same as it
    // would if you paid for something split across two cards). Each
    // addTransaction call already carries its own real-balance check,
    // so if a linked account has since dropped below what its
    // apartado promised, this fails there with a clear error instead
    // of silently spending money that isn't really there.
    const handleRedeemGoal = (goal) => {
        const bySource = {};
        goal.contributions.forEach(c => {
            const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
            if (!key) return;
            const sign = c.type === 'deposit' ? 1 : -1;
            bySource[key] = round2((bySource[key] || 0) + sign * c.amount);
        });
        const sources = Object.entries(bySource)
            .filter(([, amt]) => amt > 0)
            .map(([savingsAccountId, amt]) => ({
                amount: amt,
                sa: savingsAccounts.find(a => a.id === savingsAccountId),
            }));

        // What the confirmation below promises to deduct — the real
        // sum of what's about to be charged, not goal.targetAmount.
        // Sources whose apartado was deleted before redeeming get
        // skipped in the loop further down (nothing left to trace
        // them back to), so they're excluded here too — otherwise
        // the dialog would promise more than what actually gets
        // charged.
        const totalToDeduct = round2(
            sources.filter(s => s.sa).reduce((sum, s) => sum + s.amount, 0)
        );

        Alert.alert(
            'Marcar como comprado',
            `Se descontarán ${formatCurrencyShort(totalToDeduct)} de tus cuentas y quedará registrado en tu historial.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar', onPress: async () => {
                        const warnings = [];
                        for (const source of sources) {
                            if (!source.sa) continue; // its apartado was deleted before redeeming — can't trace where this slice lives anymore
                            const result = await addTransaction({
                                type: 'expense',
                                amount: source.amount,
                                reason: goal.name,
                                category: 'goal',
                                accountId: source.sa.linkedAccountId,
                                creditCardId: null,
                            });
                            if (result?.error) {
                                Alert.alert('No se pudo', `${result.error} (al descontar de ${source.sa.name})`);
                                return;
                            }
                            if (result.savingsWarning) warnings.push(result.savingsWarning);
                        }
                        await deleteSavingsGoal(goal.id, { returnFunds: false });
                        if (warnings.length > 0) {
                            const lines = warnings.map(w => `· ${formatCurrencyShort(w.newlyAtRisk)} en ${w.accountName}`).join('\n');
                            Alert.alert('Comprado — con aviso', `Esta compra también usó fondos de otros apartados en la misma cuenta:\n${lines}`);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Hero ── */}
                <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
                    <View style={styles.heroArc} />
                    <View style={styles.heroDot} />
                    <Text style={styles.heroLabel}>Total en ahorros</Text>
                    <Text style={styles.heroAmount}>{formatCurrency(totalSavings)}</Text>

                    {totalAtRisk > 0 && (
                        <View style={styles.breakdownRow}>
                            <IconWarningTriangle color={theme.moneyOut} size={13} />
                            <Text style={styles.breakdownRisk}>
                                {formatCurrencyShort(totalAtRisk)} en riesgo — alguna cuenta ligada tiene menos saldo del que sus apartados prometen
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── Mis apartados ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mis apartados</Text>
                        <TouchableOpacity onPress={() => setShowAddAccount(true)}>
                            <Text style={styles.sectionAction}>+ Nuevo</Text>
                        </TouchableOpacity>
                    </View>

                    {savingsAccounts.length === 0 ? (
                        <TouchableOpacity style={styles.emptyCard} onPress={() => setShowAddAccount(true)}>
                            <Text style={styles.emptyCardText}>+ Crea tu primer apartado</Text>
                            <Text style={styles.emptyCardSub}>Ligado a una tarjeta que ya tienes</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.accountsGroup}>
                            {savingsAccounts.map((acc, i) => {
                                const linkedAccount = accounts.find(a => a.id === acc.linkedAccountId);
                                const { atRisk } = getSavingsAccountRisk(acc.id);
                                return (
                                    <View
                                        key={acc.id}
                                        style={[
                                            styles.accountRow,
                                            i === savingsAccounts.length - 1 && styles.accountRowLast,
                                        ]}
                                    >
                                        <AccountDot color={acc.color} size={38} />
                                        <View style={styles.accountInfo}>
                                            <Text style={styles.accountName}>{acc.name}</Text>
                                            <Text style={styles.accountLinked} numberOfLines={1}>
                                                {linkedAccount ? `· ${linkedAccount.name}` : '· cuenta eliminada'}
                                            </Text>
                                            <Text style={styles.accountBalance}>{formatCurrency(acc.earmarkedAmount)}</Text>
                                            {atRisk > 0 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                    <IconWarningTriangle color={theme.moneyOut} size={11} />
                                                    <Text style={styles.accountRisk}>
                                                        {formatCurrencyShort(atRisk)} en riesgo
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.accountActions}>
                                            <TouchableOpacity
                                                style={styles.actionBtn}
                                                onPress={() => setMoveMoneyTarget({ account: acc, mode: 'deposit' })}
                                            >
                                                <IconPlus color={theme.brand} size={15} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.actionBtn}
                                                onPress={() => setMoveMoneyTarget({ account: acc, mode: 'withdraw' })}
                                            >
                                                <IconMinus color={theme.brand} size={15} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteAccount(acc)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <IconClose color={theme.muted} size={13} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* ── Objetivos ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Objetivos</Text>
                        <TouchableOpacity onPress={() => setShowAddGoal(true)}>
                            <Text style={styles.sectionAction}>+ Nuevo</Text>
                        </TouchableOpacity>
                    </View>

                    {savingsGoals.length === 0 ? (
                        <TouchableOpacity style={styles.emptyCard} onPress={() => setShowAddGoal(true)}>
                            <Text style={styles.emptyCardText}>+ Crea tu primer objetivo</Text>
                            <Text style={styles.emptyCardSub}>AirPods, viaje, fondo de emergencia...</Text>
                        </TouchableOpacity>
                    ) : (
                        savingsGoals.map(goal => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                savingsAccounts={savingsAccounts}
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

            <AddApartadoModal
                visible={showAddAccount}
                onClose={() => setShowAddAccount(false)}
                accounts={accounts}
                getFreeRoom={getFreeRoom}
            />
            <AddGoalModal
                visible={showAddGoal}
                onClose={() => setShowAddGoal(false)}
            />
            {moveMoneyTarget && (
                <MoveMoneyModal
                    visible={true}
                    onClose={() => setMoveMoneyTarget(null)}
                    savingsAccount={moveMoneyTarget.account}
                    getFreeRoom={getFreeRoom}
                    mode={moveMoneyTarget.mode}
                />
            )}
        </View>
    );
}