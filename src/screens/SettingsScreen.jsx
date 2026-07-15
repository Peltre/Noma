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
import { useNavigation } from "@react-navigation/native";
import createSettingsStyles from './SettingsScreen.styles';

import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";
import { IconUser, IconCurrency, IconTrash, IconCheck, IconChevronLeft } from '../components/Icons';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { settings, updateSettings, resetAll, resetSavings, resetScheduledFunds, resetSettings } = useFinance();
    const { theme, themeName, setTheme, themes, themeNames } = useTheme();
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
                    <View style={styles.headerLeft}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <IconChevronLeft color={theme.ink} size={16} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Configuración</Text>
                    </View>
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
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveBtnText}>Guardar cambios</Text>
                    </TouchableOpacity>
                </View>

                {/* Appearance — the 3 themes already fully defined in
                    constants/themes.js. Tapping one applies it right
                    away (setTheme persists through the same settings
                    store as everything else here), so this section
                    doesn't need its own save button — the whole screen
                    re-tinting itself is the confirmation. */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Apariencia</Text>
                    <View style={styles.card}>
                        {themeNames.map((name, i) => {
                            const t = themes[name];
                            const isActive = themeName === name;
                            return (
                                <TouchableOpacity
                                    key={name}
                                    style={[styles.themeRow, i === themeNames.length - 1 && styles.fieldRowLast]}
                                    onPress={() => setTheme(name)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.themeSwatch, { backgroundColor: t.bg, borderColor: t.border }]}>
                                        <View style={[styles.themeSwatchDot, { backgroundColor: t.brand }]} />
                                    </View>
                                    <View style={styles.fieldInfo}>
                                        <Text style={styles.themeName}>{t.label}</Text>
                                        <Text style={styles.themeDesc}>{t.description}</Text>
                                    </View>
                                    <View style={[styles.radio, isActive && styles.radioActive]}>
                                        {isActive && <IconCheck color={theme.brandOn} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

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