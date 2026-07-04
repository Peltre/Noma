// Pressable field that opens the native date picker instead of asking
// the user to type a date by hand. Android opens its own modal
// natively; iOS doesn't, so we wrap the spinner in a small sheet with
// Cancelar/Listo — same rule as DecimalInput: iOS never gives you a
// close button for free, we have to add one.
import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../store/useTheme';
import { FontSize, Spacing, Radius } from '../constants';

export default function DatePickerField({
    value,               // Date | null
    onChange,             // (date: Date) => void
    placeholder = 'Selecciona una fecha',
    minimumDate,
    displayFormat = "d 'de' MMMM yyyy",
}) {
    const { theme } = useTheme();
    const styles = fieldStyles(theme);
    const [iosOpen, setIosOpen] = useState(false);
    const [tempDate, setTempDate] = useState(value || new Date());

    const openPicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: value || new Date(),
                mode: 'date',
                minimumDate,
                onChange: (event, selectedDate) => {
                    if (event.type === 'set' && selectedDate) onChange(selectedDate);
                },
            });
        } else {
            setTempDate(value || new Date());
            setIosOpen(true);
        }
    };

    return (
        <>
            <TouchableOpacity style={styles.field} onPress={openPicker} activeOpacity={0.7}>
                <Text style={value ? styles.fieldText : styles.placeholderText}>
                    {value ? format(value, displayFormat, { locale: es }) : placeholder}
                </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
                <Modal visible={iosOpen} transparent animationType="slide" onRequestClose={() => setIosOpen(false)}>
                    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setIosOpen(false)} />
                    <View style={styles.sheet}>
                        <View style={styles.sheetHeader}>
                            <TouchableOpacity onPress={() => setIosOpen(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { onChange(tempDate); setIosOpen(false); }}>
                                <Text style={styles.doneText}>Listo</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="spinner"
                            minimumDate={minimumDate}
                            locale="es"
                            onChange={(event, selectedDate) => selectedDate && setTempDate(selectedDate)}
                        />
                    </View>
                </Modal>
            )}
        </>
    );
}

function fieldStyles(theme) {
    return StyleSheet.create({
        field: {
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            borderWidth: 1,
            borderColor: theme.border,
        },
        fieldText: {
            fontSize: FontSize.md,
            color: theme.ink,
        },
        placeholderText: {
            fontSize: FontSize.md,
            color: theme.muted,
        },
        backdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        sheet: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            paddingBottom: 20,
        },
        sheetHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        cancelText: {
            fontSize: FontSize.md,
            color: theme.muted,
            fontWeight: '600',
        },
        doneText: {
            fontSize: FontSize.md,
            color: theme.brand,
            fontWeight: '700',
        },
    });
}