// Form to register a new credit card
// Accessed from a button in CardScreen

import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrencyShort } from '../utils';
import styles from './AddCardScreen.styles';

export default function AddCardScreen() {
    const navigation = useNavigation();
    const { addCreditCard } = useFinanceStore();

    // Form state
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [cutoffDay, setCutoffDay] = useState('');
    const [paymentDay, setPaymentDay] = useState('');

    const handleConfirm = async() => {
        // Basic validations
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Ingresa el nombre de la tarjeta');
            return;
        }
        if (!limit || parseFloat(limit) <= 0) {
            Alert.alert('Limite invalido', 'Ingresa un limite mayor a 0');
            return;
        }
        if (!cutoffDay || parseInt(cutoffDay) < 1 || parseInt(cutoffDay) > 31) {
            Alert.alert('Dia invalido', 'El dia de corte debe ser entre 1 y 31');
            return;
        }
        if (!paymentDay || parseInt(paymentDay) < 1 || parseInt(paymentDay) > 31) {
            Alert.alert('Dia invalido', 'El dia de pago debe ser entre 1 y 31');
            return;
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
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>    
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Nueva tarjeta</Text>
                </View>

                {/* In real time preview to see how the card will look*/}
                <View style={styles.cardPreview}>
                    <View style={styles.cardPreviewTop}>
                        <Text style={styles.cardPreviewName}>
                            {name || 'Nombre tarjeta'}
                        </Text>
                        <Text style={styles.cardPreviewEmoji}>💳</Text>
                    </View>
                    <View>
                        <Text style={styles.cardPreviewLimitLabel}>Limite</Text>
                        <Text style={styles.cardPreviewLimit}>
                            {limit ? formatCurrencyShort(parseFloat(limit)) : '$0' }
                        </Text>
                        <View style={styles.cardPreviewMeta}>
                            <Text style={styles.cardPreviewMetaText}>
                                Corte: día { cutoffDay || '-' }
                            </Text>
                            <Text style={styles.cardPreviewMetaText}>
                                Pago: día { paymentDay || '-' }
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actual form */}
                <View style={styles.form}>

                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text styles={styles.fieldLabel}>Nombre de la tarjeta</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder='Ej. BBVA Azul, Amex Gold...'
                            placeholderTextColor="#B0A898"
                        />
                    </View>

                    {/* Limit */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Limite de credito</Text>
                        <TextInput
                            style={styles.input}
                            value={limit}
                            onChangeText={setLimit}
                            placeholder='$0.00'
                            placeholderTextColor="#B0A898"
                            keyboardType="decimal-pad"
                        />
                    </View>

                    {/* Cutoff & payment days */}
                    <View style={styles.row}>
                        <View style={styles.rowField}>
                            <Text style={styles.fieldLabel}>Día de corte</Text>
                            <TextInput
                                style={styles.input}
                                value={cutoffDay}
                                onChangeText={setCutoffDay}
                                placeholder='15'
                                placeholderTextColor="#B0A898"
                                keyboardType='number-pad'
                                maxLength={2}
                            />
                            <Text style={styles.inputHint}>Día del mes (1 - 31)</Text>
                        </View>
                        <View style={styles.rowField}>
                            <Text style={styles.fieldLabel}>Día de pago</Text>
                            <TextInput
                                style={styles.input}
                                value={paymentDay}
                                onChangeText={setPaymentDay}
                                placeholder='10'
                                placeholderTextColor="#B0A898"
                                keyboardType='number-pad'
                                maxLength={2}
                            />
                            <Text style={styles.inputHint}>Día del mes (1 - 31)</Text>
                        </View>
                    </View>

                    {/* Confirmation & submission */}
                    <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmBtnText}>
                            Guardar tarjeta
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.bottomPadding}/>
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
}

