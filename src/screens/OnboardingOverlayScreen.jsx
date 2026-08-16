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
import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";
import DecimalInput from "../components/DecimalInput";
import { ACCOUNT_LABELS } from "../constants";
import { SAVINGS_COLORS } from "../store/useSavings";
import {
    IconSparkle, IconWallet, IconPlus, IconDocument, IconCard, IconCash, IconChevronLeft,
} from '../components/Icons';
import createOnboardingStyles from './OnboardingOverlay.styles';

const TOTAL_STEPS = 3;

// Same rule the rest of the app enforces on every account balance:
// never negative. Onboarding's amount fields are free-text (DecimalInput
// doesn't block a literal "-"), so this is the one place that guards
// the very first numbers a new user's balances start from.
function positiveFloat(str) {
    return Math.max(0, parseFloat(str) || 0);
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
        addAccountsBatch,
    } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createOnboardingStyles(theme), [theme]);

    const [step, setStep] = useState(1);
    const [tourSlide, setTourSlide] = useState(0);

    // Step 1 - The name
    const [userName, setUserName] = useState('');

    // Step 3 - Cash & debit
    // Each entry here becomes its own real account (via
    // addAccountsBatch) when the user finishes — not summed into one
    // lump. An entry left with no name is treated as "skipped", not
    // created.
    const [cashAmount, setCashAmount] = useState('');
    const [debitCards, setDebitCards] = useState([
        { id: '1', name: '', balance: '' },
    ]);

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

    // Debit card list helpers — each entry maps 1:1 to a real account
    // created in handleFinish, unlike the old version of this screen.
    const addDebitCard = () => {
        setDebitCards([...debitCards, { id: Date.now().toString(), name: '', balance: '' }]);
    };
    const updateDebitCard = (id, field, value) => {
        setDebitCards(debitCards.map(c => c.id === id ? { ...c, [field]: value } : c));
    };
    const removeDebitCard = (id) => {
        if (debitCards.length > 1) setDebitCards(debitCards.filter(c => c.id !== id));
    };

    // Finish
    const handleFinish = async () => {
        await setInitialBalances([
            { accountId: '1', balance: positiveFloat(cashAmount) },
        ]);

        // Each named debit card becomes its own real account — an
        // entry with no name is left blank on purpose (skipped, not
        // created as a nameless account). Colors cycle through the
        // same palette Ahorros sub-accounts use, so they're
        // distinguishable from the very first screen instead of all
        // starting identical.
        //
        // Created in one addAccountsBatch call, not a loop of
        // addAccount() — addAccount reads `accounts` by closure, so
        // looping it here would silently drop every debit card
        // except the last one (see addAccountsBatch in
        // useFinanceStore.js for the full explanation).
        const validCards = debitCards.filter(c => c.name.trim());
        await addAccountsBatch(validCards.map((card, i) => ({
            name: card.name.trim(),
            type: 'debit',
            color: SAVINGS_COLORS[i % SAVINGS_COLORS.length],
            initialBalance: positiveFloat(card.balance),
        })));

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
        return true;
    };

    // Step content
    const renderStep = () => {
        switch (step) {
            // Step 1 - welcome & name
            case 1:
                return (
                    <>
                        <View style={styles.iconBadge}><IconSparkle color={theme.brand} size={30} /></View>
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
                        <View style={styles.iconBadge}><tip.Icon color={theme.brand} size={30} /></View>
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
                                <IconChevronLeft color={theme.ink} size={16} />
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
                        <View style={styles.iconBadge}><IconCash color={theme.brand} size={30} /></View>
                        <Text style={styles.title}>Tu dinero actual</Text>
                        <Text style={styles.subtitle}>
                            Ingresa cuanto dinero tienes en este momento para empezar con tu balance real
                        </Text>

                        {/* Cash */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>{ACCOUNT_LABELS.cash}</Text>
                            <DecimalInput
                                style={styles.input}
                                value={cashAmount}
                                onChangeText={setCashAmount}
                                placeholder="$0.00"
                                placeholderTextColor={theme.muted}
                            />
                        </View>

                        {/* Debit — each entry becomes its own real
                            account (see handleFinish + addAccountsBatch
                            in useFinanceStore.js), so this can be as
                            many cards as the person actually has. */}
                        <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                            TARJETAS DE DÉBITO
                        </Text>
                        {debitCards.map((card, index) => (
                            <View style={styles.accountCard} key={card.id}>
                                <View style={styles.accountCardHeader}>
                                    <IconCard color={theme.muted} size={30} />
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
                        <TouchableOpacity style={styles.addBtn} onPress={addDebitCard}>
                            <Text style={styles.addBtnText}>+ Agregar otra tarjeta</Text>
                        </TouchableOpacity>
                        <Text style={styles.helperNote}>
                            Déjala en blanco si no tienes (o no quieres agregar) una tarjeta de débito — puedes agregar más después desde Home.
                        </Text>

                        <View style={styles.bottomRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                                <IconChevronLeft color={theme.ink} size={16} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.nextBtn}
                                onPress={handleFinish}
                            >
                                <Text style={styles.nextBtnText}>¡Listo, empezar!</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )
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
                                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
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