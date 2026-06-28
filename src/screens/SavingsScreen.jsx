// Savings tab — breakdown of where your savings live + goals tracker
import { useState } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, Alert, Modal, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useFinance } from "../store/FinanceContext";
import { SAVINGS_COLORS } from "../store/useSavings";
import { formatCurrency, formatCurrencyShort } from "../utils";
import { Colors, Spacing } from "../constants";
import styles from './SavingsScreen.styles';

// Color picker
function ColorPicker({ selected, onSelect }) {
    return (
        <View style={styles.colorRow}>
            {SAVINGS_COLORS.map(c => (
                <TouchableOpacity
                    key={c}
                    style={[styles.colorDot, { backgroundColor: c }, selected === c && styles.colorDotActive]}
                    onPress={() => onSelect(c)}
                />
            ))}
        </View>
    );
}

// Small colored circle used in account cards and chips
function AccountDot({ color, size = 40 }) {
    return (
        <View style={[styles.accountDot, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />
    );
}

// Modal to add a new Savings Acc
function AddAccountModal({ visible, onClose, generalAccounts }) {
    const { addSavingsAccount, depositToSavingsAccount } = useFinance();
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
        // addSavingsAccount now returns the new account AND the already-updated list
        const { newAcc, updatedAccounts } = await addSavingsAccount({ name: name.trim(), color, initialBalance: 0 });
        if (balance > 0 && newAcc?.id) {
            // Pass updatedAccounts so depositToSavingsAccount doesn't read stale state
            await depositToSavingsAccount({
                fromAccountId,
                toSavingsAccountId: newAcc.id,
                amount: balance,
                currentAccounts: updatedAccounts,
            });
        }
        setLoading(false);
        reset();
        onClose();
    };

    const hasBalance = parseFloat(initialBalance) > 0;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.sheet}>
                    <Text style={styles.sheetTitle}>Nueva cuenta de ahorro</Text>

                    {/* Preview */}
                    <View style={styles.accountPreview}>
                        <AccountDot color={color} size={48} />
                        <Text style={styles.accountPreviewName}>{name || 'Nombre de la cuenta'}</Text>
                    </View>

                    <Text style={styles.sheetLabel}>COLOR</Text>
                    <ColorPicker selected={color} onSelect={setColor} />

                    <Text style={styles.sheetLabel}>NOMBRE</Text>
                    <TextInput
                        style={styles.sheetInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. Cajita Nu, Apartado BBVA..."
                        placeholderTextColor={Colors.muted}
                    />

                    <Text style={styles.sheetLabel}>SALDO INICIAL (opcional)</Text>
                    <TextInput
                        style={styles.sheetInput}
                        value={initialBalance}
                        onChangeText={setInitialBalance}
                        placeholder="$0.00"
                        placeholderTextColor={Colors.muted}
                        keyboardType="decimal-pad"
                    />

                    {parseFloat(initialBalance) > 0 && (
                        <>
                            <Text style={styles.sheetLabel}>DESCONTAR DE</Text>
                            <View style={styles.accountPickerRow}>
                                {generalAccounts.filter(a => a.type !== 'savings').map(a => (
                                    <TouchableOpacity
                                        key={a.id}
                                        style={[styles.accountChip, fromAccountId === a.id && styles.accountChipActive]}
                                        onPress={() => setFromAccountId(a.id)}
                                    >
                                        <Text style={[styles.accountChipText, fromAccountId === a.id && styles.accountChipTextActive]}>
                                            {a.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmBtn, (!name.trim() || loading) && styles.confirmBtnDisabled]}
                            onPress={handleAdd}
                            disabled={!name.trim() || loading}
                        >
                            <Text style={styles.confirmBtnText}>{loading ? 'Creando...' : 'Crear cuenta'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Move money from / to a savings account
function MoveMoneyModal({ visible, onClose, savingsAccount, generalAccounts, mode }) {
    const { depositToSavingsAccount, withdrawFromSavingsAccount } = useFinance();
    const [amount, setAmount] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState(
        generalAccounts.find(a => a.type !== 'savings')?.id || ''
    );
    const isDeposit = mode === 'deposit';

    const handleConfirm = async () => {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) return;
        const result = isDeposit
            ? await depositToSavingsAccount({
                fromAccountId: selectedAccountId,
                toSavingsAccountId: savingsAccount.id,
                amount: amt,
            })
            : await withdrawFromSavingsAccount({
                fromSavingsAccountId: savingsAccount.id,
                toAccountId: selectedAccountId,
                amount: amt,
            });
        if (result?.error) { Alert.alert('Error', result.error); return; }
        setAmount('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.sheet}>
                    <View style={styles.sheetTitleRow}>
                        <AccountDot color={savingsAccount?.color} size={32} />
                        <Text style={styles.sheetTitle}>{isDeposit ? 'Mover a' : 'Retirar de'} {savingsAccount?.name}</Text>
                    </View>

                    <Text style={styles.sheetLabel}>CANTIDAD</Text>
                    <TextInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="$0.00"
                        placeholderTextColor={Colors.muted}
                        keyboardType="decimal-pad"
                        autoFocus
                    />

                    <Text style={styles.sheetLabel}>{isDeposit ? 'DE QUÉ CUENTA' : 'A QUÉ CUENTA'}</Text>
                    <View style={styles.accountPickerRow}>
                        {generalAccounts.filter(a => a.type !== 'savings').map(a => (
                            <TouchableOpacity
                                key={a.id}
                                style={[styles.accountChip, selectedAccountId === a.id && styles.accountChipActive]}
                                onPress={() => setSelectedAccountId(a.id)}
                            >
                                <Text style={[styles.accountChipText, selectedAccountId === a.id && styles.accountChipTextActive]}>
                                    {a.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAmount(''); onClose(); }}>
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmBtn, (!amount || parseFloat(amount) <= 0) && styles.confirmBtnDisabled]}
                            onPress={handleConfirm}
                            disabled={!amount || parseFloat(amount) <= 0}
                        >
                            <Text style={styles.confirmBtnText}>{isDeposit ? 'Mover →' : 'Retirar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Add new Goal modal
function AddGoalModal({ visible, onClose }) {
    const { addSavingsGoal } = useFinance();
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
                <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
                    <View style={styles.sheet}>
                        <Text style={styles.sheetTitle}>Nuevo objetivo</Text>

                        <Text style={styles.sheetLabel}>¿QUÉ QUIERES?</Text>
                        <TextInput
                            style={styles.sheetInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ej. AirPods 4, Viaje NYC..."
                            placeholderTextColor={Colors.muted}
                        />

                        <Text style={styles.sheetLabel}>¿CUÁNTO CUESTA?</Text>
                        <TextInput
                            style={[styles.sheetInput, styles.sheetInputLarge]}
                            value={targetAmount}
                            onChangeText={setTargetAmount}
                            placeholder="$0.00"
                            placeholderTextColor={Colors.muted}
                            keyboardType="decimal-pad"
                        />

                        <TouchableOpacity style={styles.toggleDeadline} onPress={() => setHasDeadline(!hasDeadline)}>
                            <View style={[styles.checkbox, hasDeadline && styles.checkboxActive]}>
                                {hasDeadline && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.toggleDeadlineText}>Establecer fecha límite</Text>
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
                                        placeholderTextColor={Colors.muted}
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
                                        placeholderTextColor={Colors.muted}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.sheetBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, !canSave && styles.confirmBtnDisabled]}
                                onPress={handleAdd}
                                disabled={!canSave}
                            >
                                <Text style={styles.confirmBtnText}>Crear objetivo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Add / Withdraw from a Goal
function GoalContributeModal({ visible, onClose, goal, savingsAccounts, mode }) {
    const { contributeToGoal, withdrawFromGoal } = useFinance();
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
                <View style={styles.sheet}>
                    <Text style={styles.sheetTitle}>{isDeposit ? 'Aportar al objetivo' : 'Retirar del objetivo'}</Text>
                    <Text style={styles.sheetSubtitle}>{goal?.name}</Text>

                    <Text style={styles.sheetLabel}>CANTIDAD</Text>
                    <TextInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="$0.00"
                        placeholderTextColor={Colors.muted}
                        keyboardType="decimal-pad"
                        autoFocus
                    />

                    <Text style={styles.sheetLabel}>{isDeposit ? 'DESDE QUÉ CUENTA' : 'REGRESAR A'}</Text>
                    {savingsAccounts.length === 0 ? (
                        <Text style={styles.noAccountsText}>Primero agrega una cuenta de ahorro</Text>
                    ) : (
                        <View style={styles.accountPickerRow}>
                            {savingsAccounts.map(a => (
                                <TouchableOpacity
                                    key={a.id}
                                    style={[styles.accountChip, selectedAccId === a.id && styles.accountChipActive]}
                                    onPress={() => setSelectedAccId(a.id)}
                                >
                                    <View style={[styles.accountChipDot, { backgroundColor: a.color }]} />
                                    <Text style={[styles.accountChipText, selectedAccId === a.id && styles.accountChipTextActive]}>
                                        {a.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAmount(''); onClose(); }}>
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmBtn, (!amount || !selectedAccId) && styles.confirmBtnDisabled]}
                            onPress={handleConfirm}
                            disabled={!amount || !selectedAccId}
                        >
                            <Text style={styles.confirmBtnText}>{isDeposit ? 'Aportar' : 'Retirar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Goal card
function GoalCard({ goal, savingsAccounts, onDelete, getMonthlySuggestion }) {
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
            <View style={styles.goalCardHeader}>
                <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    {goal.deadline && (
                        <Text style={styles.goalDeadline}>
                            {format(parseISO(goal.deadline), "MMMM 'de' yyyy", { locale: es })}
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={handleDelete} style={styles.goalDeleteBtn}>
                    <Text style={styles.goalDeleteText}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.progressBarBg}>
                <View style={[
                    styles.progressBarFill,
                    { width: `${percentage}%` },
                    isComplete && styles.progressBarFillComplete,
                ]} />
            </View>

            <View style={styles.goalAmounts}>
                <Text style={styles.goalSaved}>{formatCurrencyShort(goal.savedAmount)}</Text>
                <Text style={styles.goalPercentage}>{percentage}%</Text>
                <Text style={styles.goalTarget}>{formatCurrencyShort(goal.targetAmount)}</Text>
            </View>

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

            <GoalContributeModal
                visible={showContribute}
                onClose={() => setShowContribute(false)}
                goal={goal}
                savingsAccounts={savingsAccounts}
                mode="deposit"
            />
            <GoalContributeModal
                visible={showWithdraw}
                onClose={() => setShowWithdraw(false)}
                goal={goal}
                savingsAccounts={savingsAccounts}
                mode="withdraw"
            />
        </View>
    );
}

// Main screen
export default function SavingsScreen() {
    const {
        accounts,
        savingsAccounts,
        savingsGoals,
        savingsBreakdownTotal,
        deleteSavingsAccount,
        deleteSavingsGoal,
        getMonthlySuggestion,
    } = useFinance();

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
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.headerLabel}>Total en ahorros</Text>
                    <Text style={styles.headerAmount}>{formatCurrency(mainSavingsBalance)}</Text>
                </View>

                {/* Savings accounts breakdown */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mis cuentas</Text>
                        <TouchableOpacity onPress={() => setShowAddAccount(true)}>
                            <Text style={styles.sectionAction}>+ Nueva</Text>
                        </TouchableOpacity>
                    </View>

                    {savingsAccounts.length === 0 ? (
                        <TouchableOpacity style={styles.emptyCard} onPress={() => setShowAddAccount(true)}>
                            <Text style={styles.emptyCardText}>+ Agrega tu primera cuenta de ahorro</Text>
                            <Text style={styles.emptyCardSub}>Cajita Nu, apartado BBVA, etc.</Text>
                        </TouchableOpacity>
                    ) : (
                        savingsAccounts.map(acc => (
                            <View key={acc.id} style={styles.accountCard}>
                                <View style={styles.accountCardLeft}>
                                    <View style={[styles.accountDot, { backgroundColor: acc.color, width: 40, height: 40, borderRadius: 20 }]} />
                                    <View>
                                        <Text style={styles.accountCardName}>{acc.name}</Text>
                                        <Text style={styles.accountCardBalance}>{formatCurrency(acc.balance)}</Text>
                                    </View>
                                </View>
                                <View style={styles.accountCardRight}>
                                    <TouchableOpacity
                                        style={styles.accountActionBtn}
                                        onPress={() => setMoveMoneyTarget({ account: acc, mode: 'deposit' })}
                                    >
                                        <Text style={styles.accountActionBtnText}>+</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.accountActionBtn}
                                        onPress={() => setMoveMoneyTarget({ account: acc, mode: 'withdraw' })}
                                    >
                                        <Text style={styles.accountActionBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteAccount(acc)}>
                                        <Text style={styles.accountDeleteText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Goals */}
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

                <View style={{ height: Spacing.xl }} />
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
        </SafeAreaView>
    );
}