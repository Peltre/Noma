// TransactionScreen styles — el héroe se queda sobre theme.bg para
// cualquier tipo de movimiento; solo el glow, las pastillas y el
// monto cargan el acento del tipo, misma regla que en toda la app.
//
// Campos, pastillas, botones y hojas vienen de components/ui. Lo que
// queda aquí es el héroe (que es único de esta pantalla) y el panel
// de vidrio que sube desde abajo.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createTransactionStyles(theme) {
    return StyleSheet.create({

        root: { flex: 1, backgroundColor: 'transparent' },

        // Héroe
        hero: {
            backgroundColor: 'transparent',
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.lg,
            position: 'relative',
            overflow: 'hidden',
        },
        heroGlow: {
            position: 'absolute',
            width: 300, height: 300,
            borderRadius: 150,
            bottom: -100, right: -80,
        },

        heroTop: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.lg,
        },
        // Mismo botón de regresar que ScreenHeader (38, Radius.sm,
        // vidrio): esta pantalla no puede usar ScreenHeader porque su
        // título va centrado entre el back y un hueco simétrico.
        backBtn: {
            width: 38, height: 38, borderRadius: Radius.sm,
            backgroundColor: theme.glassFill,
            borderWidth: 1, borderColor: theme.glassBorder,
            justifyContent: 'center', alignItems: 'center',
        },
        heroTitle: {
            fontSize: FontSize.md, fontWeight: '700',
            color: theme.inkMid,
            letterSpacing: 0.2,
        },

        // Pastillas de tipo — dentro del héroe. Son <Pill>, así que
        // aquí solo va el reparto horizontal.
        typeRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginBottom: Spacing.lg,
        },
        typePill: { flex: 1, justifyContent: 'center' },

        // Monto — grande y centrado
        amountRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.xs,
            marginBottom: Spacing.md,
            zIndex: 2,
        },
        // Dimensionado como una proporción fija del amountInput de
        // abajo (más o menos la mitad), no como su propio escalón de
        // escala: es un acompañante decorativo de ese campo, no un rol
        // independiente.
        currencySign: {
            fontSize: 36,
            fontWeight: '300',
            lineHeight: 80,
        },
        amountInput: {
            fontSize: FontSize.input,
            fontWeight: '900',
            color: theme.ink,
            minWidth: 120,
            textAlign: 'center',
            letterSpacing: -3,
            height: 80,
            includeFontPadding: false,
            textAlignVertical: 'center',
        },

        // Aviso de MSI dentro del héroe
        msiBanner: {
            borderWidth: 1,
            borderRadius: Radius.sm,
            padding: Spacing.sm + 2,
            backgroundColor: theme.glassFill,
            marginBottom: Spacing.sm,
            zIndex: 2,
        },
        msiBannerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        msiBannerText: {
            fontSize: FontSize.sm,
            color: theme.ink,
            fontWeight: '600',
        },
        msiBannerSub: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            marginTop: 3,
            fontWeight: '500',
        },

        // Panel
        // GlassCard (sheetWrap) pone el fondo/radio de vidrio; `sheet`
        // se queda en el ScrollView para que siga scrolleando dentro
        // (GlassCard envuelve un View simple, así que el panel de
        // vidrio tiene que ser el padre del ScrollView).
        sheetWrap: {
            flex: 1,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            ...Shadow.float,
        },
        sheet: { flex: 1 },
        sheetContent: {
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xs,
        },

        pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

        fieldHint: {
            fontSize: FontSize.xs,
            color: theme.inkMid,
            fontWeight: '500',
        },
        fieldHintError: { color: theme.moneyOut, fontWeight: '700' },
        accountWarning: { marginBottom: Spacing.sm },
        hintRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: Spacing.sm,
        },

        // Casilla de verificación (crédito, MSI)
        toggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 2,
            paddingVertical: Spacing.sm + 2,
            marginBottom: Spacing.xs,
        },
        checkbox: {
            width: 20, height: 20,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: theme.border,
            alignItems: 'center', justifyContent: 'center',
        },
        toggleText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.inkMid },

        // Cuadrito de ícono en el creador de etiquetas — no es una
        // Pill porque no lleva texto: es una cuadrícula de íconos.
        iconOption: {
            width: 42, height: 42,
            borderRadius: Radius.xs,
            borderWidth: 1.5,
            alignItems: 'center', justifyContent: 'center',
        },

        // Opción dentro de la hoja "Otro tipo"
        typeOption: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
            paddingVertical: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        typeOptionDot: { width: 9, height: 9, borderRadius: 5 },
        typeOptionLabel: { fontSize: FontSize.md, fontWeight: '700', color: theme.ink },
        typeOptionDesc: { fontSize: FontSize.xs, color: theme.inkDim, marginTop: 2, fontWeight: '500' },

        actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
    });
}