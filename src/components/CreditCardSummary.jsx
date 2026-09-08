// Tarjeta de crédito resumida para Inicio: nombre, próxima fecha
// (corte o pago, la más cercana), deuda, límite y barra de uso. Todo
// lo que la card completa decía antes, sin el aire: ~70 px en vez de
// ~110. Si la fecha cae dentro de URGENT_DAYS, la línea se pinta en
// ámbar y la card gana un filo del mismo color, igual que
// PendingFundCard marca lo vencido.
//
// Es tocable: onPress lleva a esa tarjeta en Tarjetas.
//
// Si recibe `others` (las demás tarjetas), debajo de la barra aparece
// una línea tenue "N tarjetas más ⌄" dentro del mismo padding: sin
// banda, sin fondo, sin filo. Tocarla despliega una fila por tarjeta
// dentro de la misma card; tocar una fila la manda a `onSelectOther`
// (Inicio la sube a principal) y la lista se cierra. Un solo cuerpo.
import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius } from '../constants';
import { getCardUrgency, inDaysLabel } from '../utils';
import GlassCard from './GlassCard';
import Money from './Money';
import { IconChevronDown, IconChevronUp, IconSize } from './Icons';

const EDGE_RADIUS = 4;
const EDGE_WIDTH = 2;

export default function CreditCardSummary({ card, theme, onPress, others = [], onSelectOther }) {
    const urgency = useMemo(() => getCardUrgency(card), [card]);
    const [open, setOpen] = useState(false);
    const styles = useMemo(() => createStyles(theme, urgency.urgent), [theme, urgency.urgent]);

    const pct = card.limit > 0 ? Math.min(Math.round((card.currentDebt / card.limit) * 100), 100) : 0;

    // Una sola línea de fechas. Si algo urge, esa fecha va primero y
    // en relativo ("corte en 3 días"); la otra queda en absoluto.
    let dateLine;
    if (urgency.cutoffUrgent && (!urgency.paymentUrgent || urgency.cutoffIn <= urgency.paymentIn)) {
        dateLine = `Corte ${inDaysLabel(urgency.cutoffIn)}` + (card.paymentDay ? ` · pago día ${card.paymentDay}` : '');
    } else if (urgency.paymentUrgent) {
        dateLine = `Pago límite ${inDaysLabel(urgency.paymentIn)}` + (card.cutoffDay ? ` · corte día ${card.cutoffDay}` : '');
    } else {
        const parts = [];
        if (card.cutoffDay) parts.push(`Corte día ${card.cutoffDay}`);
        if (card.paymentDay) parts.push(`pago día ${card.paymentDay}`);
        dateLine = parts.join(' · ');
    }

    return (
        <GlassCard style={styles.card}>
            {urgency.urgent && <View style={styles.edge} pointerEvents="none" />}
            <TouchableOpacity
                style={styles.touchable}
                onPress={onPress}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${card.name}, deuda ${card.currentDebt}, ${dateLine}`}
            >
                <View style={styles.top}>
                    <View style={styles.left}>
                        <View style={styles.nameRow}>
                            <View style={[styles.dot, { backgroundColor: card.color || theme.cashTone }]} />
                            <Text style={styles.name} numberOfLines={1}>{card.name}</Text>
                        </View>
                        {!!dateLine && (
                            <Text style={[styles.dateLine, urgency.urgent && styles.dateLineUrgent]} numberOfLines={1}>
                                {dateLine}
                            </Text>
                        )}
                    </View>

                    <View style={styles.right}>
                        <Money value={card.currentDebt} size={FontSize.md} color={theme.moneyOut} />
                        <View style={styles.limitRow}>
                            <Text style={styles.meta}>de </Text>
                            <Money value={card.limit} size={FontSize.xs} color={theme.inkDim} decimals={false} />
                            <Text style={styles.meta}> · {pct}%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.track}>
                    <View style={[styles.fill, { width: `${pct}%` }]} />
                </View>
            </TouchableOpacity>

            {others.length > 0 && (
                <>
                    <TouchableOpacity
                        style={styles.footer}
                        onPress={() => setOpen(o => !o)}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: open }}
                        accessibilityLabel={open ? 'Ocultar otras tarjetas' : `Ver ${others.length} tarjetas más`}
                    >
                        <Text style={styles.footerText}>
                            {open
                                ? 'Otras tarjetas'
                                : `${others.length} ${others.length === 1 ? 'tarjeta más' : 'tarjetas más'}`}
                        </Text>
                        {open
                            ? <IconChevronUp color={theme.inkDim} size={IconSize.sm} />
                            : <IconChevronDown color={theme.inkDim} size={IconSize.sm} />}
                    </TouchableOpacity>

                    {open && others.map((other, i) => (
                        <OtherCardRow
                            key={other.id}
                            card={other}
                            theme={theme}
                            styles={styles}
                            last={i === others.length - 1}
                            onPress={() => { setOpen(false); onSelectOther?.(other); }}
                        />
                    ))}
                </>
            )}
        </GlassCard>
    );
}

// Fila de la lista desplegada: color, nombre, corte y deuda. Si la
// tarjeta urge, punto y fecha van en ámbar.
function OtherCardRow({ card, theme, styles, onPress, last }) {
    const urgency = getCardUrgency(card);
    const dateText = urgency.cutoffUrgent
        ? `corte ${inDaysLabel(urgency.cutoffIn)}`
        : urgency.paymentUrgent
            ? `pago ${inDaysLabel(urgency.paymentIn)}`
            : card.cutoffDay ? `corte día ${card.cutoffDay}` : '';
    return (
        <TouchableOpacity
            style={[styles.otherRow, last && styles.otherRowLast]}
            onPress={onPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Ver ${card.name}, deuda ${card.currentDebt}`}
        >
            <View style={[styles.dot, { backgroundColor: urgency.urgent ? theme.moneyOut : (card.color || theme.cashTone) }]} />
            <Text style={styles.otherName} numberOfLines={1}>{card.name}</Text>
            {!!dateText && (
                <Text style={[styles.otherDate, urgency.urgent && styles.dateLineUrgent]} numberOfLines={1}>{dateText}</Text>
            )}
            <Money value={card.currentDebt} size={FontSize.sm} color={theme.moneyOut} decimals={false} />
        </TouchableOpacity>
    );
}

