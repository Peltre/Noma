// Se muestra en Inicio cuando un fondo programado o un pago MSI está
// pendiente.
//
// ── Cómo se colorea ──
// La tarjeta es VIDRIO NORMAL, igual que todas las demás de la app.
// Ninguna superficie se tiñe: el acento vive en tres sitios chicos —el
// filo de 2px del canto izquierdo, el icono, y los dígitos del monto—
// y los tres van SIEMPRE del mismo color.
//
// Y ese color solo tiene dos estados:
//
//   VIGENTE   el color de su tipo. Turquesa si es un ingreso que va a
//             llegar, violeta si es una mensualidad que va a salir.
//   VENCIDO   gris. Todo lo que estaba a color se apaga de golpe:
//             filo, icono, monto, insignia y fecha.
//
// Esa es la idea completa: el color significa "esto todavía está en
// pie". Un fondo que se le pasó la fecha pierde el color porque perdió
// vigencia, no porque haya que alarmarse — de ahí que el gris y no el
// ámbar, que en este tema significa "sale hoy".
//
// El gris es theme.alert, que themes.js ya documenta como la familia de
// lo programado y que casi no se usaba. Si se quiere más hundido,
// theme.inkDim es un cambio de una palabra; queda más apagado pero deja
// el monto al mismo nivel que su propio subtítulo.
import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FontSize, Spacing, Radius } from '../constants';
import { IconCalendarClock, IconChevronRight, IconSize } from './Icons';
import GlassCard from './GlassCard';
import Money from './Money';

// Fuera de la escala Radius a propósito: el filo mide 2px y con
// cualquier radio de la escala (xs son 10) se curvaría hasta leerse
// como una coma en vez de una pestaña recta. El canto derecho sí usa
// la escala.
const EDGE_RADIUS = 4;
const EDGE_WIDTH = 2;

export default function PendingFundCard({ fund, status, onPress, theme }) {
    const isOverdue = status === 'overdue';
    const isMSI = fund.type === 'msi';

    // Un solo par de valores para toda la tarjeta: el acento y su
    // versión al 14% para el fondo del icono. Vencido gana sobre el
    // tipo a propósito — es el punto de la regla.
    const tone = isOverdue ? theme.alert : isMSI ? theme.msi : theme.moneyIn;
    const toneSoft = isOverdue
        ? theme.alertSoft
        : isMSI ? theme.msiSoft : theme.moneyInSoft;
    const styles = useMemo(
        () => createStyles(theme, tone, toneSoft, isOverdue),
        [theme, tone, toneSoft, isOverdue],
    );

    const dateLabel = isOverdue
        ? `Venció · ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`
        : `Próximo · ${format(parseISO(fund.nextDate), 'd MMM', { locale: es })}`;

    return (
        <GlassCard style={styles.card}>
            <View style={styles.edge} pointerEvents="none" />
            <TouchableOpacity style={styles.cardTouchable} onPress={onPress} activeOpacity={0.75}>
                <View style={styles.iconBox}>
                    <IconCalendarClock color={tone} size={IconSize.md} />
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
                    {/* La fecha vencida sube de peso pero no de color:
                        el énfasis lo carga el 700, no un tono nuevo. */}
                    <Text style={[styles.subtitle, isOverdue && styles.subtitleOverdue]} numberOfLines={1}>
                        {dateLabel}
                    </Text>
                </View>

                <View style={styles.right}>
                    <Money
                        value={isMSI ? fund.monthlyAmount : fund.amount}
                        size={FontSize.sm + 2}
                        sign={isMSI ? '-' : '+'}
                        // El signo se queda: sigue diciendo si entra o
                        // sale aunque el color ya no lo diga.
                        color={tone}
                    />
                    <IconChevronRight color={theme.inkDim} size={IconSize.sm} />
                </View>
            </TouchableOpacity>
        </GlassCard>
    );
}

function createStyles(theme, tone, toneSoft, isOverdue) {
    return StyleSheet.create({
        // Radio asimétrico: casi recto del lado del filo, normal del
        // otro. GlassCard copia los cuatro radios a su capa de borde,
        // así que el contorno sigue la misma forma que el recorte.
        card: {
            borderTopLeftRadius: EDGE_RADIUS,
            borderBottomLeftRadius: EDGE_RADIUS,
            borderTopRightRadius: Radius.sm,
            borderBottomRightRadius: Radius.sm,
            marginBottom: Spacing.sm,
        },
        // Va como capa aparte y no como borderLeftWidth porque GlassCard
        // solo reenvía borderWidth/borderColor/borderTop* a su capa de
        // borde; un borde izquierdo acabaría debajo del desenfoque.
        edge: {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: EDGE_WIDTH,
            backgroundColor: tone,
            borderTopLeftRadius: EDGE_RADIUS,
            borderBottomLeftRadius: EDGE_RADIUS,
        },
        cardTouchable: {
            paddingVertical: Spacing.sm + 4,
            paddingHorizontal: Spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 4,
        },
        iconBox: {
            width: 36, height: 36,
            borderRadius: Radius.xs,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            backgroundColor: toneSoft,
        },
        info: { flex: 1 },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        title: {
            fontSize: FontSize.sm + 1,
            fontWeight: '600',
            color: theme.ink,
            flexShrink: 1,
        },
        // La insignia se apaga con todo lo demás: un 5/12 violeta sobre
        // una tarjeta gris sería lo único a color y llamaría más
        // atención que el propio monto.
        msiBadge: {
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: Radius.full,
            backgroundColor: isOverdue ? theme.alertSoft : theme.msiSoft,
        },
        msiBadgeText: {
            fontSize: FontSize.xs - 1.5,
            fontWeight: '800',
            color: isOverdue ? theme.alert : theme.msi,
            letterSpacing: 0.3,
        },
        subtitle: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            fontWeight: '600',
            marginTop: 2,
        },
        subtitleOverdue: {
            color: theme.alert,
            fontWeight: '700',
        },
        right: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
    });
}