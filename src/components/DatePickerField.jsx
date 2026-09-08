// Campo presionable que abre el selector nativo de fecha en vez de
// pedir que la escriban a mano.
//
// ── Por qué NO usa @react-native-community/datetimepicker ──
// Ese paquete registra la vista nativa `RNDateTimePicker`, y Expo Go
// SDK 57 ya trae Expo UI incorporado, que registra una vista con el
// mismo nombre. El resultado era:
//
//   Invariant Violation: Tried to register two views with the same
//   name RNDateTimePicker
//
// Y como AppNavigator importa las 9 pantallas al evaluar el módulo, y
// tres de ellas traen este componente, el error tumbaba TODO el
// subárbol del navegador. La app arrancaba mostrando solo
// AppBackground —que ya se había evaluado— y nada más. Cuatro pantallas
// en blanco por un choque de nombres.
//
// La salida es el reemplazo oficial de Expo UI, que Expo documenta
// justo para esto. Va sobre SwiftUI en iOS y Jetpack Compose en
// Android, así que además se ve más moderno que el community.
//
// ── Diferencia de API que sí importa ──
// NO existe `DateTimePickerAndroid.open()`. En Android hay que RENDERIZAR
// el componente con presentation="dialog": el diálogo se abre al montar,
// dispara onValueChange al confirmar y onDismiss al cancelar, y el
// llamador tiene que desmontarlo. De ahí el estado androidOpen que antes
// no hacía falta.
//
// En iOS sigue igual que antes: el spinner va dentro de la Sheet con
// Cancelar/Listo, porque iOS nunca regala un botón de cerrar.
//
// La superficie del campo sale de fieldSurface, igual que Field y
// SelectField.
import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../store/useTheme';
import { FontSize, Spacing } from '../constants';
import { fieldSurface } from './ui/Field';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import { IconCalendar } from './Icons';

export default function DatePickerField({
    value,               // Date | null
    onChange,             // (date: Date) => void
    placeholder = 'Selecciona una fecha',
    minimumDate,
    displayFormat = "d 'de' MMMM yyyy",
    style,
}) {
    const { theme } = useTheme();
    const [iosOpen, setIosOpen] = useState(false);
    const [androidOpen, setAndroidOpen] = useState(false);
    const [tempDate, setTempDate] = useState(value || new Date());

    const openPicker = () => {
        if (Platform.OS === 'android') {
            setAndroidOpen(true);
        } else {
            setTempDate(value || new Date());
            setIosOpen(true);
        }
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.field, fieldSurface(theme, { focused: iosOpen }), style]}
                onPress={openPicker}
                activeOpacity={0.7}
                accessibilityRole="button"
            >
                <Text style={[styles.text, { color: value ? theme.ink : theme.inkDim }]} numberOfLines={1}>
                    {value ? format(value, displayFormat, { locale: es }) : placeholder}
                </Text>
                <IconCalendar color={theme.inkDim} size={15} />
            </TouchableOpacity>

            {/* Android: el diálogo se abre al montarse, así que montarlo ES
                abrirlo. Se desmonta en ambas salidas. */}
            {Platform.OS === 'android' && androidOpen && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    presentation="dialog"
                    minimumDate={minimumDate}
                    onValueChange={(event, selectedDate) => {
                        setAndroidOpen(false);
                        if (selectedDate) onChange(selectedDate);
                    }}
                    onDismiss={() => setAndroidOpen(false)}
                />
            )}

            {Platform.OS === 'ios' && iosOpen && (
                <Sheet onClose={() => setIosOpen(false)} title="Fecha">
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="spinner"
                        minimumDate={minimumDate}
                        locale="es"
                        themeVariant={theme.statusBarStyle === 'light' ? 'dark' : 'light'}
                        onValueChange={(event, selectedDate) => selectedDate && setTempDate(selectedDate)}
                    />
                    <View style={styles.btns}>
                        <Button label="Cancelar" variant="secondary" onPress={() => setIosOpen(false)} />
                        <Button
                            label="Listo"
                            onPress={() => { onChange(tempDate); setIosOpen(false); }}
                            style={{ flex: 2 }}
                        />
                    </View>
                </Sheet>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    field: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
    text: { flex: 1, fontSize: FontSize.md, letterSpacing: 0.2 },
    btns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});