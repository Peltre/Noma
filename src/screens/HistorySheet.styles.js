// Styles for the transaction detail/edit bottom sheet in HistoryScreen.
// Theme-driven, split out so HistoryScreen.jsx stays focused on layout.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius } from '../constants';

export default function createSheetStyles(theme) {
    return StyleSheet.create({
        backdrop: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        scrim: { ...StyleSheet.absoluteFillObject },
        panel: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            padding: Spacing.lg,
            paddingBottom: 40,
            alignItems: 'center',
        },
        handle: {
            width: 36, height: 4,
            borderRadius: 2,
            backgroundColor: theme.border,
            marginBottom: Spacing.lg,
        },
        txnIcon: {
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: Spacing.sm,
        },
        typeLabel: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: Spacing.xs,
        },
        amount: {
            fontSize: FontSize.hero,
            fontWeight: '900',
            color: theme.ink,
            letterSpacing: -1.5,
            marginBottom: Spacing.xs,
        },
        reason: {
            fontSize: FontSize.md,
            color: theme.muted,
            textAlign: 'center',
            marginBottom: Spacing.lg,
            paddingHorizontal: Spacing.md,
        },
        detailList: {
            width: '100%',
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            marginBottom: Spacing.lg,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        detailKey: { fontSize: FontSize.sm, color: theme.muted, fontWeight: '500' },
        detailVal: { fontSize: FontSize.sm, color: theme.ink, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: Spacing.md },
        fieldLabel: {
            alignSelf: 'flex-start',
            fontSize: FontSize.xs,
            fontWeight: '800',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginTop: Spacing.sm,
            marginBottom: Spacing.xs,
        },
        input: {
            width: '100%',
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            fontSize: FontSize.md,
            color: theme.ink,
            borderWidth: 1,
            borderColor: theme.border,
        },
        inputLarge: {
            fontSize: FontSize.xxl,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: Spacing.md,
        },
        btnRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            width: '100%',
            marginTop: Spacing.sm,
        },
        btnPrimary: {
            flex: 2, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.ink,
            justifyContent: 'center', alignItems: 'center',
        },
        btnPrimaryText: { fontSize: FontSize.md, fontWeight: '700', color: theme.bg },
        btnCancel: {
            flex: 1, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.border,
            justifyContent: 'center', alignItems: 'center',
        },
        btnCancelText: { fontSize: FontSize.md, fontWeight: '600', color: theme.ink },
        // Destructive action reuses moneyOut — no separate "danger" hue
        // in the theme system, and delete reads negative enough already.
        btnDanger: {
            flex: 1, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.moneyOutSoft,
            justifyContent: 'center', alignItems: 'center',
        },
        btnDangerText: { fontSize: FontSize.md, fontWeight: '700', color: theme.moneyOut },
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: theme.border,
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: Radius.full,
        },
        badgeDot: { width: 5, height: 5, borderRadius: 3 },
        badgeText: {
            fontSize: FontSize.xs - 1,
            fontWeight: '700',
            color: theme.muted,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
        },
    });
}