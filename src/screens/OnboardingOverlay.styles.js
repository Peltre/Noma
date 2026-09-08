// OnboardingOverlay styles — campos, botones y la tarjeta de vidrio
// vienen de components/ui. Aquí queda el marco de la bienvenida: el
// velo, la tarjeta centrada, los puntos de progreso y la fila de
// tarjeta de débito.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createOnboardingStyles(theme) {
    return StyleSheet.create({

        overlay: { flex: 1 },
        // El BlurView de arriba desenfoca la app; esto le baja el
        // brillo para que la tarjeta blanca no compita con el fondo.
        backdrop: {
            ...StyleSheet.absoluteFill,
            backgroundColor: 'rgba(6,8,12,0.55)',
        },
        kavWrapper: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: Spacing.lg,
        },

        card: {
            borderRadius: Radius.lg,
            padding: Spacing.lg,
            maxHeight: '86%',
            ...Shadow.float,
        },

        // Puntos de progreso
        progressRow: {
            flexDirection: 'row',
            gap: 6,
            justifyContent: 'center',
            marginBottom: Spacing.lg,
        },
        progressDot: {
            width: 7, height: 7,
            borderRadius: 4,
            backgroundColor: theme.border,
        },
        progressDotActive: { backgroundColor: theme.brand, width: 20 },

        iconBadge: {
            width: 60, height: 60,
            borderRadius: Radius.md,
            backgroundColor: theme.brandSoft,
            alignItems: 'center', justifyContent: 'center',
            alignSelf: 'center',
            marginBottom: Spacing.md,
        },
        title: {
            fontSize: FontSize.xl,
            fontWeight: '800',
            color: theme.ink,
            textAlign: 'center',
            letterSpacing: -0.4,
        },
        subtitle: {
            fontSize: FontSize.sm,
            color: theme.inkMid,
            textAlign: 'center',
            marginTop: Spacing.sm,
            lineHeight: FontSize.sm * 1.5,
            fontWeight: '500',
        },

        // DecimalInput no puede vivir dentro de <Field>: lleva
        // fieldSurface y aquí solo lo tipográfico.
        decimalInput: {
            fontSize: FontSize.md,
            color: theme.ink,
            letterSpacing: 0.2,
            paddingVertical: 0,
        },

        // Bloque de una tarjeta de débito
        accountCard: {
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: theme.border,
            padding: Spacing.md,
            marginTop: Spacing.sm,
        },
        accountCardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            marginBottom: Spacing.xs,
        },
        accountCardTitle: {
            flex: 1,
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.inkMid,
        },
        removeBtn: { fontSize: FontSize.xs, fontWeight: '700', color: theme.moneyOut },
        // Field ya trae su propio margen superior vía FieldLabel; sin
        // etiqueta hay que ponerlo a mano.
        accountField: { marginTop: Spacing.sm },

        addRow: { flexDirection: 'row', marginTop: Spacing.md },

        helperNote: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            marginTop: Spacing.sm,
            lineHeight: FontSize.xs * 1.5,
            fontWeight: '500',
        },

        bottomRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginTop: Spacing.xl,
        },
        // Mismo botón de regresar que ScreenHeader.
        backBtn: {
            width: 52, height: 52,
            borderRadius: Radius.sm,
            backgroundColor: theme.glassFill,
            borderWidth: 1, borderColor: theme.glassBorder,
            alignItems: 'center', justifyContent: 'center',
        },
    });
}