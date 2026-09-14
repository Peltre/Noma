// Hoja inferior de vidrio, no un panel opaco: el cielo sigue vivo
// detrás cuando el usuario abre algo.
import { useEffect, useRef } from 'react';
import {
    Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, Animated, PanResponder, useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../store/useTheme';
import { FontSize, Radius, Spacing, Shadow } from '../../constants';
import { displayFont } from '../../setup/Typography';

export default function Sheet({
    visible = true,
    onClose,
    title,
    subtitle,
    children,
    dismissable = true,
    // Para formularios largos (Ahorros): el contenido scrollea dentro
    // de la hoja en vez de crecer más allá del maxHeight y cortarse.
    scroll = false,
    style,
}) {
    const { theme } = useTheme();
    const { height: winH } = useWindowDimensions();
    const Body = scroll ? ScrollView : View;
    const bodyProps = scroll
        ? { keyboardShouldPersistTaps: 'handled', showsVerticalScrollIndicator: false }
        : {};

    // ── Animación propia ──
    // El Modal entra sin animación del sistema; la hoja sube con
    // resorte y el fondo se oscurece a la par. Al cerrar, baja y se
    // desvanece ANTES de avisar a quien la abrió (las hojas de la app
    // se montan condicionalmente, así que onClose las desmonta).
    const progress = useRef(new Animated.Value(0)).current; // 0 = fuera, 1 = en su sitio
    const drag = useRef(new Animated.Value(0)).current;     // desplazamiento del gesto
    const closing = useRef(false);

    useEffect(() => {
        if (!visible) return;
        progress.setValue(0);
        drag.setValue(0);
        closing.current = false;
        // Resorte casi crítico: llega y se asienta sin pasarse. Con
        // damping 22 / stiffness 240 rebotaba de más.
        Animated.spring(progress, {
            toValue: 1, useNativeDriver: true,
            damping: 30, stiffness: 190, mass: 1,
            overshootClamping: true,
        }).start();
    }, [visible]);

    const requestClose = () => {
        if (closing.current || !onClose) return;
        closing.current = true;
        Animated.timing(progress, { toValue: 0, duration: 190, useNativeDriver: true }).start(() => {
            onClose();
        });
    };

    // Deslizar la hoja hacia abajo (desde el asa o el título) la cierra.
    const pan = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => dismissable && g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
            onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
            onPanResponderRelease: (_, g) => {
                if (g.dy > 90 || g.vy > 1.1) {
                    requestClose();
                } else {
                    Animated.spring(drag, { toValue: 0, useNativeDriver: true, damping: 28, stiffness: 220, overshootClamping: true }).start();
                }
            },
        }),
    ).current;

    const translateY = Animated.add(
        progress.interpolate({ inputRange: [0, 1], outputRange: [winH * 0.6, 0] }),
        drag,
    );
    const scrimOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={requestClose}>
            <KeyboardAvoidingView
                style={styles.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View style={[styles.scrim, { opacity: scrimOpacity }]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={dismissable ? requestClose : undefined}
                    />
                </Animated.View>

                <Animated.View style={[styles.outer, Shadow.float, { transform: [{ translateY }] }]}>
                    <View style={styles.clip}>
                        <BlurView
                            intensity={theme.sheetIntensity}
                            tint={theme.glassTint}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.sheetFill }]} />

                        <View style={[styles.content, style]}>
                            {/* Zona de arrastre: asa + título. */}
                            <View {...pan.panHandlers} style={styles.dragZone}>
                                <View style={[styles.handle, { backgroundColor: theme.inkSoft }]} />
                                {!!title && (
                                    <Text style={[styles.title, displayFont('700'), { color: theme.ink }]}>{title}</Text>
                                )}
                                {!!subtitle && (
                                    <Text style={[styles.subtitle, { color: theme.inkMid }]}>{subtitle}</Text>
                                )}
                            </View>
                            <Body {...bodyProps}>{children}</Body>
                        </View>
                    </View>

                    {/* El borde va encima del blur en su propia capa: un
                        BlurView nativo no respeta de forma confiable el
                        recorte por border-radius en las esquinas.
                        Mismo arreglo que en GlassCard.jsx. */}
                    <View
                        style={[
                            StyleSheet.absoluteFill,
                            styles.borderOverlay,
                            { borderTopColor: theme.glassBorderTop, pointerEvents: 'none' },
                        ]}
                    />
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end' },
    scrim: { flex: 1, backgroundColor: 'rgba(6,8,12,0.62)' },
    // Sin recortar: carga la sombra, que se dibuja fuera de los límites.
    outer: { maxHeight: '92%' },
    // Recortado: overflow hidden es lo que clipea el BlurView.
    clip: { overflow: 'hidden', borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
    borderOverlay: {
        borderTopLeftRadius: Radius.lg,
        borderTopRightRadius: Radius.lg,
        borderTopWidth: 1,
    },
    content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md - 4, paddingBottom: 34 },
    // Un poco de alto aunque no haya título, para que el gesto de
    // arrastre tenga dónde empezar.
    dragZone: { minHeight: 20 },
    handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md + 2 },
    title: { fontSize: FontSize.xl, letterSpacing: -0.4, textAlign: 'center' },
    subtitle: { fontSize: FontSize.sm, textAlign: 'center', marginTop: 4, marginBottom: Spacing.sm },
});