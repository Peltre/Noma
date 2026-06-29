// List of credit cards with debt tracking
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';
import styles from './CardsScreen.styles';
import { useFinance } from '../store/FinanceContext';
import Svg, { Rect, Path } from 'react-native-svg';

// Card colors cycling by index
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

export default function CardsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { creditCards, payCreditCard } = useFinance();

    const handlePayTotal = (card) => {
        Alert.alert(
            'Registrar pago total',
            `¿Marcar ${formatCurrencyShort(card.currentDebt)} como pagados en ${card.name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => payCreditCard(card.id, card.currentDebt) },
            ]
        );
    };

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
                            <CardIcon color={Colors.muted} />
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
                                            <Text style={[styles.detailVal, isSoon && { color: Colors.gold }]}>
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
                                            <Text style={[styles.detailVal, { color: Colors.coral, fontWeight: '800' }]}>
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
                                        onPress={() => card.currentDebt > 0 && handlePayTotal(card)}
                                        disabled={card.currentDebt === 0}
                                    >
                                        <Text style={[
                                            styles.payBtnText,
                                            card.currentDebt === 0 && { color: Colors.muted },
                                        ]}>
                                            {card.currentDebt === 0 ? 'Sin deuda' : 'Registrar pago total'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: Spacing.xl + Spacing.lg }} />
            </ScrollView>
        </View>
    );
}