// FocusStack — cards for ONE type (débito or crédito) stacked behind
// each other, wallet-fan style, exactly like Tarjetas already had.
// The only new behavior: tap a card that's peeking behind the front
// one and it's reordered to the front slot; tap the front card and
// it opens the full detail sheet. The card that used to be in front
// slides back and takes whatever slot the tapped card is vacating.
//
// Every card is always rendered at the same size (CardFace's
// "preview"/large size) — nothing ever grows or shrinks. "Growing"
// is really just "no longer being covered by the card that used to
// sit in front of it", so the only thing that ever animates is
// position (translateY). The amount (SALDO/DEUDA) visibility is
// driven independently by its own opacity animation tied to focus
// state, not by whichever card happens to be painted on top — see
// the comment on CardFace's `amountOpacity` prop for why that
// distinction matters (it's what stops the amount from flashing/
// duplicating mid-animation).
import { useEffect, useRef, useMemo } from 'react';
import { View, Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import CardFace, { CARD_LARGE_HEIGHT } from './CardFace';
import { formatCurrency, formatCurrencyShort } from '../utils';
import { Radius, Shadow } from '../constants';

// How much of a covered card peeks out above the one in front of it.
// Same idea as the old STACK_PEEK in CardsScreen.jsx, just bigger
// now that the front card is full preview-size instead of grid-size.
const REVEAL = 44;
const SLOT_STEP = REVEAL; // vertical distance between consecutive slots
const ANIM_MS = 380;

// How far to pull the name/badge row up on a peeking (non-focused)
// card — negative moves it toward the top edge. The card's own top
// padding (Spacing.lg = 24, see CardFace.jsx's cardLarge style) is
// what pushes the name down in the first place; this just cancels
// part of that, only for cards that aren't focused. Tune this one
// number to move it — bigger negative = higher up.
const PEEK_HEADER_OFFSET = -10;

export default function FocusStack({ cards, focusedId, onFocusChange, onOpenDetail, onLongPressCard, savingsAccounts = [] }) {
    // One Animated.Value per card id for position, one for amount
    // opacity — created once and reused across renders/reorders so
    // they animate FROM wherever they currently are, not from zero.
    const posAnims = useRef(new Map());
    const opacityAnims = useRef(new Map());
    const cardRefs = useRef(new Map());

    // Cards not currently focused keep their original relative order;
    // the focused one is always slotted last, which is what makes it
    // "the front of the deck" (later siblings paint on top in RN,
    // same rule the old fanned stack already relied on).
    const order = useMemo(() => {
        if (cards.length === 0) return [];
        const validFocusId = cards.some(c => c.id === focusedId) ? focusedId : cards[cards.length - 1].id;
        const front = cards.find(c => c.id === validFocusId);
        const rest = cards.filter(c => c.id !== validFocusId);
        return [...rest, front];
    }, [cards, focusedId]);

    const resolvedFocusedId = order.length ? order[order.length - 1].id : null;

    // Make sure every card in view has its Animated.Values before we
    // read them below (new cards start already docked at their slot
    // — no reason to animate something appearing for the first time).
    order.forEach((card, slot) => {
        if (!posAnims.current.has(card.id)) {
            posAnims.current.set(card.id, new Animated.Value(slot * SLOT_STEP));
        }
        if (!opacityAnims.current.has(card.id)) {
            opacityAnims.current.set(card.id, new Animated.Value(card.id === resolvedFocusedId ? 1 : 0));
        }
    });

    // Whenever the order changes (a card was brought to the front),
    // animate every card's position to its new slot, and cross-fade
    // the amount from the old front card to the new one.
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

                // Apartados linked to this specific débito account —
                // n/a for crédito, since a card in debt isn't a real
                // balance you could earmark part of.
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