// HomeScreen styles — rediseño v2
import { StyleSheet, Dimensions } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

const { width } = Dimensions.get('window');

export default StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: Colors.ink, // ink behind safe area = hero flush to top
    },
    scroll: {
        flex: 1,
        backgroundColor: Colors.paper,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.paper,
    },

    // Hero
    hero: {
        backgroundColor: Colors.ink,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg + Spacing.sm,
        position: 'relative',
        overflow: 'hidden',
    },

    // Decorative radial orbs
    // Top-right: violet orb
    heroOrbA: {
        position: 'absolute',
        width: 260, height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(107,84,196,0.16)',
        top: -90, right: -70,
    },
    // Bottom-left: teal orb — contrasts violet, hints at income
    heroOrbB: {
        position: 'absolute',
        width: 180, height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(13,139,133,0.13)',
        bottom: -50, left: -30,
    },

    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg + Spacing.sm,
        zIndex: 2,
    },
    greeting: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.38)',
        fontWeight: '500',
        marginBottom: 3,
    },
    userName: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: Colors.white,
        letterSpacing: -0.4,
    },

    avatar: {
        width: 42, height: 42,
        borderRadius: 21,
        backgroundColor: Colors.violet,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    avatarText: {
        color: Colors.white,
        fontWeight: '900',
        fontSize: FontSize.md,
        letterSpacing: -0.3,
    },

    balanceLabel: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.28)',
        marginBottom: Spacing.xs,
        zIndex: 2,
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: -2.5,
        lineHeight: 52,
        marginBottom: Spacing.lg,
        zIndex: 2,
    },

    // Account pills (inside hero)
    pillsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        zIndex: 2,
    },
    pill: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: Radius.md,
        padding: Spacing.sm + 2,
    },
    pillIconWrap: {
        width: 28, height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },

    // Icon primitives — card shape
    iconCard: {
        width: 16, height: 11,
        borderRadius: 2,
        borderWidth: 1.5,
        justifyContent: 'flex-end',
        padding: 1,
    },
    iconCardStripe: {
        height: 3,
        borderRadius: 1,
        opacity: 0.8,
    },
    // Icon primitives — circle for savings
    iconCircle: {
        width: 13, height: 13,
        borderRadius: 7,
        borderWidth: 1.5,
    },

    pillLabel: {
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 3,
    },
    pillAmount: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: Colors.white,
        letterSpacing: -0.3,
    },

    // Action buttons
    actionRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.lg,
        paddingBottom: 0,
        backgroundColor: Colors.paper,
    },
    btnPrimary: {
        flex: 1,
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.sm,
        letterSpacing: 0.2,
    },
    btnSecondary: {
        flex: 1,
        backgroundColor: Colors.mid,
        borderRadius: Radius.sm,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnSecondaryText: {
        color: Colors.ink,
        fontWeight: '600',
        fontSize: FontSize.sm,
    },

    // Sections
    section: {
        padding: Spacing.lg,
        paddingBottom: 0,
        backgroundColor: Colors.paper,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: Colors.ink,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    sectionLink: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.muted,
    },

    // Credit card
    creditCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Shadow.card,
    },
    creditCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    creditCardName: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
    },
    creditCardDebt: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: Colors.coral,
        letterSpacing: -0.3,
    },
    creditCardLimit: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        textAlign: 'right',
        marginTop: 1,
    },
    progressTrack: {
        height: 4,
        backgroundColor: Colors.mid,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: Spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.coral,
        borderRadius: 2,
    },
    creditCardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaText: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        fontWeight: '500',
    },

    // Recent transactions
    txnCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Shadow.card,
    },
    txnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.mid,
    },
    txnRowLast: {
        borderBottomWidth: 0,
    },

    // Transaction icon wrapper
    txnIconWrap: {
        width: 36, height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    txnIconGlyph: {
        fontSize: 15,
        fontWeight: '800',
    },

    txnInfo: { flex: 1 },
    txnName: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.ink,
    },
    txnSub: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 1,
    },
    txnAmount: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        letterSpacing: -0.4,
    },
    amountPos: { color: Colors.teal },
    amountNeg: { color: Colors.ink },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.muted,
    },
    emptySubText: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        marginTop: Spacing.xs,
    },

    bottomPadding: { height: Spacing.xl + Spacing.lg },
});