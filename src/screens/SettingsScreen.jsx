// General app config: userName, themes, and other app functionalities
import { useMemo, useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from 'react-native-svg';
import createSettingsStyles from './SettingsScreen.styles';

import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";

// Small line icons, same visual language as the tab bar (stroke-only,
// rounded caps) — no emojis.
function IconUser({ color }) {
    return (
        <Svg width={17} height={17} viewBox="0 0 22 22" fill="none">
            <Circle cx="11" cy="8" r="3.4" stroke={color} strokeWidth={1.6} />
            <Path
                d="M4.5 19c0.9-4.2 3.9-6.4 6.5-6.4s5.6 2.2 6.5 6.4"
                stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
            />
        </Svg>
    );
}

function IconCurrency({ color }) {
    return (
        <Svg width={17} height={17} viewBox="0 0 22 22" fill="none">
            <Circle cx="11" cy="11" r="7.5" stroke={color} strokeWidth={1.6} />
            <Path
                d="M11 6.5v9M8.4 8.7c0-1.1 1.2-1.9 2.6-1.9s2.6.8 2.6 1.7-1.1 1.4-2.6 1.6-2.6.6-2.6 1.7 1.2 1.8 2.6 1.8 2.6-.7 2.6-1.8"
                stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
            />
        </Svg>
    );
}

function IconTrash({ color }) {
    return (
        <Svg width={17} height={17} viewBox="0 0 22 22" fill="none">
            <Path
                d="M4 6h14M8.3 6V4.3a1 1 0 011-1h3.4a1 1 0 011 1V6M6.2 6l.8 12.2a1.6 1.6 0 001.6 1.5h4.8a1.6 1.6 0 001.6-1.5L16 6"
                stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
            />
            <Path d="M9.4 9.6v6M12.6 9.6v6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
    );
}

export default function SettingsScreen() {
    const { settings, updateSettings, resetAll, resetSavings, resetScheduledFunds, resetSettings } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSettingsStyles(theme), [theme]);
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
                        await resetAll();
                        await resetSavings();
                        await resetScheduledFunds();
                        await resetSettings();
                        Alert.alert('Datos borrados', 'Empecemos de nuevo.');
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
                                <IconUser color={theme.ink} />
                            </View>
                            <View style={styles.fieldInfo}>
                                <Text style={styles.fieldLabel}>Tu nombre</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={userName}
                                    onChangeText={setUserName}
                                    placeholder="Como te llamas?"
                                    placeholderTextColor={theme.muted}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSave}
                                />
                            </View>
                        </View>
                        <View style={[styles.fieldRow, styles.fieldRowLast]}>
                            <View style={styles.fieldIcon}>
                                <IconCurrency color={theme.ink} />
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
                                <IconTrash color={theme.moneyOut} />
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