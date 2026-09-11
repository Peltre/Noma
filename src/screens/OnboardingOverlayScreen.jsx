// Onboarding — la puerta de entrada.
//
// Siete pantallas, una idea cada una:
//   nombre → tour (4 slides, una por pestaña, deslizables) → listo.
// El tour sólo MUESTRA lo que se puede hacer; no pide tarjetas ni
// dinero. Al final, "Poner mi dinero de hoy" es opcional y se puede
// omitir: la app arranca en $0 y todo se agrega después desde Tarjetas.
//
// Cada slide del tour es una mini-pantalla de la app dibujada con las
// mismas piezas (vidrio, colores, tab bar), con lo importante iluminado
// y el resto atenuado. La persona ve DÓNDE va a estar cada cosa.
//
// Se vuelve a abrir desde Ajustes ("Ver el recorrido") con
// settings.showTour = true: arranca directo en el tour y al terminar
// sólo apaga esa bandera.
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, Keyboard, Modal, useWindowDimensions, Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFinance } from '../store/FinanceContext';
import { useTheme } from '../store/useTheme';
import DecimalInput from '../components/DecimalInput';
import { formatCurrencyShort } from '../utils';
import { IconCheck, IconPlus, IconHome, IconHistory, IconSavings, IconCards } from '../components/Icons';
import Logo from '../components/Logo';
import CardFace from '../components/CardFace';
import { Field, FieldLabel, Button, fieldSurface } from '../components/ui';
import createOnboardingStyles from './OnboardingOverlay.styles';

function positiveFloat(str) {
    return Math.max(0, parseFloat(str) || 0);
}

// ── Mini-pantallas del tour ────────────────────────────────────────
// Un marco común (fondo, tab bar, "+") y adentro lo propio de cada
// pestaña. `active` ilumina la pestaña correspondiente en la mini tab
// bar; `Hl` marca lo que la frase de abajo explica.

function MiniScreen({ active, fabHot, children, styles, theme }) {
    const tabs = [['home', IconHome, 'Inicio'], ['history', IconHistory, 'Historial'], null, ['savings', IconSavings, 'Ahorros'], ['cards', IconCards, 'Tarjetas']];
    return (
        <View style={styles.mini}>
            <View style={styles.miniBody}>{children}</View>
            <View style={styles.miniTabBar}>
                {tabs.map((t) => {
                    if (!t) return <View key="gap" style={styles.miniTab} />;
                    const [key, Icon, label] = t;
                    const on = active === key;
                    return (
                        <View key={key} style={styles.miniTab}>
                            <Icon color={on ? theme.brand : theme.inkDim} bgColor={theme.glassFill} size={13} focused={on} />
                            <Text style={[styles.miniTabLabel, on && { color: theme.brand }]}>{label}</Text>
                        </View>
                    );
                })}
            </View>
            <View style={[styles.miniFab, fabHot ? styles.hl : styles.dim]}>
                <IconPlus color={theme.brandOn} size={16} />
            </View>
        </View>
    );
}

function Hl({ children, styles, style }) {
    return <View style={[styles.hl, style]}>{children}</View>;
}

function MiniHome({ styles, theme, balance }) {
    return (
        <MiniScreen active="home" fabHot styles={styles} theme={theme}>
            <Hl styles={styles} style={styles.miniCard}>
                <Text style={styles.miniLabel}>HOLA DE NUEVO</Text>
                <Text style={[styles.miniStrong, { marginBottom: 6 }]}>Pedro</Text>
                <Text style={styles.miniLabel}>BALANCE TOTAL</Text>
                <Text style={styles.miniBig}>{formatCurrencyShort(balance)}</Text>
                <View style={styles.miniBar}>
                    <View style={{ flex: 7, backgroundColor: '#8FD3C7' }} />
                    <View style={{ flex: 3, backgroundColor: '#2E8C80' }} />
                </View>
                <View style={styles.miniRow}><Text style={styles.miniMuted}>Disponible</Text><Text style={styles.miniMuted}>Ahorro</Text></View>
            </Hl>
            <View style={styles.dim}>
                <Text style={[styles.miniLabel, { marginTop: 8 }]}>FONDOS PROGRAMADOS</Text>
                <View style={[styles.miniCard, { height: 22, marginTop: 4 }]} />
                <Text style={[styles.miniLabel, { marginTop: 6 }]}>TARJETAS DE CRÉDITO</Text>
                <View style={[styles.miniCard, { height: 22, marginTop: 4 }]} />
            </View>
        </MiniScreen>
    );
}

