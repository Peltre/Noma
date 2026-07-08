// List of credit cards with debt tracking
import { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { Spacing, ACCOUNT_LABELS } from '../constants';
import createCardsStyles from './CardsScreen.styles';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import Svg, { Rect, Path } from 'react-native-svg';

// Card colors cycling by index — fixed palette, meant to look like
// physical cards, independent of the app theme.
const CARD_COLORS = ['#1A1A2E', '#16213E', '#0F3460', '#1B1B2F'];

// Small credit card icon (SVG)
function CardIcon({ color = 'rgba(255,255,255,0.6)' }) {
    return (
        <Svg width={20} height={16} viewBox="0 0 20 16" fill="none">
            <Rect x="0.75" y="0.75" width="18.5" height="14.5" rx="1.75" stroke={color} strokeWidth={1.5} />
            <Path d="M0 5h20" stroke={color} strokeWidth={1.5} />
            <Rect x="2" y="9" width="4" height="2.5" rx="0.5" fill={color} />
        </Svg>
    );
}

// Pay-card sheet: pick a source account and how much to pay.
// This is what actually moves the money — it records a withdrawal
// transaction from the chosen account AND reduces the card's debt,
// so History shows where the payment came from and Balance total
// drops by the right amount (previously it didn't move at all).
function PayCardSheet({ card, accounts, onClose }) {
    const { addTransaction, payCreditCard } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createCardsStyles(theme), [theme]);
    const [amount, setAmount] = useState(card ? String(card.currentDebt.toFixed(2)) : '');
    const [accountId, setAccountId] = useState(accounts[0]?.id || null);
    const [loading, setLoading] = useState(false);

    if (!card) return null;

    const amt = parseFloat(amount) || 0;
    // No epsilon fudge needed here anymore — card.currentDebt is now
    // always rounded to a clean 2-decimal value at the source
    // (updateCreditCardDebt/payCreditCard), so a straight comparison
    // against a user-typed amount (also capped at 2 decimals by
    // DecimalInput) can't miss a valid "pay it all off" by a
    // fraction-of-a-cent float artifact the way it used to.
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
                                    {ACCOUNT_LABELS[a.type] ?? a.name}
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

export default function CardsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { creditCards, accounts } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createCardsStyles(theme), [theme]);
    const [payingCard, setPayingCard] = useState(null);

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

                {/* ── Empty state ── */}
                {creditCards.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <CardIcon color={theme.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>Sin tarjetas</Text>
                        <Text style={styles.emptySub}>
                            Agrega una tarjeta de crédito para trackear tu deuda y fechas de corte
                        </Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddCard')}>
                            <Text style={styles.emptyBtnText}>+ Agregar tarjeta</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {creditCards.map((card, i) => {
                            const pct = card.limit > 0
                                ? Math.min(Math.round((card.currentDebt / card.limit) * 100), 100)
                                : 0;
                            const daysLeft = card.paymentDay - new Date().getDate();
                            const isSoon = daysLeft >= 0 && daysLeft <= 5;
                            const cardColor = CARD_COLORS[i % CARD_COLORS.length];

                            return (
                                <View key={card.id} style={styles.cardWrap}>

                                    {/* Visual card */}
                                    <View style={[styles.visualCard, { backgroundColor: cardColor }]}>
                                        <View style={styles.visualCardOrb} />
                                        <View style={styles.visualCardTop}>
                                            <Text style={styles.visualCardName}>{card.name}</Text>
                                            <View style={styles.chipWrap}>
                                                <View style={styles.chipInner} />
                                            </View>
                                        </View>
                                        <View style={styles.visualCardBottom}>
                                            <View>
                                                <Text style={styles.debtLbl}>Deuda actual</Text>
                                                <Text style={styles.debtAmt}>
                                                    {formatCurrency(card.currentDebt)}
                                                </Text>
                                            </View>
                                            <View style={styles.limitBlock}>
                                                <Text style={styles.limitLbl}>Límite</Text>
                                                <Text style={styles.limitAmt}>
                                                    {formatCurrencyShort(card.limit)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Progress bar inside card */}
                                        <View style={styles.progressTrack}>
                                            <View style={[styles.progressFill, { width: `${pct}%` }]} />
                                        </View>
                                        <Text style={styles.pctText}>{pct}% usado</Text>
                                    </View>

                                    {/* Detail rows */}
                                    <View style={styles.detailCard}>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailKey}>Fecha de corte</Text>
                                            <Text style={styles.detailVal}>Día {card.cutoffDay}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailKey}>Fecha de pago</Text>
                                            <Text style={[styles.detailVal, isSoon && { color: theme.moneyOut }]}>
                                                Día {card.paymentDay}
                                                {isSoon ? '  · pronto' : ''}
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
                                    </View>

                                    {/* Pay button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.payBtn,
                                            card.currentDebt === 0 && styles.payBtnDone,
                                        ]}
                                        onPress={() => card.currentDebt > 0 && setPayingCard(card)}
                                        disabled={card.currentDebt === 0}
                                    >
                                        <Text style={[
                                            styles.payBtnText,
                                            card.currentDebt === 0 && { color: theme.muted },
                                        ]}>
                                            {card.currentDebt === 0 ? 'Sin deuda' : 'Pagar tarjeta'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: Spacing.xl + Spacing.lg }} />
            </ScrollView>

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