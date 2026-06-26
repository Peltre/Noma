// General app config: userName, themes, and other app functionalities
import { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import styles from './SettingsScreen.styles';

import { useFinance } from "../store/FinanceContext";
import { removeData } from "../store/storage";

export default function SettingsScreen() {
    const { settings, updateSettings } = useFinance();
    const [userName, setUserName] = useState('');

    // Sync input with saved value
    useEffect(() => {
        setUserName(settings.userName);
    }, [settings.userName]);

    const handleSave = async () => {
        if (!userName.trim()) {
            Alert.alert('Nombre invalido', 'Ingresa tu nombre');
            return;
        }
        await updateSettings({ userName: userName.trim() });
        Alert.alert('Guardado', 'Tu nombre ha sido actualizado');
    };

    // Erase all data from the app (fresh restart)
    const handleReset = () => {
        Alert.alert(
            'Borrar todos los datos',
            '¿Estás seguro? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Borrar todo',
                    style: 'destructive',
                    onPress: async () => {
                        await removeData('accounts');
                        await removeData('transactions');
                        await removeData('creditCards');
                        await removeData('settings');
                        Alert.alert('Datos borrados', 'Reinicia la app para ver los cambios.');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Configuración</Text>
                </View>

                {/* Profile */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Perfil</Text>
                    <View style={styles.card}>
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIcon}>
                                <Text style={styles.fieldIconEmoji}>👤</Text>
                            </View>
                            <View style={styles.fieldInfo}>
                                <Text style={styles.fieldLabel}>Tu nombre</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={userName}
                                    onChangeText={setUserName}
                                    placeholder="Como te llamas?"
                                    placeholderTextColor="B0A898"
                                    returnKeyType="done"
                                    onSubmitEditing={handleSave}
                                />
                            </View>
                        </View>
                        <View style={[styles.fieldRow, styles.fieldRowLast]}>
                            <View style={styles.fieldIcon}>
                                <Text style={styles.fieldIconEmoji}>💱</Text>
                            </View>
                            <View style={styles.fieldInfo}>
                                <Text style={styles.fieldLabel}>Moneda</Text>
                                <Text style={styles.fieldValue}>MXN - Peso mexicano</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Save button */}
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                >
                    <Text style={styles.saveBtnText}>Guardar cambios</Text>
                </TouchableOpacity>

                {/* Danger zone - reset btn */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Zona de peligro</Text>
                    <View style={styles.dangerCard}>
                        <TouchableOpacity
                            style={styles.dangerRow}
                            onPress={handleReset}
                        >
                            <View style={styles.dangerIcon}>
                                <Text style={styles.fieldIconEmoji}>🗑️</Text>
                            </View>
                            <Text style={styles.dangerLabel}>Borrar todos los datos</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.versionText}>Noma v1.0.0</Text>
                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    )
}