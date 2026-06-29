// Reminder card shown on Home when a scheduled fund or MSI payment is due
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrencyShort } from '../utils';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default function PendingFundCard({ fund, status, onPress }) {
    const isOverdue = status === 'overdue';
    const isMSI = fund.type === 'msi';

    const dateLabel = isOverdue
        ? `Venció el ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`
        : `Próximo ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`;

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isMSI
                    ? (isOverdue ? styles.cardMsiOverdue : styles.cardMsi)
                    : (isOverdue ? styles.cardOverdue : styles.cardUpcoming),
            ]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{fund.name}</Text>
                    {isMSI && (
                        <View style={styles.msiBadge}>
                            <Text style={styles.msiBadgeText}>
                                MSI {fund.paidMonths + 1}/{fund.months}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={styles.subtitle}>{dateLabel}</Text>
            </View>
            <View style={styles.right}>
                <Text style={[styles.amount, isMSI && styles.amountMsi]}>
                    {isMSI ? `-${formatCurrencyShort(fund.monthlyAmount)}` : `+${formatCurrencyShort(fund.amount)}`}
                </Text>
                <Text style={styles.action}>{isMSI ? 'Confirmar →' : 'Registrar →'}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
        ...Shadow.card,
    },
    cardUpcoming: {
        backgroundColor: Colors.sageLt,
        borderLeftWidth: 3,
        borderLeftColor: Colors.sage,
    },
    cardOverdue: {
        backgroundColor: Colors.redLt,
        borderLeftWidth: 3,
        borderLeftColor: Colors.red,
    },
    cardMsi: {
        backgroundColor: '#EEE8F7',
        borderLeftWidth: 3,
        borderLeftColor: Colors.purple,
    },
    cardMsiOverdue: {
        backgroundColor: Colors.redLt,
        borderLeftWidth: 3,
        borderLeftColor: Colors.red,
    },
    info: { flex: 1 },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        flexWrap: 'wrap',
    },
    title: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
    },
    msiBadge: {
        backgroundColor: Colors.purple,
        borderRadius: 99,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    msiBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.white,
    },
    subtitle: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 2,
    },
    right: { alignItems: 'flex-end' },
    amount: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.sage,
    },
    amountMsi: {
        color: Colors.purple,
    },
    action: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 2,
    },
});