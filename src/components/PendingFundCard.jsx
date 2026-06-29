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

    // Accent color: overdue always coral, otherwise by type
    const accentColor = isOverdue
        ? Colors.coral
        : isMSI ? Colors.violet : Colors.teal;

    const iconBg = isOverdue
        ? Colors.coralLt
        : isMSI ? Colors.violetLt : Colors.tealLt;

    return (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: accentColor }]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            {/* Colored icon box */}
            <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                <Text style={[styles.iconGlyph, { color: accentColor }]}>
                    {isMSI ? 'M' : '↓'}
                </Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>{fund.name}</Text>
                    {isMSI && (
                        <View style={[styles.msiBadge, { backgroundColor: Colors.ink }]}>
                            <Text style={styles.msiBadgeText}>
                                {fund.paidMonths + 1}/{fund.months}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={styles.subtitle}>{dateLabel}</Text>
            </View>

            {/* Amount */}
            <Text style={[styles.amount, { color: accentColor }]}>
                {isMSI ? '−' : '+'}{formatCurrencyShort(isMSI ? fund.monthlyAmount : fund.amount)}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        borderLeftWidth: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Shadow.card,
    },
    iconBox: {
        width: 36, height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    iconGlyph: {
        fontSize: 15,
        fontWeight: '900',
    },
    info: { flex: 1 },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3,
    },
    title: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
        flex: 1,
    },
    msiBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: Radius.full,
    },
    msiBadgeText: {
        fontSize: FontSize.xs - 1,
        fontWeight: '800',
        color: Colors.white,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        fontWeight: '500',
    },
    amount: {
        fontSize: FontSize.md,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
});