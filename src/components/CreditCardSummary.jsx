// Tarjeta de crédito resumida para Inicio: nombre, próxima fecha
// (corte o pago, la más cercana), deuda, límite y barra de uso. Todo
// lo que la card completa decía antes, sin el aire: ~70 px en vez de
// ~110. Si la fecha cae dentro de URGENT_DAYS, la línea se pinta en
// ámbar y la card gana un filo del mismo color, igual que
// PendingFundCard marca lo vencido.
//
// Es tocable: onPress lleva a esa tarjeta en Tarjetas.
import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius } from '../constants';
import { getCardUrgency, inDaysLabel } from '../utils';
import GlassCard from './GlassCard';
import Money from './Money';

const EDGE_RADIUS = 4;
const EDGE_WIDTH = 2;

export default function CreditCardSummary({ card, theme, onPress }) {
    const urgency = useMemo(() => getCardUrgency(card), [card]);
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
        </GlassCard>
    );
}

// Versión de una línea para las tarjetas que no son la principal:
// color, nombre y deuda. Va sobre el mismo GlassCard que la principal
// (blur + glassFill + borde) para que sea el mismo material; pintar
// glassFill a mano sin el blur debajo se veía de otro color. Si urge,
// el punto y el borde van en ámbar.
export function CreditCardMini({ card, theme, onPress }) {
    const urgency = useMemo(() => getCardUrgency(card), [card]);
    const styles = useMemo(() => createMiniStyles(theme), [theme]);
    return (
        <GlassCard style={[styles.mini, urgency.urgent && styles.miniUrgent]}>
            <TouchableOpacity
                style={styles.miniInner}
                onPress={onPress}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Ver ${card.name}, deuda ${card.currentDebt}`}
            >
                <View style={[styles.dot, { backgroundColor: urgency.urgent ? theme.moneyOut : (card.color || theme.cashTone) }]} />
                <Text style={styles.name} numberOfLines={1}>{card.name}</Text>
                <Money value={card.currentDebt} size={FontSize.xs + 1} color={theme.moneyOut} decimals={false} />
            </TouchableOpacity>
        </GlassCard>
    );
}

function createMiniStyles(theme) {
    return StyleSheet.create({
        // Ancho al contenido, no al reparto de la fila: una mini mide lo
        // que mide su nombre + su deuda. Si no caben, la fila (flexWrap)
        // las baja. GlassCard manda el radio a su capa de borde.
        mini: {
            alignSelf: 'flex-start',
            borderRadius: Radius.xs,
        },
        // GlassCard trata borderColor como override de su borde.
        miniUrgent: { borderColor: theme.moneyOut },
        miniInner: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 7,
            paddingHorizontal: 10,
        },
        dot: { width: 7, height: 7, borderRadius: 2 },
        name: {
            flexShrink: 1,
            maxWidth: 140,
            fontSize: FontSize.xs + 1,
            fontWeight: '700',
            color: theme.ink,
        },
    });
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
    });
}