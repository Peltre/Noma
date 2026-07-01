// Reminder card shown on Home when a scheduled fund or MSI payment is due
import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrencyShort } from '../utils';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function PendingFundCard({ fund, status, onPress, theme }) {
    const isOverdue = status === 'overdue';
    const isMSI = fund.type === 'msi';
    const styles = useMemo(() => createStyles(theme), [theme]);

    const dateLabel = isOverdue
        ? `Venció el ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`
        : `Próximo ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`;

    // Same two fixed-meaning accents as the rest of Home: MSI is an
    // expense (moneyOut), a pending fund to collect is moneyIn.
    // Overdue doesn't get a third hue — it just goes solid instead of
    // soft, so urgency reads as weight, not a new color.
    const accentColor = isMSI ? theme.moneyOut : theme.moneyIn;
    const iconBg = isOverdue
        ? accentColor
        : (isMSI ? theme.moneyOutSoft : theme.moneyInSoft);
    const iconColor = isOverdue ? theme.brandOn : accentColor;

    return (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: accentColor }]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            {/* Colored icon box */}
            <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                <Text style={[styles.iconGlyph, { color: iconColor }]}>
                    {isMSI ? 'M' : '↓'}
                </Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>{fund.name}</Text>
                    {isMSI && (
                        <View style={styles.msiBadge}>
                            <Text style={styles.msiBadgeText}>
                                {fund.paidMonths + 1}/{fund.months}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.subtitle, isOverdue && { color: accentColor }]}>
                    {dateLabel}
                </Text>
            </View>

            {/* Amount */}
            <Text style={[styles.amount, { color: accentColor }]}>
                {isMSI ? '−' : '+'}{formatCurrencyShort(isMSI ? fund.monthlyAmount : fund.amount)}
            </Text>
        </TouchableOpacity>
    );
}

function createStyles(theme) {
    return StyleSheet.create({
        card: {
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            marginBottom: Spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            borderLeftWidth: 3,
            borderWidth: 1,
            borderColor: theme.border,
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
            color: theme.ink,
            flex: 1,
        },
        msiBadge: {
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: Radius.full,
            backgroundColor: theme.ink,
        },
        msiBadgeText: {
            fontSize: FontSize.xs - 1,
            fontWeight: '800',
            color: theme.bg,
            letterSpacing: 0.3,
        },
        subtitle: {
            fontSize: FontSize.xs,
            color: theme.muted,
            fontWeight: '500',
        },
        amount: {
            fontSize: FontSize.md,
            fontWeight: '900',
            letterSpacing: -0.5,
        },
    });
}