// Unified "Tarjetas" screen: débito + crédito as two independent
// decks, each a FocusStack (see components/FocusStack.jsx) — cards
// stacked behind each other, tap a peeking one to bring it to the
// front, tap the front one for full detail. Long-press anywhere for
// a quick Editar/Pagar/Eliminar popover without leaving the screen.
import { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Modal, KeyboardAvoidingView, Platform, Alert, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../utils';
import { Spacing } from '../constants';
import createCardsStyles from './CardsScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import CardFace from '../components/CardFace';
import FocusStack from '../components/FocusStack';
import Svg, { Circle } from 'react-native-svg';
import { IconCard, IconPencil, IconCash, IconTrash, IconChevronDown, IconCardAdd } from '../components/Icons';

// Tiny utilization ring for the Crédito deck's header — how much of
// the combined limit across all credit cards is currently used up.
function MiniRing({ pct, theme }) {
    const size = 22, stroke = 3;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const dash = Math.max(0, Math.min(100, pct)) / 100 * circumference;
    return (
        <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.border} strokeWidth={stroke} fill="none" />
            <Circle
                cx={size / 2} cy={size / 2} r={r}
                stroke={theme.moneyOut} strokeWidth={stroke} fill="none"
                strokeDasharray={`${dash}, ${circumference}`}
                strokeLinecap="round"
                // Start the arc at 12 o'clock instead of svg's default 3 o'clock
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        </Svg>
    );
}

// Shared delete rule (can't delete something that still holds real
// money/debt) — used both here (quick-action popover) and inside
// CardDetailSheet below. Unlike the sheet's disabled button, the
// popover has no obvious "why can't I tap this" affordance, so this
// path explains itself with an alert instead of just refusing.
function promptDeleteCard(card, { deleteAccount, deleteCreditCard }) {
    const isCredit = card.cardType === 'credit';
    const canDelete = isCredit ? card.currentDebt === 0 : card.balance === 0;
    if (!canDelete) {
        Alert.alert(
            'No se puede eliminar',
            isCredit ? 'Paga la deuda antes de eliminar esta tarjeta.' : 'Vacía la cuenta antes de eliminar esta tarjeta.'
        );
        return;
    }
    Alert.alert(
        'Eliminar tarjeta',
        `¿Eliminar "${card.name}"? Esto no se puede deshacer.`,
        [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar', style: 'destructive', onPress: async () => {
                    const result = isCredit
                        ? await deleteCreditCard(card.id)
                        : await deleteAccount(card.id);
                    if (result?.error) {
                        Alert.alert('No se pudo eliminar', result.error);
                    }
                }
            },
        ]
    );
}

