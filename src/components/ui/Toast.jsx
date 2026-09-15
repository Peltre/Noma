// Avisos breves (toast): lo que sólo informa y no necesita una
// decisión. Aparece arriba, se va solo en 3 s y se puede empujar hacia
// arriba para cerrarlo antes.
//
// Los diálogos del sistema (Alert) se quedan SÓLO para confirmaciones
// destructivas: "¿Eliminar objetivo?", "¿Borrar todos los datos?".
// Ahí sí hay que decidir algo, y conviene lo que la persona ya conoce.
//
// Uso:
//   const toast = useToast();
//   toast.error('Efectivo solo tiene $3,500', 'No alcanza para este gasto');
//   toast.success('Gasto registrado');
//   toast.info('$500 de Viaje quedaron en riesgo', 'BBVA bajó de lo que…');
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../store/useTheme';
import { FontSize, Spacing, Radius, Shadow } from '../../constants';
import { IconCheck, IconWarningTriangle, IconInfo } from '../Icons';

const VISIBLE_MS = 3000;

const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
    return ctx;
}

// Un toast a la vez: si llega otro, reemplaza al anterior en vez de
// apilarse. Dos avisos encimados no se alcanzan a leer.
export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const timer = useRef(null);

    // `leaving` deja que el toast se desvanezca antes de desmontarse;
    // sin eso desaparecería de golpe al cumplirse el tiempo.
    const show = useCallback((tone, title, detail) => {
        clearTimeout(timer.current);
        setToast({ id: Date.now(), tone, title, detail, leaving: false });
        timer.current = setTimeout(() => setToast((t) => (t ? { ...t, leaving: true } : t)), VISIBLE_MS);
    }, []);

    useEffect(() => () => clearTimeout(timer.current), []);

    const api = useRef({
        error: (title, detail) => show('error', title, detail),
        success: (title, detail) => show('success', title, detail),
        info: (title, detail) => show('info', title, detail),
    }).current;

    return (
        <ToastContext.Provider value={api}>
            {children}
            {!!toast && <Toast key={toast.id} {...toast} onDismiss={() => setToast(null)} />}
        </ToastContext.Provider>
    );
}

function Toast({ tone, title, detail, leaving: leavingProp, onDismiss }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = createStyles(theme);

    const tones = {
        error: { color: theme.moneyOut, soft: theme.moneyOutSoft, Icon: IconWarningTriangle },
        success: { color: theme.brand, soft: theme.brandSoft, Icon: IconCheck },
        info: { color: theme.savings, soft: theme.savingsSoft, Icon: IconInfo },
    };
    const { color, soft, Icon } = tones[tone] || tones.info;

    // Entra deslizando desde arriba y se va igual. El mismo resorte casi
    // crítico de las hojas, para que la app se sienta de una pieza.
    const progress = useRef(new Animated.Value(0)).current; // entrada
    const fade = useRef(new Animated.Value(1)).current;      // salida
    const lift = useRef(new Animated.Value(0)).current;      // salida
    const drag = useRef(new Animated.Value(0)).current;      // gesto
    const leaving = useRef(false);

    // Salida: se desvanece en su sitio y sube un poco, más lento que la
    // entrada (280 ms). Subir sin desvanecer se leía como un tirón.
    const leave = useCallback(() => {
        if (leaving.current) return;
        leaving.current = true;
        Animated.parallel([
            Animated.timing(fade, { toValue: 0, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
            Animated.timing(lift, { toValue: -18, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]).start(onDismiss);
    }, [fade, lift, onDismiss]);

    // El provider avisa que se acabó el tiempo; la salida la anima aquí.
    useEffect(() => { if (leavingProp) leave(); }, [leavingProp, leave]);

    useEffect(() => {
        Animated.spring(progress, {
            toValue: 1, useNativeDriver: true,
            damping: 30, stiffness: 190, mass: 1, overshootClamping: true,
        }).start();
    }, [progress]);

    const pan = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => g.dy < -4 && Math.abs(g.dy) > Math.abs(g.dx),
            onPanResponderMove: (_, g) => drag.setValue(Math.min(0, g.dy)),
            onPanResponderRelease: (_, g) => {
                if (g.dy < -30 || g.vy < -0.8) leave();
                else Animated.spring(drag, { toValue: 0, useNativeDriver: true, damping: 28, stiffness: 220, overshootClamping: true }).start();
            },
        }),
    ).current;

    const translateY = Animated.add(
        Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [-140, 0] }), lift),
        drag,
    );
    // Al entrar se desvanece desde 0; al salir, `fade` lo baja a 0.
    const opacity = Animated.multiply(progress, fade);

    return (
        <Animated.View
            {...pan.panHandlers}
            style={[
                styles.wrap,
                Shadow.float,
                { top: insets.top + Spacing.sm, borderLeftColor: color, opacity, transform: [{ translateY }] },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
        >
            <View style={[styles.badge, { backgroundColor: soft }]}>
                <Icon color={color} size={13} />
            </View>
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                {!!detail && <Text style={styles.detail} numberOfLines={2}>{detail}</Text>}
            </View>
        </Animated.View>
    );
}

const createStyles = (theme) =>
    StyleSheet.create({
        wrap: {
            position: 'absolute',
            left: Spacing.md,
            right: Spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 2,
            paddingVertical: Spacing.sm + 2,
            paddingRight: Spacing.md,
            paddingLeft: Spacing.sm + 2,
            // Opaco, no el vidrio translúcido de las tarjetas: un aviso
            // encima del contenido tiene que leerse sin lo de atrás.
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.glassBorder,
            borderTopColor: theme.glassBorderTop,
            // El filo de color a la izquierda: el mismo recurso de las
            // tarjetas con corte urgente.
            borderLeftWidth: 3,
            borderRadius: Radius.md,
            borderTopLeftRadius: Radius.xs,
            borderBottomLeftRadius: Radius.xs,
            zIndex: 100,
        },
        badge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
        body: { flex: 1, minWidth: 0 },
        title: { fontSize: FontSize.sm, fontWeight: '700', color: theme.ink },
        detail: { fontSize: FontSize.xs, fontWeight: '500', color: theme.inkMid, marginTop: 2 },
    });