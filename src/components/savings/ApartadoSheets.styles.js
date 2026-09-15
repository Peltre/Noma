// Estilos de las hojas de apartado. Viven aquí y no en
// SavingsScreen.styles.js porque estas hojas también las usa Tarjetas:
// un componente compartido que dependiera del archivo de estilos de una
// pantalla se rompería al tocar esa pantalla.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing } from '../../constants';

export default function createApartadoStyles(theme) {
    return StyleSheet.create({
        apSheetHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2, marginTop: Spacing.xs },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
        },
        colorDot: {
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
        decimalInput: {
            fontSize: FontSize.md,
            color: theme.ink,
            letterSpacing: 0.2,
            paddingVertical: 0,
        },
        decimalInputLarge: {
            fontSize: FontSize.xl,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.4,
            paddingVertical: 0,
        },
        earnedText: { fontSize: FontSize.xs - 1, color: theme.inkMid, fontWeight: '700', marginTop: 2 },
        goalDeadline: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            marginTop: 2,
            fontWeight: '500',
            textTransform: 'capitalize',
        },
        goalSheetName: { fontSize: FontSize.lg, fontWeight: '800', color: theme.ink },
        hint: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            fontWeight: '500',
            marginTop: 6,
            lineHeight: FontSize.xs * 1.45,
        },
        hintError: { color: theme.moneyOut, fontWeight: '700' },
        interestBox: {
            paddingLeft: Spacing.md,
            borderLeftWidth: 2,
            borderLeftColor: theme.glassBorderTop,
            marginTop: Spacing.xs,
        },
        legendDot: { width: 7, height: 7, borderRadius: 4 },
        legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
        legendLabel: { fontSize: FontSize.sm, color: theme.inkMid, fontWeight: '500' },
        legendRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.md,
            marginTop: Spacing.sm + 2,
        },
        percentInput: { flex: 1 },
        percentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
        percentSign: { fontSize: FontSize.sm, fontWeight: '700', color: theme.inkDim },
        pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
        preview: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md - 2,
            paddingVertical: Spacing.md,
        },
        previewName: {
            flex: 1,
            fontSize: FontSize.lg,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.3,
        },
        sheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
        sheetBtnsTight: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
        sheetGroup: { paddingHorizontal: Spacing.md, paddingVertical: 2 },
        sheetRow: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingVertical: Spacing.sm + 1, gap: Spacing.sm,
        },
        sheetRowBorder: { borderTopWidth: 1, borderTopColor: theme.border },
        sheetRowLabel: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '500' },
        sheetRowText: { fontSize: FontSize.sm, color: theme.ink, fontWeight: '600', flexShrink: 1 },
        sheetRowValue: { fontSize: FontSize.sm, color: theme.ink, fontWeight: '700' },
        sheetTitle: {
            fontSize: FontSize.lg,
            fontWeight: '800',
            color: theme.ink,
            letterSpacing: -0.3,
        },
        sheetTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            marginBottom: Spacing.xs,
        },
        splitBar: {
            flexDirection: 'row',
            gap: 2,
            height: 7,
            borderRadius: 4,
            overflow: 'hidden',
            marginTop: Spacing.md,
            backgroundColor: theme.border,
        },
        splitCommitted: { backgroundColor: theme.ink, opacity: 0.42 },
        splitFree: { backgroundColor: theme.ink },
        toggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 2,
            paddingVertical: Spacing.sm + 2,
            marginTop: Spacing.sm,
        },
        toggleText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.inkMid },
    });
}