function MiniHistory({ styles, theme }) {
    const rows = [['Súper', '−$620'], ['Gasolina', '−$900'], ['Netflix', '−$219'], ['Uber', '−$140']];
    return (
        <MiniScreen active="history" styles={styles} theme={theme}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
                <Hl styles={styles} style={[styles.miniCard, { flex: 1, paddingVertical: 5 }]}>
                    <Text style={styles.miniLabel}>TIPO</Text><Text style={styles.miniStrong}>Gastos</Text>
                </Hl>
                <Hl styles={styles} style={[styles.miniCard, { flex: 1.3, paddingVertical: 5 }]}>
                    <Text style={styles.miniLabel}>PERIODO</Text><Text style={styles.miniStrong}>Septiembre</Text>
                </Hl>
            </View>
            <View style={[styles.miniCard, styles.dim, { marginTop: 8, paddingVertical: 4 }]}>
                {rows.map(([n, a]) => (
                    <View key={n} style={styles.miniRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={[styles.miniDot, { backgroundColor: theme.moneyOut }]} />
                            <Text style={styles.miniText}>{n}</Text>
                        </View>
                        <Text style={styles.miniText}>{a}</Text>
                    </View>
                ))}
            </View>
        </MiniScreen>
    );
}

function MiniSavings({ styles, theme }) {
    return (
        <MiniScreen active="savings" styles={styles} theme={theme}>
            <Hl styles={styles} style={styles.miniCard}>
                <View style={styles.miniRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <View style={[styles.miniDot, { backgroundColor: '#2D5F6E' }]} />
                        <Text style={styles.miniStrong}>BBVA</Text>
                    </View>
                    <Text style={styles.miniStrong}>$18,000</Text>
                </View>
                <View style={styles.miniIndent}>
                    <View style={styles.miniRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={[styles.miniDot, { backgroundColor: '#9C93CF' }]} />
                            <Text style={styles.miniText}>Apartado BBVA</Text>
                        </View>
                        <Text style={styles.miniText}>$6,000</Text>
                    </View>
                </View>
            </Hl>
            <Hl styles={styles} style={[styles.miniCard, { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <View style={styles.miniRing}><Text style={styles.miniRingText}>10%</Text></View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.miniStrong}>Fondo de emergencia</Text>
                    <Text style={styles.miniMuted}>$6,000 de $60,000 · BBVA › Apartado</Text>
                </View>
            </Hl>
        </MiniScreen>
    );
}

function MiniCards({ styles, theme }) {
    // Las caras son el CardFace real de la pestaña, a escala 0.62:
    // la débito asomando detrás y la crédito al frente con su aviso.
    return (
        <MiniScreen active="cards" styles={styles} theme={theme}>
            <View style={styles.miniCardsStack}>
                <View style={[styles.miniFaceScale, styles.dim, { top: 0 }]}>
                    <CardFace name="BBVA" type="debit" color="#2D5F6E" valueLabel="Saldo" valueAmount={18000} variant="grid" />
                </View>
                <View style={[styles.miniFaceScale, { top: 30 }]}>
                    <Hl styles={styles} style={{ borderRadius: 14 }}>
                        <CardFace name="Visa" type="credit" color="#1F4E4A" valueLabel="Deuda actual" valueAmount={5840} progressPct={73} variant="grid" />
                    </Hl>
                </View>
            </View>
            <Text style={[styles.miniMuted, styles.miniCardsNote]}>Corte en 3 días · pago día 1</Text>
        </MiniScreen>
    );
}

// ── Componente ─────────────────────────────────────────────────────

export default function Onboarding({ visible, tourOnly = false }) {
    const { updateSettings, setupInitialAccounts, totalBalance } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createOnboardingStyles(theme), [theme]);
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const slideWidth = width - 2 * 24; // paddingHorizontal del marco

    const [step, setStep] = useState(tourOnly ? 'tour' : 'name'); // 'name' | 'tour' | 'done' | 'money'
    const [slide, setSlide] = useState(0);
    // Alto real del carrusel: en un ScrollView horizontal los hijos no
    // se estiran solos, así que cada slide recibe este alto explícito
    // para poder centrar su contenido en Y.
    const [slideHeight, setSlideHeight] = useState(0);
    const [userName, setUserName] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [debitName, setDebitName] = useState('');
    const [debitBalance, setDebitBalance] = useState('');
    const scrollRef = useRef(null);
    // Posición del carrusel en vivo: los puntos se animan con ella en
    // vez de esperar a que el scroll se detenga.
    const scrollX = useRef(new Animated.Value(0)).current;

    // Cada vez que se abre, arranca desde el principio (el componente
    // sigue montado con visible=false entre una vez y otra).
    useEffect(() => {
        if (!visible) return;
        setStep(tourOnly ? 'tour' : 'name');
        setSlide(0);
    }, [visible, tourOnly]);

    // El teclado nunca debe seguir abierto al cambiar de paso.
    useEffect(() => { Keyboard.dismiss(); }, [step]);

    // Cada slide: el nombre de la pestaña como título (para que el mapa
    // pantalla→nombre quede claro) y una frase de qué ofrece.
    const TOUR = [
        {
            key: 'home', Icon: IconHome, title: 'Inicio',
            text: 'Cuánto tienes y cuánto puedes gastar. Con el + registras un movimiento.',
            render: () => <MiniHome styles={styles} theme={theme} balance={totalBalance > 0 ? totalBalance : 19200} />,
        },
        {
            key: 'history', Icon: IconHistory, title: 'Historial',
            text: 'Todo lo que entra y sale, filtrado por tipo y periodo.',
            render: () => <MiniHistory styles={styles} theme={theme} />,
        },
        {
            key: 'savings', Icon: IconSavings, title: 'Ahorros',
            text: 'Apartados dentro de tus tarjetas, y objetivos con meta y fecha.',
            render: () => <MiniSavings styles={styles} theme={theme} />,
        },
        {
            key: 'cards', Icon: IconCards, title: 'Tarjetas',
            text: 'Débito y crédito en un lugar, con avisos de corte y pago.',
            render: () => <MiniCards styles={styles} theme={theme} />,
        },
    ];
    const lastSlide = slide === TOUR.length - 1;

    const goToSlide = (i) => {
        scrollRef.current?.scrollTo({ x: i * slideWidth, animated: true });
        setSlide(i);
    };
    // El índice se actualiza durante el gesto (a medio camino cambia),
    // no al final: así el botón "Siguiente/Terminar" tampoco se retrasa.
    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (e) => {
                const i = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
                const clamped = Math.max(0, Math.min(TOUR.length - 1, i));
                if (clamped !== slide) setSlide(clamped);
            },
        },
    );
    // Deslizar más allá del último slide también termina el tour.
    const onDragEnd = (e) => {
        const x = e.nativeEvent.contentOffset.x;
        if (slide === TOUR.length - 1 && x > (TOUR.length - 1) * slideWidth + 40) setStep('done');
    };

    // Cerrar de verdad. `tourOnly` sólo apaga la bandera de Ajustes.
    const finish = async () => {
        Keyboard.dismiss();
        if (tourOnly) { await updateSettings({ showTour: false }); return; }
        await updateSettings({ userName: userName.trim() || 'Usuario', onboardingCompleted: true, showTour: false });
    };

    const saveMoneyAndFinish = async () => {
        // Una sola escritura para efectivo + tarjeta (ver setupInitialAccounts).
        await setupInitialAccounts({
            cashBalance: positiveFloat(cashAmount),
            debitCards: debitName.trim()
                ? [{ name: debitName.trim(), type: 'debit', color: theme.cardDefault || '#236B61', initialBalance: positiveFloat(debitBalance) }]
                : [],
        });
        await finish();
    };

    // Button.base lleva flex: 1 pensado para filas. En columna, Yoga
    // toma ese flex como flexBasis 0 y el botón queda con alto CERO en
    // iOS (en web sí se veía). Por eso cada botón va dentro de una fila.
    const Cta = ({ rowStyle, ...props }) => (
        <View style={[styles.ctaRow, rowStyle]}>
            <Button {...props} />
        </View>
    );

    const Dots = ({ index, total }) => (
        <View style={styles.dots}>
            {Array.from({ length: total }, (_, i) => (
                <View key={i} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
        </View>
    );

    // Puntos del tour animados con la posición real del scroll. El
    // primero (bienvenida) queda fijo; los del tour interpolan ancho y
    // color entre slides.
    const TourDots = () => (
        <View style={styles.dots}>
            <View style={styles.dot} />
            {TOUR.map((_, i) => {
                const input = [(i - 1) * slideWidth, i * slideWidth, (i + 1) * slideWidth];
                const w = scrollX.interpolate({ inputRange: input, outputRange: [5, 16, 5], extrapolate: 'clamp' });
                const bg = scrollX.interpolate({ inputRange: input, outputRange: [theme.border, theme.brand, theme.border], extrapolate: 'clamp' });
                return <Animated.View key={i} style={[styles.dot, { width: w, backgroundColor: bg }]} />;
            })}
        </View>
    );

    // Paso 1 del flujo completo: bienvenida y tour cuentan como
    // pantallas 1..5 en los puntos; "listo" ya no lleva puntos.
    const dotIndex = step === 'name' ? 0 : 1 + slide;
    const dotTotal = 1 + TOUR.length;

    const renderStep = () => {
        switch (step) {
            case 'name':
                return (
                    <View style={styles.stepFill}>
                        <View style={styles.centerBlock}>
                            <Logo size={96} />
                            <Text style={styles.subtitle}>Tu dinero, claro y en un solo lugar.</Text>
                            <Field
                                label="¿Cómo te llamas?"
                                value={userName}
                                onChangeText={setUserName}
                                placeholder="Ej. Pedro"
                                returnKeyType="done"
                                onSubmitEditing={() => setStep('tour')}
                                style={{ marginTop: 20 }}
                            />
                            <Text style={styles.helperNote}>Lo puedes cambiar cuando quieras desde Ajustes.</Text>
                        </View>
                        <Dots index={dotIndex} total={dotTotal} />
                        <Cta label={userName.trim() ? 'Empezar' : 'Empezar sin nombre'} onPress={() => setStep('tour')} />
                    </View>
                );

            case 'tour':
                return (
                    <View style={styles.stepFill}>
                        <View style={styles.topRow}>
                            <TouchableOpacity onPress={() => setStep('done')} hitSlop={10} accessibilityRole="button">
                                <Text style={styles.skipText}>Omitir tour</Text>
                            </TouchableOpacity>
                        </View>
                        {/* El ScrollView ocupa TODO el alto libre, así el
                            deslizar funciona desde cualquier punto de la
                            pantalla, y cada slide centra su contenido en Y. */}
                        <Animated.ScrollView
                            ref={scrollRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={onScroll}
                            scrollEventThrottle={16}
                            onScrollEndDrag={onDragEnd}
                            onLayout={(e) => setSlideHeight(e.nativeEvent.layout.height)}
                            style={{ flex: 1 }}
                        >
                            {TOUR.map((s) => (
                                <View key={s.key} style={[styles.slide, { width: slideWidth, height: slideHeight || undefined }]}>
                                    {s.render()}
                                    <View style={styles.tourTitleRow}>
                                        <s.Icon color={theme.brand} bgColor={theme.bg} size={18} focused />
                                        <Text style={styles.tourTitle}>{s.title}</Text>
                                    </View>
                                    <Text style={styles.tourText}>{s.text}</Text>
                                </View>
                            ))}
                        </Animated.ScrollView>
                        <TourDots />
                        <Cta
                            label={lastSlide ? 'Terminar' : 'Siguiente'}
                            variant={lastSlide ? 'primary' : 'secondary'}
                            onPress={() => (lastSlide ? setStep('done') : goToSlide(slide + 1))}
                        />
                    </View>
                );

            case 'done':
                return (
                    <View style={styles.stepFill}>
                        <View style={styles.centerBlock}>
                            <View style={[styles.iconBadge, { borderRadius: 32 }]}><IconCheck color={theme.brand} size={28} /></View>
                            <Text style={styles.title}>{tourOnly ? 'Eso es todo' : `Listo${userName.trim() ? `, ${userName.trim()}` : ''}`}</Text>
                            <Text style={styles.subtitle}>
                                {tourOnly
                                    ? 'Cuando quieras volver a verlo, está en Ajustes.'
                                    : 'Puedes poner cuánto tienes hoy para arrancar con tu balance real, o explorar primero y agregarlo después desde Tarjetas.'}
                            </Text>
                        </View>
                        {!tourOnly && (
                            <Cta rowStyle={{ marginBottom: 10 }} label="Poner mi dinero de hoy" onPress={() => setStep('money')} />
                        )}
                        <Cta label={tourOnly ? 'Cerrar' : 'Ir a Inicio'} variant={tourOnly ? 'primary' : 'secondary'} onPress={finish} />
                    </View>
                );

            case 'money':
                return (
                    <View style={styles.stepFill}>
                        <View style={styles.topRow}>
                            <TouchableOpacity onPress={finish} hitSlop={10} accessibilityRole="button">
                                <Text style={styles.skipText}>Omitir</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 260 }}>
                            <Text style={[styles.title, { textAlign: 'left', marginTop: 8 }]}>¿Cuánto tienes ahora?</Text>
                            <Text style={[styles.subtitle, { textAlign: 'left' }]}>Sólo lo que traes hoy. Sin historial, sin culpas: es el punto de partida.</Text>

                            <FieldLabel style={{ marginTop: 16 }}>Efectivo</FieldLabel>
                            <DecimalInput
                                style={[styles.decimalInput, fieldSurface(theme)]}
                                value={cashAmount}
                                onChangeText={setCashAmount}
                                placeholder="$0.00"
                                placeholderTextColor={theme.inkDim}
                            />

                            <FieldLabel optional>Tarjeta de débito</FieldLabel>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <View style={{ flex: 1.4 }}>
                                    <Field value={debitName} onChangeText={setDebitName} placeholder="Ej. BBVA, Nu…" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <DecimalInput
                                        style={[styles.decimalInput, fieldSurface(theme)]}
                                        value={debitBalance}
                                        onChangeText={setDebitBalance}
                                        placeholder="$0.00"
                                        placeholderTextColor={theme.inkDim}
                                    />
                                </View>
                            </View>
                            <Text style={styles.helperNote}>Las demás tarjetas, apartados y créditos se agregan después desde Tarjetas.</Text>
                        </ScrollView>
                        <Cta label="Continuar" onPress={saveMoneyAndFinish} />
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={40} tint="dark" style={styles.overlay}>
                <View style={styles.backdrop} />
                {/* Los márgenes verticales salen de los insets reales (isla
                    dinámica, home indicator), no de números fijos: con un
                    padding fijo el botón quedaba bajo la franja de abajo. */}
                <View style={[styles.frame, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
                    {renderStep()}
                </View>
            </BlurView>
        </Modal>
    );
}