function createStyles(theme, urgent) {
    return StyleSheet.create({
        card: {
            borderRadius: Radius.md,
            borderTopLeftRadius: urgent ? EDGE_RADIUS : Radius.md,
            borderBottomLeftRadius: urgent ? EDGE_RADIUS : Radius.md,
            marginBottom: Spacing.sm,
        },
        // Filo ámbar del lado izquierdo, mismo truco que PendingFundCard.
        edge: {
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: EDGE_WIDTH,
            backgroundColor: theme.moneyOut,
        },
        touchable: {
            paddingVertical: Spacing.sm + 2,
            paddingHorizontal: Spacing.md,
        },
        top: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: Spacing.sm,
        },
        left: { flex: 1, minWidth: 0 },
        nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        dot: { width: 8, height: 8, borderRadius: 2 },
        name: {
            fontSize: FontSize.sm + 0.5,
            fontWeight: '700',
            color: theme.ink,
            flexShrink: 1,
        },
        dateLine: {
            marginTop: 3,
            fontSize: FontSize.xs,
            color: theme.inkMid,
            fontWeight: '500',
        },
        dateLineUrgent: {
            color: theme.moneyOut,
            fontWeight: '700',
        },
        right: { alignItems: 'flex-end' },
        limitRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
        meta: { fontSize: FontSize.xs, color: theme.inkDim },
        track: {
            height: 4,
            backgroundColor: theme.border,
            borderRadius: 2,
            overflow: 'hidden',
            marginTop: Spacing.sm,
        },
        fill: {
            height: '100%',
            backgroundColor: theme.moneyOut,
            borderRadius: 2,
        },

        // Línea tenue bajo la barra, dentro del mismo padding de la card:
        // sin banda, sin fondo, sin filo. Mismo material que el resto.
        footer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            paddingTop: Spacing.xs + 2,
            paddingBottom: Spacing.sm,
            paddingHorizontal: Spacing.md,
            marginTop: -Spacing.xs,
        },
        footerText: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: theme.inkDim,
        },
        // Filas desplegadas: mismo fondo, separadas solo por aire.
        otherRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: Spacing.xs + 2,
            paddingHorizontal: Spacing.md,
        },
        otherRowLast: { paddingBottom: Spacing.sm + 2 },
        otherName: {
            flex: 1,
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.ink,
        },
        otherDate: {
            fontSize: FontSize.xs,
            color: theme.inkMid,
            fontWeight: '500',
        },
    });
}