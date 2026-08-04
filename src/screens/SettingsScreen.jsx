// General app config: userName, themes, and other app functionalities
import { useMemo, useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import createSettingsStyles from './SettingsScreen.styles';

import { useFinance } from "../store/FinanceContext";
import { useTheme } from "../store/useTheme";
import { CURRENCIES } from "../constants";
import { IconUser, IconCurrency, IconTrash, IconCheck, IconChevronLeft, IconChevronRight, IconPencil } from '../components/Icons';

// Moneda picker — a real conversion, not just a display preference:
// picking a different currency here rescales every stored amount in
// the app (see FinanceContext's changeCurrency) using a live exchange
// rate, which is the one thing in this fully-offline app that
// actually needs internet. Modeled after the Apariencia section
// right below it (radio rows, tap to apply) but gated behind a
// confirmation — unlike a theme, this can't be undone with a second
// tap once the amounts have already been rescaled.
function CurrencyPickerModal({ visible, onClose }) {
    const { settings, changeCurrency } = useFinance();
    const { theme } = useTheme();
    const styles = useMemo(() => createSettingsStyles(theme), [theme]);
    const [converting, setConverting] = useState(false);

    const handlePick = (code) => {
        if (code === settings.currency || converting) return;
        const currency = CURRENCIES.find(c => c.code === code);
        Alert.alert(
            `Cambiar a ${code}`,
            `Todos tus montos se convertirán de ${settings.currency} a ${code} usando el tipo de cambio actual. Esto requiere conexión a internet y no se puede deshacer con un solo toque. ¿Continuar?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Continuar',
                    onPress: async () => {
                        setConverting(true);
                        const result = await changeCurrency(code);
                        setConverting(false);
                        if (result?.error) {
                            Alert.alert('Sin conexión', result.error);
                            return;
                        }
                        onClose();
                        Alert.alert(
                            'Moneda actualizada',
                            `Tu app ahora usa ${currency?.label ?? code}. Tipo de cambio usado: 1 ${settings.currency} = ${result.rate.toFixed(4)} ${code}.`
                        );
                    },
                },
            ]
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalBg}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={converting ? undefined : onClose} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Moneda</Text>
                    <Text style={styles.sheetSubtitle}>
                        Cambiar de moneda convierte automáticamente todo tu dinero — cuentas, tarjetas, ahorros y movimientos — al tipo de cambio del momento.
                    </Text>

                    <View style={styles.card}>
                        {CURRENCIES.map((c, i) => {
                            const isActive = settings.currency === c.code;
                            return (
                                <TouchableOpacity
                                    key={c.code}
                                    style={[styles.themeRow, i === CURRENCIES.length - 1 && styles.fieldRowLast]}
                                    onPress={() => handlePick(c.code)}
                                    activeOpacity={0.7}
                                    disabled={converting}
                                >
                                    <View style={styles.fieldInfo}>
                                        <Text style={styles.themeName}>{c.code}</Text>
                                        <Text style={styles.themeDesc}>{c.label}</Text>
                                    </View>
                                    {converting && !isActive ? null : (
                                        <View style={[styles.radio, isActive && styles.radioActive]}>
                                            {isActive && <IconCheck color={theme.brandOn} />}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {converting && (
                        <View style={styles.convertingRow}>
                            <ActivityIndicator color={theme.brand} />
                            <Text style={styles.convertingText}>Convirtiendo tus montos…</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { settings, updateSettings, resetAll, resetSavings, resetScheduledFunds, resetSettings, resetTags } = useFinance();
    const { theme, themeName, setTheme, themes, themeNames } = useTheme();
    const styles = useMemo(() => createSettingsStyles(theme), [theme]);
    const [userName, setUserName] = useState('');

    // The name starts read-only — tapping the pencil is what turns it
    // into an editable field (and is the only thing that reveals the
    // save button below). Before this, the field was always an open
    // TextInput with no indication that typing in it didn't actually
    // save anything until a separate, easy-to-miss button further
    // down got tapped too.
    const [isEditingName, setIsEditingName] = useState(false);
    const nameInputRef = useRef(null);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

    useEffect(() => {
        if (isEditingName) nameInputRef.current?.focus();
    }, [isEditingName]);

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
        setIsEditingName(false);
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
                        await resetTags();
                        Alert.alert('Datos borrados', 'Empecemos de nuevo.');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

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
                                {isEditingName ? (
                                    <TextInput
                                        ref={nameInputRef}
                                        style={styles.fieldInput}
                                        value={userName}
                                        onChangeText={setUserName}
                                        placeholder="Como te llamas?"
                                        placeholderTextColor={theme.muted}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSave}
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>{userName}</Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.editNameBtn}
                                onPress={() => setIsEditingName(true)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <IconPencil color={theme.brand} size={16} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.fieldRow, styles.fieldRowLast]}
                            onPress={() => setShowCurrencyPicker(true)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.fieldIcon}>
                                <IconCurrency color={theme.ink} />
                            </View>
                            <View style={styles.fieldInfo}>
                                <Text style={styles.fieldLabel}>Moneda</Text>
                                <Text style={styles.fieldValue}>
                                    {settings.currency} - {CURRENCIES.find(c => c.code === settings.currency)?.label ?? settings.currency}
                                </Text>
                            </View>
                            <IconChevronRight color={theme.muted} size={14} />
                        </TouchableOpacity>
                    </View>
                    {isEditingName && (
                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveBtnText}>Guardar cambios</Text>
                        </TouchableOpacity>
                    )}
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
                                    <View style={[styles.themeSwatch, { borderColor: t.border }]}>
                                        <View style={styles.themeSwatchGrid}>
                                            <View style={[styles.themeSwatchTile, { backgroundColor: t.bg }]} />
                                            <View style={[styles.themeSwatchTile, { backgroundColor: t.surface }]} />
                                            <View style={[styles.themeSwatchTile, { backgroundColor: t.brand }]} />
                                            <View style={[styles.themeSwatchTile, { backgroundColor: t.bg }]}>
                                                <View style={[styles.themeSwatchTileFill, { backgroundColor: t.brandSoft }]} />
                                            </View>
                                        </View>
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

            <CurrencyPickerModal
                visible={showCurrencyPicker}
                onClose={() => setShowCurrencyPicker(false)}
            />
        </SafeAreaView>
    )
}