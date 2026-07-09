// Unified "Tarjetas" screen: débito + crédito together, filterable,
// a grid of compact CardFace tiles, tap any one for full detail.
import { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { Spacing } from '../constants';
import createCardsStyles from './CardsScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import CardFace from '../components/CardFace';
import Svg, { Rect, Path } from 'react-native-svg';

// Small credit card icon (SVG) — used only for the empty state
function CardIcon({ color = 'rgba(255,255,255,0.6)' }) {
    return (
        <Svg width={20} height={16} viewBox="0 0 20 16" fill="none">
            <Rect x="0.75" y="0.75" width="18.5" height="14.5" rx="1.75" stroke={color} strokeWidth={1.5} />
            <Path d="M0 5h20" stroke={color} strokeWidth={1.5} />
            <Rect x="2" y="9" width="4" height="2.5" rx="0.5" fill={color} />
        </Svg>
    );
}

const FILTERS = [
    { key: 'all', label: 'Todas' },
    { key: 'debit', label: 'Débito' },
    { key: 'credit', label: 'Crédito' },
];

// CardFace's variant="grid" is 132px tall (see CardFace.jsx's
// cardCompact style). Hiding all but ~44px of that under the next
// card is what produces the fanned wallet look — that 44px is enough
// room to still read a covered card's name and DÉBITO/CRÉDITO badge.
const STACK_CARD_HEIGHT = 132;
const STACK_PEEK = 44;
const STACK_HIDDEN = STACK_CARD_HEIGHT - STACK_PEEK;

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

// Tap any card in the grid → this. Full detail for either type,
// plus edit/delete, plus "Pagar" for a credit card that has debt.
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

export default function CardsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { creditCards, accounts } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createCardsStyles(theme), [theme]);
    const [payingCard, setPayingCard] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [filter, setFilter] = useState('all');

    // Débito accounts + credit cards, tagged with a shared `cardType`
    // so the stack, filter, and detail sheet can treat them uniformly.
    const debitAccounts = accounts.filter(a => a.type === 'debit');
    const allCards = [
        ...debitAccounts.map(a => ({ ...a, cardType: 'debit' })),
        ...creditCards.map(c => ({ ...c, cardType: 'credit' })),
    ];
    const filteredCards = filter === 'all' ? allCards : allCards.filter(c => c.cardType === filter);

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Header ── */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <Text style={styles.title}>Tarjetas</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddCard')}>
                        <Text style={styles.addBtnText}>+ Nueva</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Filter ── */}
                {allCards.length > 0 && (
                    <View style={styles.filterRow}>
                        {FILTERS.map(f => (
                            <TouchableOpacity
                                key={f.key}
                                style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                                onPress={() => setFilter(f.key)}
                            >
                                <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ── Empty states ── */}
                {allCards.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <CardIcon color={theme.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>Sin tarjetas</Text>
                        <Text style={styles.emptySub}>
                            Agrega una tarjeta de débito o crédito para llevar el control de tu dinero y tu deuda
                        </Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddCard')}>
                            <Text style={styles.emptyBtnText}>+ Agregar tarjeta</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredCards.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptySub}>No tienes tarjetas de este tipo todavía</Text>
                    </View>
                ) : (
                    <View style={styles.stack}>
                        {filteredCards.map((card, i) => {
                            const isCredit = card.cardType === 'credit';
                            const pct = isCredit && card.limit > 0
                                ? Math.min(Math.round((card.currentDebt / card.limit) * 100), 100)
                                : undefined;
                            return (
                                <TouchableOpacity
                                    key={card.id}
                                    // Each card after the first is pulled up to
                                    // overlap the one before it — later siblings
                                    // paint on top by default in RN (same as the
                                    // web), so this alone produces the fanned
                                    // "wallet" look with no zIndex needed. The
                                    // exposed strip at the top of a covered card
                                    // is still its own TouchableOpacity, so it
                                    // stays tappable even while mostly hidden.
                                    style={[styles.stackCard, i > 0 && { marginTop: -STACK_HIDDEN }]}
                                    onPress={() => setSelectedCard(card)}
                                    activeOpacity={0.9}
                                >
                                    <CardFace
                                        name={card.name}
                                        type={card.cardType}
                                        color={card.color}
                                        pattern={card.pattern}
                                        variant="grid"
                                        valueLabel={isCredit ? 'DEUDA' : 'SALDO'}
                                        valueText={formatCurrencyShort(isCredit ? card.currentDebt : card.balance)}
                                        progressPct={pct}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
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
        </View>
    );
}