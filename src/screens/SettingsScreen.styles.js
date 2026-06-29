// StyleSheet for settings

import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },
    header: {
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.ink,
    },
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: Radius.md,
        overflow: 'hidden',
        ...Shadow.card,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.mid,
        gap: Spacing.md,
    },
    fieldRowLast: {
        borderBottomWidth: 0,
    },
    fieldIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.mid,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fieldIconEmoji: { fontSize: 16 },
    fieldInfo: { flex: 1 },
    fieldLabel: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginBottom: 2,
    },
    fieldInput: {
        fontSize: FontSize.md,
        fontWeight: '500',
        color: Colors.ink,
        padding: 0,
    },
    fieldValue: {
        fontSize: FontSize.md,
        fontWeight: '500',
        color: Colors.muted,
    },
    saveBtn: {
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        alignItems: 'center',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    saveBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    versionText: {
        textAlign: 'center',
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: Spacing.md,
    },
    dangerCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.md,
        overflow: 'hidden',
        ...Shadow.card,
    },
    dangerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    dangerIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.coralLt,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dangerLabel: {
        fontSize: FontSize.md,
        fontWeight: '500',
        color: Colors.coral,
    },
    bottomPadding: { height: Spacing.xl },
});