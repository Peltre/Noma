// Unified "Tarjetas" screen: débito + crédito as two independent
// decks, each a FocusStack (see components/FocusStack.jsx) — cards
// stacked behind each other, tap a peeking one to bring it to the
// front, tap the front one for full detail. Long-press anywhere for
// a quick Editar/Pagar/Eliminar popover without leaving the screen.
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatCurrency, savingsAdjustedToast } from '../utils';
import { FontSize, Spacing } from '../constants';
import createCardsStyles from './CardsScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme, useStyles } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import CardFace from '../components/CardFace';
import FocusStack from '../components/FocusStack';
import Svg, { Circle } from 'react-native-svg';
import {
    ScreenHeader, Sheet, Pill, Button, FieldLabel, Money, fieldSurface, useToast,
} from '../components/ui';
import { IconPencil, IconCardPayment, IconTrash, IconChevronDown, IconCardAdd, IconChevronRight } from '../components/Icons';
import { round2 } from '../utils/formatCurrency';

// Tiny utilization ring for the Crédito deck's header — how much of
// the combined limit across all credit cards is currently used up.
// Uses theme.cardPayment, same identity color card-payment
// transactions carry in Home/History, so "this is about tarjeta de
// crédito debt" reads consistently everywhere in the app.
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
                stroke={theme.cardPayment} strokeWidth={stroke} fill="none"
                strokeDasharray={`${dash}, ${circumference}`}
                strokeLinecap="round"
                // Start the arc at 12 o'clock instead of svg's default 3 o'clock
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        </Svg>
    );
}

