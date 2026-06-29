// Stylesheet for TransactionScreens

import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.warmMid,
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

    // Type
    typeRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    typeBtn: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
        backgroundColor: Colors.white,
        gap: 4,
    },
    typeEmoji: { fontSize: 18 },
    typeLabel: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.muted,
    },

    // Amount
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.warmMid,
        marginBottom: Spacing.md,
        gap: Spacing.xs,
    },
    currencySymbol: {
        fontSize: 36,
        fontWeight: '300',
        color: Colors.muted,
    },
    amountInput: {
        fontSize: 52,
        fontWeight: '700',
        color: Colors.ink,
        minWidth: 120,
        textAlign: 'center',
    },

    // Fields
    fieldContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    fieldLabel: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: Spacing.sm,
    },
    reasonInput: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.ink,
        borderWidth: 1,
        borderColor: Colors.warmMid,
        ...Shadow.card,
    },

    // Categories
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    categoryItem: {
        width: '22%',
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
        backgroundColor: Colors.white,
        gap: 4,
        ...Shadow.card,
    },
    categoryEmoji: { fontSize: 22 },
    categoryLabel: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Account
    creditToggle: {
        marginBottom: Spacing.sm,
    },
    creditToggleText: {
        fontSize: FontSize.sm,
        color: Colors.ink,
        fontWeight: '500',
    },
    accountList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    accountOption: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
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

    // Confirm
    confirmBtn: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        padding: Spacing.md,
        borderRadius: Radius.sm,
        alignItems: 'center',
    },
    confirmText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: '700',
    },

    bottonPadding: { height: Spacing.xl },

    // MSI preview banner
    msiPreview: {
        marginHorizontal: 24,
        marginBottom: 12,
        backgroundColor: '#EEE8F7',
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 3,
        borderLeftColor: '#6B5B9E',
    },
    msiPreviewText: {
        fontSize: 14,
        color: '#0F0E0C',
        fontWeight: '600',
    },
    msiPreviewAmount: {
        color: '#6B5B9E',
        fontWeight: '700',
    },
    msiPreviewSub: {
        fontSize: 12,
        color: '#8C8880',
        marginTop: 4,
    },

    // MSI month selector
    msiMonthsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    msiMonthBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E8E2D5',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    msiMonthBtnActive: {
        backgroundColor: '#6B5B9E',
        borderColor: '#6B5B9E',
    },
    msiMonthText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8C8880',
    },
    msiMonthTextActive: {
        color: '#FFFFFF',
    },

    // Credit & MSI toggles (checkbox style)
    creditToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    creditToggleText: {
        fontSize: 14,
        color: '#0F0E0C',
        fontWeight: '500',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#E8E2D5',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#0F0E0C',
        borderColor: '#0F0E0C',
    },
    checkboxActiveMsi: {
        backgroundColor: '#6B5B9E',
        borderColor: '#6B5B9E',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
})