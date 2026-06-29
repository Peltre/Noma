// HistoryScreen styles
import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper, // paper covers empty space below content
    },

    // Dark hero 
    hero: {
        backgroundColor: Colors.ink,
        padding: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
        position: 'relative',
        overflow: 'hidden',
    },
    // Diagonal bar 1
    heroBar1: {
        position: 'absolute',
        width: 2, height: 120,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: -10, right: 60,
        transform: [{ rotate: '20deg' }],
    },
    // Diagonal bar 2
    heroBar2: {
        position: 'absolute',
        width: 2, height: 180,
        backgroundColor: 'rgba(255,255,255,0.04)',
        top: -20, right: 90,
        transform: [{ rotate: '20deg' }],
    },
    // Diagonal bar 3 — widest, faintest
    heroBar3: {
        position: 'absolute',
        width: 3, height: 220,
        backgroundColor: 'rgba(107,84,196,0.12)',
        top: -30, right: 120,
        transform: [{ rotate: '20deg' }],
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: -1.2,
        marginBottom: 4,
        zIndex: 2,
    },
    heroSub: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: '500',
        marginBottom: Spacing.lg,
        textTransform: 'capitalize',
        zIndex: 2,
    },

    // Stats row inside hero
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        zIndex: 2,
    },
    statCell: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: Radius.sm,
        padding: Spacing.sm + 2,
    },
    statCellMid: {
        // middle cell — no special treatment needed
    },
    statVal: {
        fontSize: FontSize.md,
        fontWeight: '900',
        letterSpacing: -0.6,
        marginBottom: 3,
    },
    statLbl: {
        fontSize: FontSize.xs - 1,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.28)',
    },

    // Filters
    filterWrap: {
        paddingVertical: Spacing.md,
        paddingLeft: Spacing.lg,
        backgroundColor: '#EDEBE4',   // slightly cooler than paper
    },
    filterRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingRight: Spacing.lg,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.mid,
        backgroundColor: Colors.white,
    },
    chipActive: {
        backgroundColor: Colors.ink,
        borderColor: Colors.ink,
    },
    chipText: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: Colors.muted,
        letterSpacing: 0.3,
    },
    chipTextActive: { color: Colors.white },

    // Month label
    monthLabel: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xs,
        fontSize: FontSize.xs - 1,
        fontWeight: '900',
        color: Colors.muted,
        letterSpacing: 2,
        textTransform: 'uppercase',
        backgroundColor: '#EDEBE4',
    },

    // Transaction card
    txnCard: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
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
    txnRowLast: { borderBottomWidth: 0 },
    txnInfo: { flex: 1 },
    txnName: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.ink,
        marginBottom: 2,
    },
    txnDate: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        fontWeight: '500',
    },
    txnRight: { alignItems: 'flex-end', gap: 4 },
    txnAmount: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    amountPos: { color: Colors.teal },
    amountNeg: { color: Colors.ink },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: '#EDEBE4',
    },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.muted,
    },
    emptySub: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        marginTop: Spacing.xs,
    },
});