// Regla compartida de borrado (no se puede borrar algo que todavía
// tiene dinero o deuda) — la usan el popover de acciones rápidas y
// CardDetailSheet. A diferencia del botón deshabilitado de la hoja, el
// popover no tiene cómo explicar por qué no se puede, así que avisa.
function promptDeleteCard(card, { deleteAccount, deleteCreditCard, toast }) {
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
                        toast.error('No se pudo eliminar', result.error);
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
    const { payCardWithTransaction } = useFinance();
    const toast = useToast();
    const { theme } = useTheme();
    const styles = useStyles(createCardsStyles);
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
    const overDebt = amt > card.currentDebt;
    const canConfirm = amt > 0 && !overDebt && accountId && !loading;

    const handleConfirm = async () => {
        if (!canConfirm) return;
        setLoading(true);
        const result = await payCardWithTransaction({
            accountId,
            amount: amt,
            reason: `Pago a ${card.name}`,
            category: 'card_payment',
            // NOT the same thing as a transaction's own creditCardId field
            // (that one stays null on purpose — see linkedCardId below —
            // because `expense` + creditCardId means "new purchase"
            // everywhere else). linkedCardId just remembers which card
            // this payment paid down, so useFinanceStore's
            // deleteTransaction/updateTransaction can restore the right
            // amount of debt if this payment is later edited or removed
            // from Historial.
            linkedCardId: card.id,
        });
        setLoading(false);
        if (result?.error) {
            toast.error('Fondos insuficientes', result.error);
            return;
        }
        // Si el gasto se comió ahorro, la app ya ajustó los números:
        // el toast dice qué se recortó.
        if (result.savingsAdjusted) {
            const notice = savingsAdjustedToast(result.savingsAdjusted, formatCurrency);
            toast.info(notice.title, notice.detail);
        }
        onClose();
    };

    return (
        <Sheet
            onClose={onClose}
            dismissable={!loading}
            title={`Pagar ${card.name}`}
            subtitle={`Debes ${formatCurrency(card.currentDebt)}`}
        >
            <FieldLabel required>Cantidad a pagar</FieldLabel>
            <DecimalInput
                style={[styles.decimalInputLarge, fieldSurface(theme, { error: overDebt })]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={theme.inkDim}
            />
            {overDebt && (
                <Text style={styles.inputError}>No puedes pagar más de lo que debes</Text>
            )}

            <FieldLabel required>Desde qué cuenta</FieldLabel>
            <View style={styles.pillRow}>
                {accounts.map(a => (
                    <Pill
                        key={a.id}
                        label={a.name}
                        selected={accountId === a.id}
                        accent={theme.cardPayment}
                        onPress={() => setAccountId(a.id)}
                    />
                ))}
            </View>

            <View style={styles.sheetBtns}>
                <Button label="Cancelar" variant="secondary" onPress={onClose} />
                <Button
                    label="Confirmar pago"
                    accent={theme.cardPayment}
                    accentOn={theme.cardPaymentOn}
                    loading={loading}
                    disabled={!canConfirm}
                    onPress={handleConfirm}
                    style={{ flex: 2 }}
                />
            </View>
        </Sheet>
    );
}

// Tap the front card of any deck → this. Full detail for either
// type, plus edit/delete, plus "Pagar" for a credit card with debt.
function CardDetailSheet({ card, onClose, onPay, onEdit, onOpenSavings }) {
    const { deleteAccount, deleteCreditCard, savingsAccounts } = useFinance();
    const toast = useToast();
    const { theme } = useTheme();
    const styles = useStyles(createCardsStyles);
    const isCredit = card.cardType === 'credit';

    const myApartados = isCredit ? [] : savingsAccounts.filter((s) => s.linkedAccountId === card.id);

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
                            toast.error('No se pudo eliminar', result.error);
                            return;
                        }
                        onClose();
                    }
                },
            ]
        );
    };

    // Fila de detalle: la llave a la izquierda, el monto (o el texto)
    // a la derecha, siempre con la misma tipografía.
    const DetailRow = ({ label, value, amount, color, strong, last }) => (
        <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
            <Text style={styles.detailKey}>{label}</Text>
            {amount !== undefined ? (
                <Money value={amount} size={FontSize.sm + 1} color={color || theme.ink} />
            ) : (
                <Text style={[styles.detailVal, strong && { color, fontWeight: '800' }]}>{value}</Text>
            )}
        </View>
    );

    return (
        <Sheet onClose={onClose}>
            <View style={styles.detailFace}>
                <CardFace
                    name={card.name}
                    type={card.cardType}
                    color={card.color}
                    pattern={card.pattern}
                    variant="detail"
                    valueLabel={isCredit ? 'DEUDA ACTUAL' : 'SALDO'}
                    valueAmount={isCredit ? card.currentDebt : card.balance}
                    progressPct={pct}
                />
            </View>

            <View style={styles.detailCard}>
                {isCredit ? (
                    <>
                        <DetailRow label="Límite" amount={card.limit} />
                        <DetailRow label="Fecha de corte" value={`Día ${card.cutoffDay}`} />
                        <DetailRow
                            label="Fecha de pago"
                            value={`Día ${card.paymentDay}${isSoon ? '  · pronto' : ''}`}
                            color={theme.alert}
                            strong={isSoon}
                        />
                        <DetailRow label="Pago mínimo" amount={card.currentDebt * 0.05} />
                        <DetailRow label="Pago total" amount={card.currentDebt} color={theme.cardPayment} last />
                    </>
                ) : (
                    <DetailRow label="Saldo actual" amount={card.balance} last />
                )}
            </View>

            {/* Los apartados se administran en Ahorros (tocando la cuenta
                en "Todo tu dinero"): aquí sólo se mencionan, para no
                tener dos lugares que hagan lo mismo. */}
            {!isCredit && myApartados.length > 0 && (
                <View style={styles.detailCard}>
                    <TouchableOpacity
                        style={[styles.detailRow, { borderBottomWidth: 0 }]}
                        onPress={onOpenSavings}
                        accessibilityRole="button"
                    >
                        <Text style={styles.detailKey}>
                            {myApartados.length} {myApartados.length === 1 ? 'apartado' : 'apartados'} · {formatCurrency(round2(myApartados.reduce((t, a) => t + a.earmarkedAmount, 0)))}
                        </Text>
                        <Text style={[styles.detailVal, { color: theme.brand }]}>Ver en Ahorros</Text>
                        <IconChevronRight color={theme.brand} size={13} />
                    </TouchableOpacity>
                </View>
            )}

            {isCredit && card.currentDebt > 0 && (
                <View style={styles.sheetBtns}>
                    <Button
                        label="Pagar tarjeta"
                        accent={theme.cardPayment}
                        accentOn={theme.cardPaymentOn}
                        onPress={onPay}
                    />
                </View>
            )}

            <View style={styles.sheetBtns}>
                <Button label="Editar" variant="secondary" onPress={onEdit} />
                <Button
                    label={canDelete ? 'Eliminar' : (isCredit ? 'Paga la deuda primero' : 'Vacía la cuenta primero')}
                    variant="danger"
                    disabled={!canDelete}
                    onPress={handleDelete}
                    style={{ flex: 1.4 }}
                />
            </View>

        </Sheet>
    );
}

