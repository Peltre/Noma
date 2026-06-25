// List of available credit cards with debt
// Include cut dates y limits (manually introduced)
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, SaveAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency, formatCurrencyShort } from '../utils';
import styles from './CardsScreen.styles';

import { useFinance } from '../store/FinanceContext';

// Background colors, right now assigned by index of card, maybe later make it customizable
const CARD_COLORS = [
    styles.cardBgGreen,
    styles.cardBgDark,
    styles.cardBgAmber,
];

export default function CardsScreen() {
    const navigation = useNavigation();
    const { creditCards, payCreditCard } = useFinance();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Tarjetas</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => navigation.navigate('AddCard')}
                    >
                        <Text style={styles.addBtnText}>+ Nueva</Text>
                    </TouchableOpacity>
                </View>

                {/* Empty state */}
                {creditCards.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>💳</Text>
                        <Text style={styles.emptyText}>Sin tarjetas</Text>
                        <Text style={styles.emptySubtext}>
                            Agrega una tarjeta de credito para trackearla
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyBtn}
                            onPress={() => navigation.navigate('AddCard')}
                        >
                            <Text style={styles.emptyBtnText}>+ Agregar Tarjeta</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.cardContainer}>
                        {creditCards.map((card, index) => {
                            const percentage = card.limit > 0
                                ? Math.min(Math.round((card.currentDebt / card.limit) * 100), 100)
                                : 0

                            // Alert if payment is drawing close
                            const daysUntilPayment = card.paymentDay - new Date().getDate();
                            const isPaymentSoon = daysUntilPayment >= 0 && daysUntilPayment <= 5;

                            return (
                                <View key={card.id}>
                                    {/* Visual card */}
                                    <View style={[
                                        styles.creditCard,
                                        CARD_COLORS[index % CARD_COLORS.length]
                                    ]}>
                                        <View style={styles.cardTop}>
                                            <Text style={styles.cardBank}>{card.name}</Text>
                                            <Text style={styles.cardTypeEmoji}>💳</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.cardDebtLabel}>Deuda actual</Text>
                                            <Text style={styles.cardDebtAmount}>
                                                {formatCurrency(card.currentDebt)}
                                            </Text>
                                            <View style={styles.progressBar}>
                                                <View styles={[
                                                    styles.progressFill,
                                                    { width: `${percentage}%` }
                                                ]} />
                                            </View>
                                            <View style={styles.cardMeta}>
                                                <Text style={styles.cardMetaText}>
                                                    Limite: {formatCurrencyShort(card.limit)}
                                                </Text>
                                                <Text style={styles.cardMetaText}>
                                                    {percentage}% usado
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Card details */}
                                    <View style={styles.detailCard}>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailKey}>Fecha de corte</Text>
                                            <Text style={styles.detailVal}>
                                                Dia {card.cutoffDay} de cada mes
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailKey}>Fecha de pago</Text>
                                            <Text
                                                style={[
                                                    styles.detailVal,
                                                    isPaymentSoon && styles.detailValAlert
                                                ]}>
                                                Dia {card.paymentDay} de cada mes
                                                {isPaymentSoon ? ' ⚠️' : ''}
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailKey}>Pago minimo</Text>
                                            <Text style={styles.detailVal}>
                                                {formatCurrency(card.currentDebt * 0.05)}
                                            </Text>
                                        </View>
                                        <View style={[styles.detailRow, styles.detailRowLast]}>
                                            <Text style={styles.detailKey}>Pago total</Text>
                                            <Text style={styles.detailVal}>
                                                {formatCurrency(card.currentDebt)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Payment button */}
                                    <TouchableOpacity
                                        style={styles.payBtn}
                                        onPress={() => payCreditCard(card.id, card.currentDebt)}
                                    >
                                        <Text style={styles.payBtnText}>
                                            ✓ Registrar pago total
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}