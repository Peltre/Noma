// Form to register a new credit card
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatCurrencyShort } from '../utils';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';
import styles from './AddCardScreen.styles';
import { useFinance } from '../store/FinanceContext';

// Live card preview colors cycling
const PREVIEW_GRADIENTS = ['#1A1A2E', '#16213E', '#0F3460', '#1B1B2F'];

export default function AddCardScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { addCreditCard, creditCards } = useFinance();

    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [cutoffDay, setCutoffDay] = useState('');
    const [paymentDay, setPaymentDay] = useState('');

    // Pick color based on how many cards already exist
    const previewColor = PREVIEW_GRADIENTS[creditCards.length % PREVIEW_GRADIENTS.length];

    const handleConfirm = async () => {
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Ingresa el nombre de la tarjeta'); return;
        }
        if (!limit || parseFloat(limit) <= 0) {
            Alert.alert('Límite inválido', 'Ingresa un límite mayor a 0'); return;
        }
        if (!cutoffDay || parseInt(cutoffDay) < 1 || parseInt(cutoffDay) > 31) {
            Alert.alert('Día inválido', 'El día de corte debe ser entre 1 y 31'); return;
        }
        if (!paymentDay || parseInt(paymentDay) < 1 || parseInt(paymentDay) > 31) {
            Alert.alert('Día inválido', 'El día de pago debe ser entre 1 y 31'); return;
        }
        await addCreditCard({
            name: name.trim(),
            limit: parseFloat(limit),
            cutoffDay: parseInt(cutoffDay),
            paymentDay: parseInt(paymentDay),
        });
        navigation.goBack();
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Nueva tarjeta</Text>
                </View>

                {/* Live card preview */}
                <View style={[styles.cardPreview, { backgroundColor: previewColor }]}>
                    {/* Decorative circles */}
                    <View style={styles.previewOrbA} />
                    <View style={styles.previewOrbB} />

                    <View style={styles.previewTop}>
                        <Text style={styles.previewBank}>
                            {name || 'Nombre tarjeta'}
                        </Text>
                        <View style={styles.previewChip}>
                            <View style={styles.previewChipInner} />
                        </View>
                    </View>

                    <View style={styles.previewBottom}>
                        <View>
                            <Text style={styles.previewLimitLbl}>Límite</Text>
                            <Text style={styles.previewLimit}>
                                {limit ? formatCurrencyShort(parseFloat(limit)) : '—'}
                            </Text>
                        </View>
                        <View style={styles.previewDates}>
                            <Text style={styles.previewDateText}>
                                Corte: {cutoffDay || '—'}
                            </Text>
                            <Text style={styles.previewDateText}>
                                Pago: {paymentDay || '—'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    <Text style={styles.fieldLabel}>NOMBRE DE LA TARJETA</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. BBVA Azul, Amex Gold..."
                        placeholderTextColor={Colors.muted}
                    />

                    <Text style={styles.fieldLabel}>LÍMITE DE CRÉDITO</Text>
                    <TextInput
                        style={styles.input}
                        value={limit}
                        onChangeText={setLimit}
                        placeholder="$0.00"
                        placeholderTextColor={Colors.muted}
                        keyboardType="decimal-pad"
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fieldLabel}>DÍA DE CORTE</Text>
                            <TextInput
                                style={styles.input}
                                value={cutoffDay}
                                onChangeText={setCutoffDay}
                                placeholder="5"
                                placeholderTextColor={Colors.muted}
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                            <Text style={styles.inputHint}>Día del mes (1–31)</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fieldLabel}>DÍA DE PAGO</Text>
                            <TextInput
                                style={styles.input}
                                value={paymentDay}
                                onChangeText={setPaymentDay}
                                placeholder="25"
                                placeholderTextColor={Colors.muted}
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                            <Text style={styles.inputHint}>Día del mes (1–31)</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                        <Text style={styles.confirmBtnText}>Guardar tarjeta</Text>
                    </TouchableOpacity>

                    <View style={{ height: Spacing.xl + Spacing.lg }} />
                </View>
            </ScrollView>
        </View>
    );
}