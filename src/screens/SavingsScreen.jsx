// Savings tab — breakdown of where your savings live + goals tracker
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
import { Spacing } from "../constants";
import createSavingsStyles from './SavingsScreen.styles';

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

// New account modal
function AddAccountModal({ visible, onClose, generalAccounts }) {
    const { addSavingsAccount, depositToSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [color, setColor] = useState(SAVINGS_COLORS[0]);
    const [initialBalance, setInitialBalance] = useState('');
    const [fromAccountId, setFromAccountId] = useState(
        generalAccounts.find(a => a.type !== 'savings')?.id || '1'
    );
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setName(''); setColor(SAVINGS_COLORS[0]); setInitialBalance('');
        setFromAccountId(generalAccounts.find(a => a.type !== 'savings')?.id || '1');
    };

    const handleAdd = async () => {
        if (!name.trim() || loading) return;
        setLoading(true);
        const balance = parseFloat(initialBalance) || 0;
        const { newAcc, updatedAccounts } = await addSavingsAccount({ name: name.trim(), color, initialBalance: 0 });
        if (balance > 0 && newAcc?.id) {
            await depositToSavingsAccount({
                fromAccountId, toSavingsAccountId: newAcc.id,
                amount: balance, currentAccounts: updatedAccounts,
            });
        }
        setLoading(false);
        reset();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Sheet>
                    <Text style={styles.sheetTitle}>Nueva cuenta</Text>

                    {/* Live preview */}
                    <View style={styles.accountPreview}>
                        <AccountDot color={color} size={44} />
                        <Text style={styles.accountPreviewName} numberOfLines={1}>
                            {name || 'Nombre de la cuenta'}
                        </Text>
                    </View>

                    <Text style={styles.sheetLabel}>COLOR</Text>
                    <ColorPicker selected={color} onSelect={setColor} />

                    <Text style={styles.sheetLabel}>NOMBRE</Text>
                    <TextInput
                        style={styles.sheetInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. Cajita Nu, Apartado BBVA..."
                        placeholderTextColor={theme.muted}
                    />

                    <Text style={styles.sheetLabel}>SALDO INICIAL (opcional)</Text>
                    <TextInput
                        style={styles.sheetInput}
                        value={initialBalance}
                        onChangeText={setInitialBalance}
                        placeholder="$0.00"
                        placeholderTextColor={theme.muted}
                        keyboardType="decimal-pad"
                    />

                    {parseFloat(initialBalance) > 0 && (
                        <>
                            <Text style={styles.sheetLabel}>DESCONTAR DE</Text>
                            <View style={styles.chipRow}>
                                {generalAccounts.filter(a => a.type !== 'savings').map(a => (
                                    <TouchableOpacity
                                        key={a.id}
                                        style={[styles.chip, fromAccountId === a.id && styles.chipActive]}
                                        onPress={() => setFromAccountId(a.id)}
                                    >
                                        <Text style={[styles.chipText, fromAccountId === a.id && styles.chipTextActive]}>
                                            {a.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={() => { reset(); onClose(); }}>
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, (!name.trim() || loading) && styles.btnDisabled]}
                            onPress={handleAdd}
                            disabled={!name.trim() || loading}
                        >
                            <Text style={styles.btnPrimaryText}>{loading ? 'Creando...' : 'Crear cuenta'}</Text>
                        </TouchableOpacity>
                    </View>
                </Sheet>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Move money modal
function MoveMoneyModal({ visible, onClose, savingsAccount, generalAccounts, mode }) {
    const { depositToSavingsAccount, withdrawFromSavingsAccount } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [amount, setAmount] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState(
        generalAccounts.find(a => a.type !== 'savings')?.id || ''
    );
    const isDeposit = mode === 'deposit';

    const handleConfirm = async () => {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) return;
        const result = isDeposit
            ? await depositToSavingsAccount({ fromAccountId: selectedAccountId, toSavingsAccountId: savingsAccount.id, amount: amt })
            : await withdrawFromSavingsAccount({ fromSavingsAccountId: savingsAccount.id, toAccountId: selectedAccountId, amount: amt });
        if (result?.error) { Alert.alert('Error', result.error); return; }
        setAmount('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Sheet>
                    {/* Account dot + title */}
                    <View style={styles.sheetTitleRow}>
                        <AccountDot color={savingsAccount?.color} size={28} />
                        <Text style={styles.sheetTitle}>
                            {isDeposit ? 'Mover a' : 'Retirar de'} {savingsAccount?.name}
                        </Text>
                    </View>

                    <Text style={styles.sheetLabel}>CANTIDAD</Text>
                    <TextInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.muted}
                        keyboardType="decimal-pad"
                        autoFocus
                    />

                    <Text style={styles.sheetLabel}>{isDeposit ? 'DE QUÉ CUENTA' : 'A QUÉ CUENTA'}</Text>
                    <View style={styles.chipRow}>
                        {generalAccounts.filter(a => a.type !== 'savings').map(a => (
                            <TouchableOpacity
                                key={a.id}
                                style={[styles.chip, selectedAccountId === a.id && styles.chipActive]}
                                onPress={() => setSelectedAccountId(a.id)}
                            >
                                <Text style={[styles.chipText, selectedAccountId === a.id && styles.chipTextActive]}>
                                    {a.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={() => { setAmount(''); onClose(); }}>
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, (!amount || parseFloat(amount) <= 0) && styles.btnDisabled]}
                            onPress={handleConfirm}
                            disabled={!amount || parseFloat(amount) <= 0}
                        >
                            <Text style={styles.btnPrimaryText}>{isDeposit ? 'Mover' : 'Retirar'}</Text>
                        </TouchableOpacity>
                    </View>
                </Sheet>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// New Goal modal
function AddGoalModal({ visible, onClose }) {
    const { addSavingsGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [hasDeadline, setHasDeadline] = useState(false);
    const [deadlineMonth, setDeadlineMonth] = useState('');
    const [deadlineYear, setDeadlineYear] = useState('');

    const reset = () => {
        setName(''); setTargetAmount('');
        setHasDeadline(false); setDeadlineMonth(''); setDeadlineYear('');
    };

    const handleAdd = async () => {
        if (!name.trim() || !parseFloat(targetAmount)) return;
        const deadline = (hasDeadline && deadlineMonth && deadlineYear)
            ? new Date(parseInt(deadlineYear), parseInt(deadlineMonth) - 1, 1).toISOString()
            : null;
        await addSavingsGoal({ name: name.trim(), targetAmount: parseFloat(targetAmount), deadline });
        reset();
        onClose();
    };

    const canSave = name.trim() && parseFloat(targetAmount) > 0 &&
        (!hasDeadline || (deadlineMonth && deadlineYear));

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
                    <TextInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.muted}
                        keyboardType="decimal-pad"
                    />

                    <TouchableOpacity style={styles.toggle} onPress={() => setHasDeadline(!hasDeadline)}>
                        <View style={[styles.checkbox, hasDeadline && styles.checkboxActive]}>
                            {hasDeadline && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.toggleText}>Establecer fecha límite</Text>
                    </TouchableOpacity>

                    {hasDeadline && (
                        <View style={styles.dateRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sheetLabel}>MES</Text>
                                <TextInput
                                    style={styles.sheetInput}
                                    value={deadlineMonth}
                                    onChangeText={setDeadlineMonth}
                                    placeholder="1-12"
                                    placeholderTextColor={theme.muted}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sheetLabel}>AÑO</Text>
                                <TextInput
                                    style={styles.sheetInput}
                                    value={deadlineYear}
                                    onChangeText={setDeadlineYear}
                                    placeholder="2026"
                                    placeholderTextColor={theme.muted}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />
                            </View>
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

// Contribute to a Goal
function GoalContributeModal({ visible, onClose, goal, savingsAccounts, mode }) {
    const { contributeToGoal, withdrawFromGoal } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [amount, setAmount] = useState('');
    const [selectedAccId, setSelectedAccId] = useState(savingsAccounts[0]?.id || '');
    const isDeposit = mode === 'deposit';

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
                    <TextInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="$0.00"
                        placeholderTextColor={theme.muted}
                        keyboardType="decimal-pad"
                        autoFocus
                    />

                    <Text style={styles.sheetLabel}>{isDeposit ? 'DESDE QUÉ CUENTA' : 'REGRESAR A'}</Text>
                    {savingsAccounts.length === 0 ? (
                        <Text style={styles.emptyChipText}>Primero agrega una cuenta de ahorro</Text>
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
                                        {a.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
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
function GoalCard({ goal, savingsAccounts, onDelete, getMonthlySuggestion }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);
    const [showContribute, setShowContribute] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);

    const percentage = goal.targetAmount > 0
        ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
        : 0;
    const isComplete = percentage >= 100;
    const suggestion = getMonthlySuggestion(goal);

    const handleDelete = () => {
        Alert.alert(
            'Eliminar objetivo',
            goal.savedAmount > 0
                ? `Este objetivo tiene ${formatCurrencyShort(goal.savedAmount)} aportados. Al eliminarlo, el dinero regresa a las cuentas de ahorro.`
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
                    <Text style={styles.goalDeleteText}>✕</Text>
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
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSavingsStyles(theme), [theme]);

    const insets = useSafeAreaInsets();
    const mainSavingsBalance = accounts.find(a => a.type === 'savings')?.balance ?? 0;

    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [moveMoneyTarget, setMoveMoneyTarget] = useState(null);

    const handleDeleteAccount = (acc) => {
        Alert.alert(
            'Eliminar cuenta',
            acc.balance > 0
                ? `Esta cuenta tiene ${formatCurrencyShort(acc.balance)}. Retira el saldo antes de eliminarla.`
                : `¿Eliminar "${acc.name}"?`,
            acc.balance > 0
                ? [{ text: 'Entendido' }]
                : [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: () => deleteSavingsAccount(acc.id) },
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
                    <Text style={styles.heroAmount}>{formatCurrency(mainSavingsBalance)}</Text>
                </View>

                {/* ── Mis cuentas ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mis cuentas</Text>
                        <TouchableOpacity onPress={() => setShowAddAccount(true)}>
                            <Text style={styles.sectionAction}>+ Nueva</Text>
                        </TouchableOpacity>
                    </View>

                    {savingsAccounts.length === 0 ? (
                        <TouchableOpacity style={styles.emptyCard} onPress={() => setShowAddAccount(true)}>
                            <Text style={styles.emptyCardText}>+ Agrega tu primera cuenta</Text>
                            <Text style={styles.emptyCardSub}>Cajita Nu, apartado BBVA, etc.</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.accountsGroup}>
                            {savingsAccounts.map((acc, i) => (
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
                                        <Text style={styles.accountBalance}>{formatCurrency(acc.balance)}</Text>
                                    </View>
                                    <View style={styles.accountActions}>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => setMoveMoneyTarget({ account: acc, mode: 'deposit' })}
                                        >
                                            <Text style={styles.actionBtnText}>+</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => setMoveMoneyTarget({ account: acc, mode: 'withdraw' })}
                                        >
                                            <Text style={styles.actionBtnText}>−</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteAccount(acc)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Text style={styles.deleteText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
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
                                getMonthlySuggestion={getMonthlySuggestion}
                            />
                        ))
                    )}
                </View>

                <View style={{ height: Spacing.xl + Spacing.lg }} />
            </ScrollView>

            <AddAccountModal
                visible={showAddAccount}
                onClose={() => setShowAddAccount(false)}
                generalAccounts={accounts}
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
                    generalAccounts={accounts}
                    mode={moveMoneyTarget.mode}
                />
            )}
        </View>
    );
}