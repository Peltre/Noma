// Alert card shown on Home when a scheduled fund or MSI payment is
// due — deliberately NOT styled like a transaction row, but also not
// a loud colored banner: the card itself is neutral/gray, same
// language as any other card. "Pending, needs attention" now comes
// through the dashed border and the wording/weight of the date label
// ("Venció" in bold ink vs. "Próximo" in muted) rather than a warning
// icon — the calendar glyph already says "this is scheduled", a
// triangle on top of it read as one signal too many.
import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrencyShort } from '../utils';
import { FontSize, Spacing, Radius } from '../constants';
import { IconCalendarClock, IconChevronRight } from './Icons';
import GlassCard from './GlassCard';

export default function PendingFundCard({ fund, status, onPress, theme }) {
    const isOverdue = status === 'overdue';
    const isMSI = fund.type === 'msi';
    const styles = useMemo(() => createStyles(theme), [theme]);

    const dateLabel = isOverdue
        ? `Venció · ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`
        : `Próximo · ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`;

    // One icon for the whole section — MSI and income pending funds
    // are both "programado" here; which direction the money goes is
    // already conveyed by the title, the +/− prefix, and the amount,
    // so the icon's job is just "this is scheduled", not "this is
    // MSI vs. income".
    const Icon = IconCalendarClock;

    return (
        <GlassCard style={styles.card}>
            <TouchableOpacity style={styles.cardTouchable} onPress={onPress} activeOpacity={0.75}>
                <View style={styles.iconBox}>
                    <Icon color={theme.muted} size={15} />
                </View>

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
                    <Text style={[styles.subtitle, isOverdue && styles.subtitleOverdue]} numberOfLines={1}>
                        {dateLabel}
                    </Text>
                </View>

                <View style={styles.right}>
                    <Text style={styles.amount}>
                        {isMSI ? '−' : '+'}{formatCurrencyShort(isMSI ? fund.monthlyAmount : fund.amount)}
                    </Text>
                    <IconChevronRight color={theme.muted} size={13} />
                </View>
            </TouchableOpacity>
        </GlassCard>
    );
}

function createStyles(theme) {
    return StyleSheet.create({
        // GlassCard supplies background/border now — this only keeps
        // the shape (radius, spacing) and the dashed borderStyle,
        // which layers fine on top of GlassCard's own themed border
        // color since they're independent style properties.
        card: {
            borderRadius: Radius.sm,
            marginBottom: Spacing.sm,
            borderStyle: 'dashed',
        },
        cardTouchable: {
            paddingVertical: Spacing.sm + 2,
            paddingHorizontal: Spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
        },
        iconBox: {
            width: 32, height: 32,
            borderRadius: Radius.sm,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            backgroundColor: theme.border,
        },
        info: { flex: 1 },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
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
            backgroundColor: theme.border,
        },
        msiBadgeText: {
            fontSize: FontSize.xs - 1,
            fontWeight: '800',
            color: theme.muted,
            letterSpacing: 0.3,
        },
        subtitle: {
            fontSize: FontSize.xs,
            color: theme.muted,
            fontWeight: '600',
            marginTop: 1,
        },
        subtitleOverdue: {
            color: theme.ink,
            fontWeight: '700',
        },
        right: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        amount: {
            fontSize: FontSize.sm,
            fontWeight: '800',
            color: theme.ink,
            letterSpacing: -0.4,
        },
    });
}