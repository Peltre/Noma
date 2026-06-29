// Stylesheet for scheduled funds screen
import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.mid,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: FontSize.lg,
        color: Colors.ink,
        fontWeight: '600',
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.ink,
    },
    listContainer: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    fundCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.md,
        padding: Spacing.md,
        ...Shadow.card,
    },
    fundTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    fundName: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.ink,
    },
    fundAmount: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.teal,
    },
    fundMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        alignItems: 'center',
    },
    fundMetaBadge: {
        backgroundColor: Colors.tealLt,
        borderRadius: Radius.full,
        paddingVertical: 2,
        paddingHorizontal: Spacing.sm,
    },
    fundMetaBadgeText: {
        fontSize: FontSize.xs,
        color: Colors.teal,
        fontWeight: '600',
    },
    fundMetaText: {
        fontSize: FontSize.xs,
        color: Colors.muted,
    },
    deleteBtn: {
        marginTop: Spacing.sm,
        alignItems: 'flex-end',
    },
    deleteBtnText: {
        fontSize: FontSize.xs,
        color: Colors.coral,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.mid,
        marginHorizontal: Spacing.lg,
        marginVertical: Spacing.lg,
    },
    formSection: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    formTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.ink,
        marginBottom: Spacing.sm,
    },
    fieldGroup: { gap: Spacing.xs },
    fieldLabel: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.ink,
        borderWidth: 1,
        borderColor: Colors.mid,
        ...Shadow.card,
    },
    frequencyRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    frequencyBtn: {
        flex: 1,
        padding: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.mid,
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    frequencyBtnActive: {
        backgroundColor: Colors.tealLt,
        borderColor: Colors.teal,
    },
    frequencyBtnText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.muted,
    },
    frequencyBtnTextActive: {
        color: Colors.teal,
    },
    accountList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    accountOption: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.mid,
        backgroundColor: Colors.white,
        ...Shadow.card,
    },
    accountOptionSelected: {
        backgroundColor: Colors.ink,
        borderColor: Colors.ink,
    },
    accountOptionText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.ink,
    },
    confirmBtn: {
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    confirmBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: Spacing.md,
    },
    emptyEmoji: { fontSize: 48 },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.muted,
    },
    emptySubtext: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },
    bottomPadding: { height: Spacing.xl },
});