// Floating Editar/Pagar/Eliminar menu — appears where you long-pressed,
// for either type. Positioned from the on-screen coordinates FocusStack
// already measured for us, clamped so it never renders off-screen.
function QuickActionsPopover({ card, position, onClose, onEdit, onPay, onDelete }) {
    const { theme } = useTheme();
    const styles = useStyles(createCardsStyles);
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
                        <View style={[styles.popoverIconWrap, { backgroundColor: theme.cardPaymentSoft }]}>
                            <IconCardPayment color={theme.cardPayment} size={18} />
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
    const styles = useStyles(createCardsStyles);
    return (
        <Sheet onClose={onClose} title="Nueva tarjeta" subtitle="¿Qué tipo vas a agregar?">
            <View style={styles.sheetBtns}>
                <Button
                    label="Débito"
                    accent={theme.moneyIn}
                    accentOn={theme.brandOn}
                    onPress={() => onPick('debit')}
                />
                <Button
                    label="Crédito"
                    accent={theme.cardPayment}
                    accentOn={theme.cardPaymentOn}
                    onPress={() => onPick('credit')}
                />
            </View>
        </Sheet>
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
            <TouchableOpacity style={styles.emptyDeckRow} onPress={onAddEmpty} activeOpacity={0.7}>
                <Text style={styles.emptyDeckText}>+ Agrega tu primera tarjeta de {label.toLowerCase()}</Text>
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
                    <Money value={total} size={FontSize.md} color={theme.ink} decimals={false} compact />
                    <View style={collapsed && styles.chevCollapsed}>
                        <IconChevronDown color={theme.inkDim} size={13} />
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
    const { creditCards, accounts, deleteAccount, deleteCreditCard, savingsAccounts } = useFinance();
    const toast = useToast();
    const { theme } = useTheme();
    const styles = useStyles(createCardsStyles);

    const [payingCard, setPayingCard] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [collapsed, setCollapsed] = useState({ debit: false, credit: false });
    const [focused, setFocused] = useState({ debit: null, credit: null });
    const [quickCard, setQuickCard] = useState(null);
    const [quickPos, setQuickPos] = useState(null);
    const [showTypePicker, setShowTypePicker] = useState(false);

    const debitAccounts = accounts.filter(a => a.type === 'debit').map(a => ({ ...a, cardType: 'debit' }));
    const creditCardsTagged = creditCards.map(c => ({ ...c, cardType: 'credit' }));

    // Llegada desde Inicio tocando una tarjeta: se enfoca en la pila y
    // se abre su detalle. focusNonce cambia en cada toque para que
    // volver a tocar la misma tarjeta vuelva a abrirla.
    const route = useRoute();
    const focusCardId = route.params?.focusCardId;
    const focusNonce = route.params?.focusNonce;
    useEffect(() => {
        if (!focusCardId) return;
        const card = creditCardsTagged.find(c => c.id === focusCardId);
        if (!card) return;
        setFocused(prev => ({ ...prev, credit: card.id }));
        setCollapsed(prev => ({ ...prev, credit: false }));
        setSelectedCard(card);
        navigation.setParams({ focusCardId: undefined, focusNonce: undefined });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusCardId, focusNonce]);
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

                {/* La acción del header se esconde cuando no hay nada:
                    el estado vacío de abajo ya tiene su propio botón
                    grande, y este sería una segunda puerta a lo mismo. */}
                <ScreenHeader
                    title="Tarjetas"
                    actionIcon={hasAnyCards ? IconCardAdd : undefined}
                    onAction={() => setShowTypePicker(true)}
                />

                {!hasAnyCards ? (
                    <View style={styles.emptyWrap}>
                        <EmptyState
                            icon={IconCard}
                            title="Sin tarjetas"
                            description="Agrega una tarjeta de débito o crédito para llevar el control de tu dinero y tu deuda."
                            actionLabel="Agregar tarjeta"
                            onAction={() => setShowTypePicker(true)}
                        />
                    </View>
                ) : (
                    <>
                        <DeckSection
                            label="Débito"
                            dotColor={theme.moneyIn}
                            total={totalDebit}
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
                            dotColor={theme.cardPayment}
                            total={totalDebt}
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
                    onOpenSavings={() => {
                        setSelectedCard(null);
                        navigation.navigate('SavingsTab');
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
                        promptDeleteCard(card, { deleteAccount, deleteCreditCard, toast });
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