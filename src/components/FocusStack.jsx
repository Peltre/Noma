// FocusStack — cards for ONE type (débito or crédito) stacked wallet-fan
// style. Tap a peeking card to bring it to the front slot; tap the
// front card to open its detail sheet.
//
// Every card renders at the same size — "growing" is really just "no
// longer covered by the card in front", so only position (translateY)
// animates. The amount's visibility is driven by its own opacity
// animation tied to focus state (see CardFace's `amountOpacity`), not
// by paint order — that's what stops it flashing/duplicating mid-animation.
import { useEffect, useRef, useMemo } from 'react';
import { View, Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import CardFace, { CARD_LARGE_HEIGHT } from './CardFace';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { Radius, Shadow } from '../constants';

// How much of a covered card peeks above the one in front of it.
const REVEAL = 44;
const SLOT_STEP = REVEAL; // vertical distance between consecutive slots
const ANIM_MS = 380;

// Pulls the name/badge row up on a peeking (non-focused) card,
// canceling part of CardFace's top padding. Bigger negative = higher up.
const PEEK_HEADER_OFFSET = -10;

export default function FocusStack({ cards, focusedId, onFocusChange, onOpenDetail, onLongPressCard, savingsAccounts = [] }) {
    // One Animated.Value per card id, reused across renders so
    // they animate FROM wherever they currently are, not from zero.
    const posAnims = useRef(new Map());
    const opacityAnims = useRef(new Map());
    const cardRefs = useRef(new Map());

    // Non-focused cards keep their relative order; the focused one is
    // always slotted last, so it paints on top (later siblings win in RN).
    const order = useMemo(() => {
        if (cards.length === 0) return [];
        const validFocusId = cards.some(c => c.id === focusedId) ? focusedId : cards[cards.length - 1].id;
        const front = cards.find(c => c.id === validFocusId);
        const rest = cards.filter(c => c.id !== validFocusId);
        return [...rest, front];
    }, [cards, focusedId]);

    const resolvedFocusedId = order.length ? order[order.length - 1].id : null;

    // Every card needs its Animated.Values before we read them below —
    // new cards start already docked at their slot, no entrance animation.
    order.forEach((card, slot) => {
        if (!posAnims.current.has(card.id)) {
            posAnims.current.set(card.id, new Animated.Value(slot * SLOT_STEP));
        }
        if (!opacityAnims.current.has(card.id)) {
            opacityAnims.current.set(card.id, new Animated.Value(card.id === resolvedFocusedId ? 1 : 0));
        }
    });

    // When the order changes, animate every card to its new slot and
    // cross-fade the amount from the old front card to the new one.
    useEffect(() => {
        const animations = order.map((card, slot) => {
            const isFocused = card.id === resolvedFocusedId;
            const posAnim = posAnims.current.get(card.id);
            const opacityAnim = opacityAnims.current.get(card.id);
            return Animated.parallel([
                Animated.timing(posAnim, {
                    toValue: slot * SLOT_STEP,
                    duration: ANIM_MS,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: isFocused ? 1 : 0,
                    duration: isFocused ? 300 : 150,
                    delay: isFocused ? 120 : 0,
                    useNativeDriver: true,
                }),
            ]);
        });
        Animated.parallel(animations).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedFocusedId, cards.length]);

    const containerHeight = order.length
        ? CARD_LARGE_HEIGHT + (order.length - 1) * SLOT_STEP
        : 0;

    if (order.length === 0) return null;

    return (
        <View style={{ height: containerHeight }}>
            {order.map((card, slot) => {
                const isCredit = card.cardType === 'credit';
                const isFocused = card.id === resolvedFocusedId;
                const pct = isCredit && card.limit > 0
                    ? Math.min(Math.round((card.currentDebt / card.limit) * 100), 100)
                    : undefined;

                // Apartados linked to this account — n/a for crédito (debt isn't earmarkable).
                const linkedApartados = isCredit ? [] : savingsAccounts.filter(sa => sa.linkedAccountId === card.id);
                const earmarkedTotal = linkedApartados.reduce((s, sa) => s + sa.earmarkedAmount, 0);
                const savingsBadge = earmarkedTotal > 0
                    ? `${formatCurrencyShort(earmarkedTotal)}${linkedApartados.length > 1 ? ` ·${linkedApartados.length}` : ''}`
                    : undefined;

                return (
                    <Animated.View
                        key={card.id}
                        ref={(r) => { if (r) cardRefs.current.set(card.id, r); }}
                        style={[
                            styles.slot,
                            Shadow.float,
                            {
                                zIndex: slot,
                                elevation: slot + 1, // Android paints by elevation, not DOM order
                                transform: [{ translateY: posAnims.current.get(card.id) }],
                            },
                        ]}
                    >
                        <TouchableWithoutFeedback
                            onPress={() => (isFocused ? onOpenDetail(card) : onFocusChange(card.id))}
                            onLongPress={() => {
                                const node = cardRefs.current.get(card.id);
                                if (!node) return onLongPressCard(card, null);
                                node.measureInWindow((x, y, width, height) => {
                                    onLongPressCard(card, { x, y, width, height });
                                });
                            }}
                            delayLongPress={420}
                        >
                            <View>
                                <CardFace
                                    name={card.name}
                                    type={card.cardType}
                                    color={card.color}
                                    pattern={card.pattern}
                                    variant="preview"
                                    valueLabel={isCredit ? 'DEUDA' : 'SALDO'}
                                    valueText={formatCurrency(isCredit ? card.currentDebt : card.balance)}
                                    progressPct={pct}
                                    amountOpacity={opacityAnims.current.get(card.id)}
                                    headerOffsetY={isFocused ? undefined : PEEK_HEADER_OFFSET}
                                    savingsBadge={isFocused ? savingsBadge : undefined}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    slot: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        borderRadius: Radius.lg,
    },
});