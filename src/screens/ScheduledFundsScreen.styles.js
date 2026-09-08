// ScheduledFundsScreen styles — header, secciones, pastillas, vacíos,
// hojas y botones vienen de components/ui. Aquí queda la tarjeta de
// fondo, que es lo único propio de esta pantalla.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createScheduledFundsStyles(theme) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: 'transparent' },

        emptyWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

        sheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },

        filterRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.md,
        },

        list: { paddingHorizontal: Spacing.lg },

        // Tarjeta de fondo. El borde de urgencia lo pone la pantalla
        // con el acento del tipo; aquí solo va la caja.
        fundCard: {
            borderRadius: Radius.md,
            padding: Spacing.md,
            marginBottom: Spacing.sm + 2,
            ...Shadow.card,
        },
        // Mismo aviso de "pendiente, nada se ha movido todavía" que usa
        // PendingFundCard en Inicio: punteado en vez de sólido, sin
        // cambiar el color. GlassCard detecta el borderStyle punteado y
        // lo dibuja con un <Rect strokeDasharray> de SVG, porque Android
        // no renderiza borderStyle:'dashed' junto con borderRadius.
        fundCardPending: {
            borderStyle: 'dashed',
        },

        fundTop: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 2,
        },
        fundIconBox: {
            width: 30,
            height: 30,
            borderRadius: Radius.xs,
            justifyContent: 'center',
            alignItems: 'center',
        },
        fundName: {
            flex: 1,
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.2,
        },

        fundMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            marginTop: Spacing.sm + 2,
        },
        fundBadge: {
            paddingHorizontal: Spacing.sm,
            paddingVertical: 3,
            borderRadius: Radius.full,
            borderWidth: 1,
            borderColor: theme.border,
        },
        fundBadgeText: {
            fontSize: FontSize.xs - 1,
            fontWeight: '700',
            color: theme.inkMid,
            letterSpacing: 0.3,
        },
        fundMetaText: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '500' },
        fundMetaTextOverdue: { color: theme.moneyOut, fontWeight: '700' },

        fundActions: {
            flexDirection: 'row',
            gap: Spacing.lg,
            marginTop: Spacing.md,
            paddingTop: Spacing.sm + 2,
            borderTopWidth: 1,
            borderTopColor: theme.border,
        },
        // Acción terciaria dentro de una tarjeta: texto + icono, sin
        // caja. Un Button aquí competiría con el contenido.
        linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
        linkBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: theme.inkMid },

        bottomPadding: { height: Spacing.xl + Spacing.lg },
    });
}