// SettingsScreen styles — header, secciones, botones y la hoja de
// moneda vienen de components/ui. Lo que queda aquí es la fila de
// ajuste (icono · etiqueta+valor · acción), que es el único patrón
// propio de esta pantalla.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createSettingsStyles(theme) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: 'transparent' },
        scroll: { flex: 1, backgroundColor: 'transparent' },

        section: {
            paddingHorizontal: Spacing.lg,
            marginBottom: Spacing.sm,
        },

        card: {
            borderRadius: Radius.md,
            ...Shadow.card,
        },

        // Fila de ajuste
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            gap: Spacing.md,
        },
        rowLast: { borderBottomWidth: 0 },
        rowIcon: {
            width: 38, height: 38,
            borderRadius: Radius.xs,
            backgroundColor: theme.brandSoft,
            justifyContent: 'center', alignItems: 'center',
        },
        rowInfo: { flex: 1 },
        rowLabel: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            fontWeight: '600',
            marginBottom: 2,
        },
        rowValue: {
            fontSize: FontSize.md,
            fontWeight: '600',
            color: theme.ink,
        },
        rowInput: {
            fontSize: FontSize.md,
            fontWeight: '600',
            color: theme.ink,
            padding: 0,
        },
        rowAction: { padding: Spacing.xs },

        actions: { flexDirection: 'row', marginTop: Spacing.md },

        // Destructivo reusa moneyOut — no hay un tono "danger" aparte
        // en el sistema (misma regla que el borrar de Historial).
        dangerIcon: {
            width: 38, height: 38,
            borderRadius: Radius.xs,
            backgroundColor: theme.moneyOutSoft,
            justifyContent: 'center', alignItems: 'center',
        },
        dangerLabel: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.moneyOut,
            marginBottom: 2,
        },

        // Lista dentro de la hoja de moneda
        pickerList: {
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.inputFill,
            overflow: 'hidden',
            marginTop: Spacing.sm,
        },
        pickerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            gap: Spacing.md,
        },
        pickerName: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
            marginBottom: 2,
        },
        pickerDesc: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '500' },
        radio: {
            width: 22, height: 22, borderRadius: 11,
            borderWidth: 1.5,
            borderColor: theme.border,
            justifyContent: 'center', alignItems: 'center',
        },
        radioActive: {
            backgroundColor: theme.brand,
            borderColor: theme.brand,
        },

        convertingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            marginTop: Spacing.lg,
        },
        convertingText: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.inkMid,
        },

        versionText: {
            textAlign: 'center',
            fontSize: FontSize.xs,
            color: theme.inkDim,
            marginTop: Spacing.md,
            fontWeight: '500',
        },
        bottomPadding: { height: Spacing.xl },
    });
}