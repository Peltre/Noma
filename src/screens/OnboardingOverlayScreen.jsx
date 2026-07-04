// Onboarding screen layout
// Guides the user through the setup and a quick tour of the app
import { useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";
import DecimalInput from "../components/DecimalInput";
import createOnboardingStyles from './OnboardingOverlay.styles';

const TOTAL_STEPS = 4;

// Step icons — same stroke language as the rest of the app, no emojis.
function IconSparkle({ color }) {
    return (
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
            <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
        </Svg>
    );
}
function IconWallet({ color }) {
    return (
        <Svg width={30} height={30} viewBox="0 0 22 22" fill="none">
            <Circle cx="11" cy="11" r="7.5" stroke={color} strokeWidth={1.6} />
            <Path
                d="M11 6.5v9M8.4 8.7c0-1.1 1.2-1.9 2.6-1.9s2.6.8 2.6 1.7-1.1 1.4-2.6 1.6-2.6.6-2.6 1.7 1.2 1.8 2.6 1.8 2.6-.7 2.6-1.8"
                stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
            />
        </Svg>
    );
}
function IconPlus({ color }) {
    return (
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} />
            <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
    );
}
function IconDocument({ color }) {
    return (
        <Svg width={30} height={30} viewBox="0 0 22 22" fill="none">
            <Rect x="3" y="3" width="16" height="16" rx="2.5" stroke={color} strokeWidth={1.6} />
            <Path d="M7 8h8M7 11.5h8M7 15h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
    );
}
function IconCard({ color }) {
    return (
        <Svg width={30} height={30} viewBox="0 0 22 22" fill="none">
            <Rect x="1" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth={1.6} />
            <Path d="M1 9h20" stroke={color} strokeWidth={1.6} />
            <Path d="M5 14h3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
    );
}
function IconCash({ color }) {
    return (
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
            <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth={1.6} />
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.6} />
            <Path d="M5 9v.01M19 15v.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}
function IconBank({ color }) {
    return (
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
            <Path d="M3 9l9-5 9 5" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
            <Path d="M4 9h16v2H4z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M5 11v7M9.5 11v7M14.5 11v7M19 11v7" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
            <Path d="M4 20h16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
    );
}

// Tour tips shown in step 2, 1 per slide
const TOUR_TIPS = [
    {
        Icon: IconWallet,
        title: 'Tu balance total',
        subtitle: 'Aquí ves cuánto dinero tienes en total entre efectivo, tarjeta y ahorros.',
    },
    {
        Icon: IconPlus,
        title: 'Registra movimientos',
        subtitle: 'Toca el botón + para registrar un gasto, ingreso o retiro en segundos.',
    },
    {
        Icon: IconDocument,
        title: 'Historial completo',
        subtitle: 'En la pestaña Historial ves todos tus movimientos filtrados por tipo y mes.',
    },
    {
        Icon: IconCard,
        title: 'Tarjetas de crédito',
        subtitle: 'Agrega tus tarjetas de crédito para llevar track de tu deuda y fechas de corte.',
    },
];

// Visibility is driven entirely by settings.onboardingCompleted (see
// App.js) — no onComplete callback needed, updateSettings below is
// enough to make this close itself on the next render.
export default function Onboarding({ visible }) {
    const {
        updateSettings,
        setInitialBalances,
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createOnboardingStyles(theme), [theme]);

    const [step, setStep] = useState(1);
    const [tourSlide, setTourSlide] = useState(0);

    // Step 1 - The name
    const [userName, setUserName] = useState('');

    // Step 3 - Cash & debit cards
    const [cashAmount, setCashAmount] = useState('');
    const [debitCards, setDebitCards] = useState([
        { id: '1', name: '', balance: '' }
    ]);

    // Step 4 - Savings
    const [hasSavings, setHasSavings] = useState(null);
    const [savingsAmount, setSavingsAmount] = useState('');

    // Tour nav
    const nextTourSlide = () => {
        if (tourSlide < TOUR_TIPS.length - 1) {
            setTourSlide(tourSlide + 1);
        } else {
            setStep(3);
        }
    };

    const prevTourSlide = () => {
        if (tourSlide > 0) setTourSlide(tourSlide - 1);
        else setStep(1);
    };

    // Debit card helpers
    const addDebitCards = () => {
        setDebitCards([...debitCards, { id: Date.now().toString(), name: '', balance: '' }]);
    };

    const updateDebitCard = (id, field, value) => {
        setDebitCards(debitCards.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeDebitCard = (id) => {
        if (debitCards.length > 1) setDebitCards(debitCards.filter(c => c.id !== id));
    };

    // Finish
    const handleFinish = async (skipSavings = false) => {
        const totalDebit = debitCards.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
        const savings = (!skipSavings && hasSavings) ? parseFloat(savingsAmount) || 0 : 0;

        await setInitialBalances([
            { accountId: '1', balance: parseFloat(cashAmount) || 0 },
            { accountId: '2', balance: totalDebit },
            { accountId: '3', balance: savings },
        ]);

        // Marking onboardingCompleted last (and awaited) so the overlay
        // closes only once everything else has actually been saved.
        await updateSettings({
            userName: userName.trim() || 'Usuario',
            onboardingCompleted: true,
        });
    };

    // Can proceed?
    const canProceed = () => {
        if (step === 1) return userName.trim().length > 0;
        if (step === 4) return hasSavings !== null;
        return true;
    };

    // Step content
    const renderStep = () => {
        switch (step) {
            // Step 1 - welcome & name
            case 1:
                return (
                    <>
                        <View style={styles.iconBadge}><IconSparkle color={theme.brand} /></View>
                        <Text style={styles.title}>¡Bienvenido a Noma!</Text>
                        <Text style={styles.subtitle}>
                            Tu app para llevar el control de tu dinero de forma simple
                        </Text>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Tu nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={userName}
                                onChangeText={setUserName}
                                placeholder="Ej. Pablo, Karla..."
                                placeholderTextColor={theme.muted}
                                autoFocus
                                returnKeyType="done"
                            />
                        </View>
                        <View style={styles.bottomRow}>
                            <TouchableOpacity
                                style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
                                onPress={() => setStep(2)}
                                disabled={!canProceed()}
                            >
                                <Text style={styles.nextBtnText}>Continuar →</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );

            // Step 2 - Tour
            case 2:
                const tip = TOUR_TIPS[tourSlide];
                return (
                    <>
                        <View style={styles.iconBadge}><tip.Icon color={theme.brand} /></View>
                        <Text style={styles.title}>{tip.title}</Text>
                        <Text style={styles.subtitle}>{tip.subtitle}</Text>

                        {/* Tour progress dots */}
                        <View style={styles.progressRow}>
                            {TOUR_TIPS.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.progressDot,
                                        i <= tourSlide && styles.progressDotActive,
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.bottomRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={prevTourSlide}>
                                <Text style={styles.backBtnText}>←</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.nextBtn} onPress={nextTourSlide}>
                                <Text style={styles.nextBtnText}>
                                    {tourSlide === TOUR_TIPS.length - 1 ? 'Configurar →' : 'Siguiente →'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );

            // Step 3 - Cash & Debit
            case 3:
                return (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.iconBadge}><IconCash color={theme.brand} /></View>
                        <Text style={styles.title}>Tu dinero actual</Text>
                        <Text style={styles.subtitle}>
                            Ingresa cuanto dinero tienes en este momento para empezar con tu balance real
                        </Text>

                        {/* Cash */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Efectivo</Text>
                            <DecimalInput
                                style={styles.input}
                                value={cashAmount}
                                onChangeText={setCashAmount}
                                placeholder="$0.00"
                                placeholderTextColor={theme.muted}
                            />
                        </View>

                        {/* Debit cards */}
                        <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                            TARJETAS DE DEBITO
                        </Text>
                        {debitCards.map((card, index) => (
                            <View style={styles.accountCard} key={card.id}>
                                <View style={styles.accountCardHeader}>
                                    <IconCard color={theme.muted} />
                                    <Text style={styles.accountCardTitle}>
                                        Tarjeta {index + 1}
                                    </Text>
                                    {debitCards.length > 1 && (
                                        <TouchableOpacity onPress={() => removeDebitCard(card.id)}>
                                            <Text style={styles.removeBtn}>Quitar</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={card.name}
                                    onChangeText={v => updateDebitCard(card.id, 'name', v)}
                                    placeholder="Nombre (Ej. BBVA)"
                                    placeholderTextColor={theme.muted}
                                />
                                <DecimalInput
                                    style={styles.input}
                                    value={card.balance}
                                    onChangeText={v => updateDebitCard(card.id, 'balance', v)}
                                    placeholder="Saldo actual $0.00"
                                    placeholderTextColor={theme.muted}
                                />
                            </View>
                        ))}
                        <View style={styles.bottomRow}>
                            <TouchableOpacity style={styles.addBtn} onPress={() => setStep(2)}>
                                <Text style={styles.backBtnText}>←</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.nextBtn}
                                onPress={() => setStep(4)}
                            >
                                <Text style={styles.nextBtnText}>Continuar →</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )
            // Step 4 - Savings
            case 4:
                return (
                    <>
                        <View style={styles.iconBadge}><IconBank color={theme.brand} /></View>
                        <Text style={styles.title}>¿Tienes ahorros?</Text>
                        <Text style={styles.subtitle}>
                            Dinero que tienes guardado y no consideras disponible para gastar del día a día.
                        </Text>

                        <View style={styles.yesNoRow}>
                            <TouchableOpacity
                                style={[styles.yesNoBtn, hasSavings === true && styles.yesNoBtnActive]}
                                onPress={() => setHasSavings(true)}
                            >
                                <Text style={[styles.yesNoBtnText, hasSavings === true && styles.yesNoBtnTextActive]}>
                                    Sí
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.yesNoBtn, hasSavings === false && styles.yesNoBtnActive]}
                                onPress={() => setHasSavings(false)}
                            >
                                <Text style={[styles.yesNoBtnText, hasSavings === false && styles.yesNoBtnTextActive]}>
                                    No
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {hasSavings === true && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>¿Cuánto tienes ahorrado?</Text>
                                <DecimalInput
                                    style={[styles.input, styles.inputLarge]}
                                    value={savingsAmount}
                                    onChangeText={setSavingsAmount}
                                    placeholder="$0.00"
                                    placeholderTextColor={theme.muted}
                                    autoFocus
                                />
                            </View>
                        )}

                        {hasSavings === false && (
                            <Text style={{ color: theme.muted, fontSize: 14, textAlign: 'center' }}>
                                Sin problema, puedes agregar ahorros después desde la app.
                            </Text>
                        )}

                        <View style={styles.bottomRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}>
                                <Text style={styles.backBtnText}>←</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
                                onPress={() => handleFinish(false)}
                                disabled={!canProceed()}
                            >
                                <Text style={styles.nextBtnText}>¡Listo, empezar!</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Skip savings option */}
                        <TouchableOpacity
                            style={styles.laterBtn}
                            onPress={() => handleFinish(true)}
                        >
                            <Text style={styles.laterBtnText}>Configurar ahorros después</Text>
                        </TouchableOpacity>
                    </>
                );
            default:
                return null;
        }
    };
    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={40} tint="dark" style={styles.overlay}>
                <View style={styles.backdrop} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.kavWrapper}
                >
                    <View style={styles.card}>
                        {step !== 2 && (
                            <View style={styles.progressRow}>
                                {[1, 2, 3, 4].map(i => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.progressDot,
                                            i <= step && styles.progressDotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                        {renderStep()}
                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
}