// Pay-card sheet: pick a source account and how much to pay against a
// credit card's debt. This is what actually moves the money — records
// a withdrawal transaction from the chosen account AND reduces the
// card's debt, so History shows where the payment came from and
// Balance total drops by the right amount.
function PayCardSheet({ card, accounts, onClose }) {
    const { addTransaction, payCreditCard } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createCardsStyles(theme), [theme]);
    const [amount, setAmount] = useState(card ? String(card.currentDebt.toFixed(2)) : '');
    const [accountId, setAccountId] = useState(accounts[0]?.id || null);
    const [loading, setLoading] = useState(false);

    if (!card) return null;

    const amt = parseFloat(amount) || 0;
    // No epsilon fudge needed here — card.currentDebt is always
    // rounded to a clean 2-decimal value at the source
    // (updateCreditCardDebt/payCreditCard), so a straight comparison
    // against a user-typed amount (also capped at 2 decimals by
    // DecimalInput) can't miss a valid "pay it all off" by a
    // fraction-of-a-cent float artifact.
    const canConfirm = amt > 0 && amt <= card.currentDebt && accountId && !loading;

    const handleConfirm = async () => {
        if (!canConfirm) return;
        setLoading(true);
        const result = await addTransaction({
            type: 'withdrawal',
            amount: amt,
            reason: `Pago a ${card.name}`,
            category: 'card_payment',
            accountId,
            creditCardId: null,
        });
        setLoading(false);
        if (result?.error) {
            Alert.alert('Fondos insuficientes', result.error);
            return;
        }
        await payCreditCard(card.id, amt);
        if (result.savingsWarning) {
            Alert.alert(
                'Usaste fondos de ahorro',
                `Este pago usó ${formatCurrency(result.savingsWarning.newlyAtRisk)} que tenías apartado como ahorro en ${result.savingsWarning.accountName}.`,
                [{ text: 'Entendido', onPress: onClose }]
            );
            return;
        }
        onClose();
    };

    return (
        <Modal visible transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Pagar {card.name}</Text>
                    <Text style={styles.sheetSubtitle}>
                        Debes {formatCurrency(card.currentDebt)}
                    </Text>

                    <Text style={styles.sheetLabel}>CANTIDAD A PAGAR</Text>
                    <DecimalInput
                        style={[styles.sheetInput, styles.sheetInputLarge]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor={theme.muted}
                    />

                    <Text style={styles.sheetLabel}>DESDE QUÉ CUENTA</Text>
                    <View style={styles.chipRow}>
                        {accounts.map(a => (
                            <TouchableOpacity
                                key={a.id}
                                style={[styles.chip, accountId === a.id && styles.chipActive]}
                                onPress={() => setAccountId(a.id)}
                            >
                                <Text style={[styles.chipText, accountId === a.id && styles.chipTextActive]}>
                                    {a.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, !canConfirm && styles.btnDisabled]}
                            onPress={handleConfirm}
                            disabled={!canConfirm}
                        >
                            <Text style={styles.btnPrimaryText}>
                                {loading ? 'Procesando...' : 'Confirmar pago'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Tap the front card of any deck → this. Full detail for either
// type, plus edit/delete, plus "Pagar" for a credit card with debt.
function CardDetailSheet({ card, onClose, onPay, onEdit }) {
    const { deleteAccount, deleteCreditCard } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createCardsStyles(theme), [theme]);
    const isCredit = card.cardType === 'credit';

    const pct = isCredit && card.limit > 0
        ? Math.min(Math.round((card.currentDebt / card.limit) * 100), 100)
        : undefined;
    const daysLeft = isCredit ? card.paymentDay - new Date().getDate() : null;
    const isSoon = isCredit && daysLeft !== null && daysLeft >= 0 && daysLeft <= 5;

    // Same rule as everywhere else: can't delete something that still
    // holds real money/debt — that money has to go somewhere real
    // first (pay the card down, or move the account's balance out via
    // a transaction), never just vanish along with the card.
    const canDelete = isCredit ? card.currentDebt === 0 : card.balance === 0;

    const handleDelete = () => {
        Alert.alert(
            'Eliminar tarjeta',
            `¿Eliminar "${card.name}"? Esto no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive', onPress: async () => {
                        const result = isCredit
                            ? await deleteCreditCard(card.id)
                            : await deleteAccount(card.id);
                        if (result?.error) {
                            Alert.alert('No se pudo eliminar', result.error);
                            return;
                        }
                        onClose();
                    }
                },
            ]
        );
    };

    return (
        <Modal visible transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />

                    <View style={{ marginBottom: Spacing.md }}>
                        <CardFace
                            name={card.name}
                            type={card.cardType}
                            color={card.color}
                            pattern={card.pattern}
                            variant="detail"
                            valueLabel={isCredit ? 'DEUDA ACTUAL' : 'SALDO'}
                            valueText={formatCurrency(isCredit ? card.currentDebt : card.balance)}
                            progressPct={pct}
                        />
                    </View>

                    <View style={styles.detailCard}>
                        {isCredit ? (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Límite</Text>
                                    <Text style={styles.detailVal}>{formatCurrency(card.limit)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Fecha de corte</Text>
                                    <Text style={styles.detailVal}>Día {card.cutoffDay}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Fecha de pago</Text>
                                    <Text style={[styles.detailVal, isSoon && { color: theme.moneyOut }]}>
                                        Día {card.paymentDay}{isSoon ? '  · pronto' : ''}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Pago mínimo</Text>
                                    <Text style={styles.detailVal}>
                                        {formatCurrency(card.currentDebt * 0.05)}
                                    </Text>
                                </View>
                                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.detailKey}>Pago total</Text>
                                    <Text style={[styles.detailVal, { color: theme.moneyOut, fontWeight: '800' }]}>
                                        {formatCurrency(card.currentDebt)}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.detailKey}>Saldo actual</Text>
                                <Text style={styles.detailVal}>{formatCurrency(card.balance)}</Text>
                            </View>
                        )}
                    </View>

                    {isCredit && card.currentDebt > 0 && (
                        <TouchableOpacity style={styles.payBtn} onPress={onPay}>
                            <Text style={styles.payBtnText}>Pagar tarjeta</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.sheetBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onEdit}>
                            <Text style={styles.btnCancelText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnDelete, !canDelete && styles.btnDisabled]}
                            onPress={canDelete ? handleDelete : undefined}
                            disabled={!canDelete}
                        >
                            <Text style={styles.btnPrimaryText}>
                                {canDelete ? 'Eliminar' : (isCredit ? 'Paga la deuda primero' : 'Vacía la cuenta primero')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Floating Editar/Pagar/Eliminar menu — appears where you long-pressed,
// for either type. Positioned from the on-screen coordinates FocusStack
// already measured for us, clamped so it never renders off-screen.
function QuickActionsPopover({ card, position, onClose, onEdit, onPay, onDelete }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createCardsStyles(theme), [theme]);
    if (!card) return null;

    const isCredit = card.cardType === 'credit';
    const showPay = isCredit && card.currentDebt > 0;
    const btnCount = showPay ? 3 : 2;
    const POPOVER_WIDTH = btnCount * 64 + 16;
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const rawLeft = position ? position.x : screenWidth / 2 - POPOVER_WIDTH / 2;
    const rawTop = position ? position.y - 76 : screenHeight / 2 - 100;
    const left = Math.min(Math.max(rawLeft, 12), screenWidth - POPOVER_WIDTH - 12);
    const top = Math.max(rawTop, 56);

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.popoverBackdrop} activeOpacity={1} onPress={onClose} />
            <View style={[styles.popover, { top, left }]}>
                <TouchableOpacity style={styles.popoverBtn} onPress={onEdit}>
                    <View style={styles.popoverIconWrap}><IconPencil color={theme.ink} size={18} /></View>
                    <Text style={styles.popoverLabel}>Editar</Text>
                </TouchableOpacity>
                {showPay && (
                    <TouchableOpacity style={styles.popoverBtn} onPress={onPay}>
                        <View style={[styles.popoverIconWrap, { backgroundColor: theme.moneyInSoft }]}>
                            <IconCash color={theme.moneyIn} size={18} />
                        </View>
                        <Text style={styles.popoverLabel}>Pagar</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.popoverBtn} onPress={onDelete}>
                    <View style={[styles.popoverIconWrap, { backgroundColor: theme.moneyOutSoft }]}>
                        <IconTrash color={theme.moneyOut} size={17} />
                    </View>
                    <Text style={[styles.popoverLabel, { color: theme.moneyOut }]}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

// "+" → this, before AddCardScreen. Picking a type up front means
// AddCardScreen opens with the right type already selected instead of
// making the person choose twice.
function AddTypeSheet({ onClose, onPick }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createCardsStyles(theme), [theme]);
    return (
        <Modal visible transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalBg}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Nueva tarjeta</Text>
                    <Text style={styles.sheetSubtitle}>¿Qué tipo vas a agregar?</Text>
                    <View style={styles.typePickRow}>
                        <TouchableOpacity
                            style={[styles.typePickBtn, { backgroundColor: theme.moneyInSoft, borderColor: theme.moneyIn }]}
                            onPress={() => onPick('debit')}
                        >
                            <Text style={styles.typePickText}>Débito</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typePickBtn, { backgroundColor: theme.moneyOutSoft, borderColor: theme.moneyOut }]}
                            onPress={() => onPick('credit')}
                        >
                            <Text style={styles.typePickText}>Crédito</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// One deck (Débito or Crédito): collapsible header with a running
// total, and — when it has at least one card — a FocusStack. Empty
// decks collapse down to a single "add your first one" row instead
// of showing a header for zero cards.
function DeckSection({
    label, dotColor, total, utilPct, cards,
    collapsed, onToggle, focusedId, onFocusChange,
    onOpenDetail, onLongPressCard, onAddEmpty, styles, theme, savingsAccounts,
}) {
    if (cards.length === 0) {
        return (
            <TouchableOpacity style={styles.emptyTypeRow} onPress={onAddEmpty} activeOpacity={0.7}>
                <Text style={styles.emptyTypeText}>+ Agrega tu primera tarjeta de {label.toLowerCase()}</Text>
            </TouchableOpacity>
        );
    }
    return (
        <View style={styles.deckSection}>
            <TouchableOpacity style={styles.deckHead} onPress={onToggle} activeOpacity={0.7}>
                <View style={styles.deckHeadLeft}>
                    <View style={[styles.deckDot, { backgroundColor: dotColor }]} />
                    <Text style={styles.deckTitle}>{label}</Text>
                    <Text style={styles.deckCount}>{cards.length}</Text>
                </View>
                <View style={styles.deckHeadRight}>
                    {utilPct !== undefined && <MiniRing pct={utilPct} theme={theme} />}
                    <Text style={styles.deckTotal}>{total}</Text>
                    <View style={collapsed && styles.chevCollapsed}>
                        <IconChevronDown color={theme.muted} size={13} />
                    </View>
                </View>
            </TouchableOpacity>
            {!collapsed && (
                <View style={styles.deckStackWrap}>
                    <FocusStack
                        cards={cards}
                        focusedId={focusedId}
                        onFocusChange={onFocusChange}
                        onOpenDetail={onOpenDetail}
                        onLongPressCard={onLongPressCard}
                        savingsAccounts={savingsAccounts}
                    />
                </View>
            )}
        </View>
    );
}

export default function CardsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { creditCards, accounts, deleteAccount, deleteCreditCard, savingsAccounts } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createCardsStyles(theme), [theme]);

    const [payingCard, setPayingCard] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [collapsed, setCollapsed] = useState({ debit: false, credit: false });
    const [focused, setFocused] = useState({ debit: null, credit: null });
    const [quickCard, setQuickCard] = useState(null);
    const [quickPos, setQuickPos] = useState(null);
    const [showTypePicker, setShowTypePicker] = useState(false);

    const debitAccounts = accounts.filter(a => a.type === 'debit').map(a => ({ ...a, cardType: 'debit' }));
    const creditCardsTagged = creditCards.map(c => ({ ...c, cardType: 'credit' }));
    const hasAnyCards = debitAccounts.length + creditCardsTagged.length > 0;

    const totalDebit = debitAccounts.reduce((s, a) => s + a.balance, 0);
    const totalDebt = creditCardsTagged.reduce((s, c) => s + c.currentDebt, 0);
    const totalLimit = creditCardsTagged.reduce((s, c) => s + c.limit, 0);
    const utilPct = totalLimit > 0 ? Math.min(Math.round((totalDebt / totalLimit) * 100), 100) : 0;

    const closeQuickMenu = () => { setQuickCard(null); setQuickPos(null); };

    const openAdd = (presetType) => {
        setShowTypePicker(false);
        navigation.navigate('AddCard', presetType ? { presetType } : undefined);
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Header ── */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <Text style={styles.title}>Tarjetas</Text>
                    {/* Hidden when there's nothing yet — the empty state
                        below already has its own big centered "+ Agregar
                        tarjeta" button, so this one would just be a
                        second entry point to the exact same action. */}
                    {hasAnyCards && (
                        <TouchableOpacity style={styles.addBtn} onPress={() => setShowTypePicker(true)}>
                            <IconCardAdd color={theme.brandOn} bgColor={theme.brand} size={20} />
                        </TouchableOpacity>
                    )}
                </View>

                {!hasAnyCards ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <IconCard color={theme.muted} size={20} />
                        </View>
                        <Text style={styles.emptyTitle}>Sin tarjetas</Text>
                        <Text style={styles.emptySub}>
                            Agrega una tarjeta de débito o crédito para llevar el control de tu dinero y tu deuda
                        </Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowTypePicker(true)}>
                            <Text style={styles.emptyBtnText}>+ Agregar tarjeta</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <DeckSection
                            label="Débito"
                            dotColor={theme.moneyIn}
                            total={formatCurrency(totalDebit)}
                            cards={debitAccounts}
                            collapsed={collapsed.debit}
                            onToggle={() => setCollapsed(c => ({ ...c, debit: !c.debit }))}
                            focusedId={focused.debit}
                            onFocusChange={(id) => setFocused(f => ({ ...f, debit: id }))}
                            onOpenDetail={setSelectedCard}
                            onLongPressCard={(card, pos) => { setQuickCard(card); setQuickPos(pos); }}
                            onAddEmpty={() => openAdd('debit')}
                            styles={styles}
                            theme={theme}
                            savingsAccounts={savingsAccounts}
                        />
                        <DeckSection
                            label="Crédito"
                            dotColor={theme.moneyOut}
                            total={formatCurrency(totalDebt)}
                            utilPct={creditCardsTagged.length ? utilPct : undefined}
                            cards={creditCardsTagged}
                            collapsed={collapsed.credit}
                            onToggle={() => setCollapsed(c => ({ ...c, credit: !c.credit }))}
                            focusedId={focused.credit}
                            onFocusChange={(id) => setFocused(f => ({ ...f, credit: id }))}
                            onOpenDetail={setSelectedCard}
                            onLongPressCard={(card, pos) => { setQuickCard(card); setQuickPos(pos); }}
                            onAddEmpty={() => openAdd('credit')}
                            styles={styles}
                            theme={theme}
                        />
                    </>
                )}

                <View style={{ height: Spacing.xl + Spacing.lg }} />
            </ScrollView>

            {selectedCard && (
                <CardDetailSheet
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onPay={() => {
                        const card = selectedCard;
                        setSelectedCard(null);
                        setPayingCard(card);
                    }}
                    onEdit={() => {
                        const card = selectedCard;
                        setSelectedCard(null);
                        navigation.navigate('AddCard', { editCard: card });
                    }}
                />
            )}

            {payingCard && (
                <PayCardSheet
                    card={payingCard}
                    accounts={accounts}
                    onClose={() => setPayingCard(null)}
                />
            )}

            {quickCard && (
                <QuickActionsPopover
                    card={quickCard}
                    position={quickPos}
                    onClose={closeQuickMenu}
                    onEdit={() => {
                        const card = quickCard;
                        closeQuickMenu();
                        navigation.navigate('AddCard', { editCard: card });
                    }}
                    onPay={() => {
                        const card = quickCard;
                        closeQuickMenu();
                        setPayingCard(card);
                    }}
                    onDelete={() => {
                        const card = quickCard;
                        closeQuickMenu();
                        promptDeleteCard(card, { deleteAccount, deleteCreditCard });
                    }}
                />
            )}

            {showTypePicker && (
                <AddTypeSheet
                    onClose={() => setShowTypePicker(false)}
                    onPick={openAdd}
                />
            )}
        </View>
    );
}