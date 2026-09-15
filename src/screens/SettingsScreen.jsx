// General app config: userName, currency, and other app functionalities
import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import createSettingsStyles from './SettingsScreen.styles';

import { useFinance } from '../store/FinanceContext';
import { useTheme, useStyles } from '../store/useTheme';
import { CURRENCIES } from '../constants';
import { IconUser, IconCurrency, IconTrash, IconCheck, IconChevronRight, IconPencil } from '../components/Icons';
import { ScreenHeader, SectionHeader, Sheet, Button, GlassCard, useToast } from '../components/ui';

// Moneda picker — a real conversion, not just a display preference:
// rescales every stored amount (FinanceContext's changeCurrency)
// using a live exchange rate, the one thing in this offline app that
// needs internet. Gated behind a confirmation, unlike a theme choice
// — this can't be undone with a second tap.
function CurrencyPickerSheet({ onClose }) {
    const toast = useToast();
    const { settings, changeCurrency } = useFinance();
    const { theme } = useTheme();
    const styles = useStyles(createSettingsStyles);
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
                            toast.error('Sin conexión', result.error);
                            return;
                        }
                        onClose();
                        toast.success(
                            `Ahora usas ${currency?.label ?? code}`,
                            `Tipo de cambio: 1 ${settings.currency} = ${result.rate.toFixed(4)} ${code}.`,
                        );
                    },
                },
            ]
        );
    };

    return (
        <Sheet
            onClose={onClose}
            dismissable={!converting}
            title="Moneda"
            subtitle="Cambiar de moneda convierte automáticamente todo tu dinero — cuentas, tarjetas, ahorros y movimientos — al tipo de cambio del momento."
        >
            <View style={styles.pickerList}>
                {CURRENCIES.map((c, i) => {
                    const isActive = settings.currency === c.code;
                    return (
                        <TouchableOpacity
                            key={c.code}
                            style={[styles.pickerRow, i === CURRENCIES.length - 1 && styles.rowLast]}
                            onPress={() => handlePick(c.code)}
                            activeOpacity={0.7}
                            disabled={converting}
                        >
                            <View style={styles.rowInfo}>
                                <Text style={styles.pickerName}>{c.code}</Text>
                                <Text style={styles.pickerDesc}>{c.label}</Text>
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
        </Sheet>
    );
}

export default function SettingsScreen() {
    const navigation = useNavigation();
    const toast = useToast();
    const { settings, updateSettings, resetEverything } = useFinance();
    const { theme } = useTheme();
    const styles = useStyles(createSettingsStyles);
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
            toast.error('Falta tu nombre', 'Escribe cómo quieres que te llame.');
            return;
        }
        await updateSettings({ userName: userName.trim() });
        setIsEditingName(false);
        toast.success('Nombre actualizado');
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
                        await resetEverything();
                        toast.success('Datos borrados', 'Empecemos de nuevo.');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <ScreenHeader title="Configuración" onBack={() => navigation.goBack()} />

                {/* Profile */}
                <View style={styles.section}>
                    <SectionHeader title="Perfil" />
                    <GlassCard style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.rowIcon}>
                                <IconUser color={theme.brand} />
                            </View>
                            <View style={styles.rowInfo}>
                                <Text style={styles.rowLabel}>Tu nombre</Text>
                                {isEditingName ? (
                                    <TextInput
                                        ref={nameInputRef}
                                        style={styles.rowInput}
                                        value={userName}
                                        onChangeText={setUserName}
                                        placeholder="¿Cómo te llamas?"
                                        placeholderTextColor={theme.inkDim}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSave}
                                    />
                                ) : (
                                    <Text style={styles.rowValue}>{userName}</Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.rowAction}
                                onPress={() => setIsEditingName(true)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                accessibilityRole="button"
                                accessibilityLabel="Editar nombre"
                            >
                                <IconPencil color={theme.brand} size={16} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.row, styles.rowLast]}
                            onPress={() => setShowCurrencyPicker(true)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowIcon}>
                                <IconCurrency color={theme.brand} />
                            </View>
                            <View style={styles.rowInfo}>
                                <Text style={styles.rowLabel}>Moneda</Text>
                                <Text style={styles.rowValue}>
                                    {settings.currency} · {CURRENCIES.find(c => c.code === settings.currency)?.label ?? settings.currency}
                                </Text>
                            </View>
                            <IconChevronRight color={theme.inkDim} size={14} />
                        </TouchableOpacity>
                    </GlassCard>
                    {isEditingName && (
                        <View style={styles.actions}>
                            <Button label="Guardar cambios" onPress={handleSave} />
                        </View>
                    )}
                </View>

                {/* Volver a ver el recorrido de la bienvenida */}
                <View style={styles.section}>
                    <SectionHeader title="Ayuda" />
                    <GlassCard style={styles.card}>
                        <TouchableOpacity
                            style={[styles.row, styles.rowLast]}
                            onPress={() => updateSettings({ showTour: true })}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                        >
                            <View style={styles.rowInfo}>
                                <Text style={styles.rowValue}>Ver el recorrido</Text>
                                <Text style={styles.rowLabel}>Las cuatro pantallas de la bienvenida, otra vez</Text>
                            </View>
                        </TouchableOpacity>
                    </GlassCard>
                </View>

                {/* Danger zone - reset btn */}
                <View style={styles.section}>
                    <SectionHeader title="Zona de peligro" />
                    <GlassCard style={styles.card}>
                        <TouchableOpacity
                            style={[styles.row, styles.rowLast]}
                            onPress={handleReset}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dangerIcon}>
                                <IconTrash color={theme.moneyOut} />
                            </View>
                            <View style={styles.rowInfo}>
                                <Text style={styles.dangerLabel}>Borrar todos los datos</Text>
                                <Text style={styles.rowLabel}>Cuentas, tarjetas, ahorros y movimientos</Text>
                            </View>
                        </TouchableOpacity>
                    </GlassCard>
                </View>

                <Text style={styles.versionText}>Noma v1.0.0</Text>
                <View style={styles.bottomPadding} />
            </ScrollView>

            {showCurrencyPicker && (
                <CurrencyPickerSheet onClose={() => setShowCurrencyPicker(false)} />
            )}
        </View>
    );
}