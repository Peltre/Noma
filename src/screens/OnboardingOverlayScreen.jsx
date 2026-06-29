// Onboarding screen layout
// Guides the user through the setup and a quick tour of the app
import { useState } from "react";
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
import { useFinance } from "../store/FinanceContext";
import styles from './OnboardingOverlay.styles';
import { Colors } from "../constants";

const TOTAL_STEPS = 4;

// Tour tips shown in step 2, 1 per slide
const TOUR_TIPS = [
    {
        emoji: '💰',
        title: 'Tu balance total',
        subtitle: 'Aquí ves cuánto dinero tienes en total entre efectivo, tarjeta y ahorros.',
    },
    {
        emoji: '➕',
        title: 'Registra movimientos',
        subtitle: 'Toca el botón + para registrar un gasto, ingreso o retiro en segundos.',
    },
    {
        emoji: '📋',
        title: 'Historial completo',
        subtitle: 'En la pestaña Historial ves todos tus movimientos filtrados por tipo y mes.',
    },
    {
        emoji: '💳',
        title: 'Tarjetas de crédito',
        subtitle: 'Agrega tus tarjetas de crédito para llevar track de tu deuda y fechas de corte.',
    },
];

export default function Onboarding({ visible, onComplete }) {
    const {
        updateSettings,
        setInitialBalances,
    } = useFinance();

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
        await updateSettings({
            userName: userName.trim() || 'Usuario',
            onboardingCompleted: true,
        });

        const totalDebit = debitCards.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
        const savings = (!skipSavings && hasSavings) ? parseFloat(savingsAmount) || 0 : 0;

        await setInitialBalances([
            { accountId: '1', balance: parseFloat(cashAmount) || 0 },
            { accountId: '2', balance: totalDebit },
            { accountId: '3', balance: savings },
        ]);

        onComplete();
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
                        <Text style={styles.emoji}>👋</Text>
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
                                placeholderTextColor="#B0A898"
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
                        <Text style={styles.emoji}>{tip.emoji}</Text>
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
                        <Text style={styles.emoji}>💵</Text>
                        <Text style={styles.title}>Tu dinero actual</Text>
                        <Text style={styles.subtitle}>
                            Ingresa cuanto dinero tienes en este momento para empezar con tu balance real
                        </Text>

                        {/* Cash */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Efectivo</Text>
                            <TextInput
                                style={styles.input}
                                value={cashAmount}
                                onChangeText={setCashAmount}
                                placeholder="$0.00"
                                placeholderTextColor="#B0A898"
                                keyboardType="decimal-pad"
                            />
                        </View>

                        {/* Debit cards */}
                        <Text styles={[styles.fieldLabel, { marginBottom: 8 }]}>
                            TARJETAS DE DEBITO
                        </Text>
                        {debitCards.map((card, index) => (
                            <View style={styles.accountCard} key={card.id}>
                                <View style={styles.accountCardHeader}>
                                    <Text style={styles.accountCardEmoji}>💳</Text>
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
                                    onChange={v => updateDebitCard(card.id, 'name', v)}
                                    placeholder="Nombre (Ej. BBVA)"
                                    placeholderTextColor="#B0A898"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={card.balance}
                                    onChangeText={v => updateDebitCard(card.id, 'balance', v)}
                                    placeholder="Saldo actual $0.00"
                                    placeholderTextColor="#B0A898"
                                    keyboardType="decimal-pad"
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
                        <Text style={styles.emoji}>🏦</Text>
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
                                <TextInput
                                    style={[styles.input, styles.inputLarge]}
                                    value={savingsAmount}
                                    onChangeText={setSavingsAmount}
                                    placeholder="$0.00"
                                    placeholderTextColor="#B0A898"
                                    keyboardType="decimal-pad"
                                    autoFocus
                                />
                            </View>
                        )}

                        {hasSavings === false && (
                            <Text style={{ color: Colors.muted, fontSize: 14, textAlign: 'center' }}>
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
                defult:
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