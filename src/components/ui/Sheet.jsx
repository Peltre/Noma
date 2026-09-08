// Hoja inferior de vidrio, no un panel opaco: el cielo sigue vivo
// detrás cuando el usuario abre algo.
import {
    Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform,
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
    const Body = scroll ? ScrollView : View;
    const bodyProps = scroll
        ? { keyboardShouldPersistTaps: 'handled', showsVerticalScrollIndicator: false }
        : {};

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity
                    style={styles.scrim}
                    activeOpacity={1}
                    onPress={dismissable ? onClose : undefined}
                />

                <View style={[styles.outer, Shadow.float]}>
                    <View style={styles.clip}>
                        <BlurView
                            intensity={theme.sheetIntensity}
                            tint={theme.glassTint}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.sheetFill }]} />

                        <View style={[styles.content, style]}>
                            <View style={[styles.handle, { backgroundColor: theme.inkSoft }]} />
                            {!!title && (
                                <Text style={[styles.title, displayFont('700'), { color: theme.ink }]}>{title}</Text>
                            )}
                            {!!subtitle && (
                                <Text style={[styles.subtitle, { color: theme.inkMid }]}>{subtitle}</Text>
                            )}
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
                </View>
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
    handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md + 2 },
    title: { fontSize: FontSize.xl, letterSpacing: -0.4, textAlign: 'center' },
    subtitle: { fontSize: FontSize.sm, textAlign: 'center', marginTop: 4, marginBottom: Spacing.sm },
});