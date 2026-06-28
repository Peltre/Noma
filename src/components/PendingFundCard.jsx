// Little component that renders a reminder card when a scheduled fund is due or overdue
// Tapping it opens add transaction with pre-filled with the funds data
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrencyShort } from '../utils';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default function PendingFundCard({ fund, status, onPress }) {
    const isOverdue = status === 'overdue';

    return (
        <TouchableOpacity
            style={[styles.card, isOverdue ? styles.cardOverdue : styles.cardUpcoming]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.left}>
                <Text style={styles.emoji}>{isOverdue ? '⚠️' : '📅'}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{fund.name}</Text>
                <Text style={styles.subtitle}>
                    {isOverdue
                        ? `Venció el ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`
                        : `Próximo ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`
                    }
                </Text>
            </View>
            <View style={styles.right}>
                <Text style={styles.amount}>
                    +{formatCurrencyShort(fund.amount)}
                </Text>
                <Text style={styles.action}>Registrar →</Text>
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
    cardOverdue: {
        backgroundColor: Colors.redLt,
        borderLeftWidth: 3,
        borderLeftColor: Colors.red,
    },
    cardUpcoming: {
        backgroundColor: Colors.sageLt,
        borderLeftWidth: 3,
        borderLeftColor: Colors.sage,
    },
    left: {
        width: 32,
        alignItems: 'center',
    },
    emoji: { fontSize: 20 },
    info: { flex: 1 },
    title: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
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
    action: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 2,
    },
});