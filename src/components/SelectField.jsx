// Pressable field that opens a bottom sheet with a list of options —
// same modal/backdrop/sheet pattern DatePickerField already uses for
// the date picker, applied to a plain single-select list. Meant to
// replace ad-hoc pill rows anywhere a screen needs a real dropdown
// instead of a horizontally-scrolling chip list (History's filters
// being the first case).
import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../store/useTheme';
import { FontSize, Spacing, Radius } from '../constants';
import { IconChevronDown, IconCheck } from './Icons';

export default function SelectField({
    label,               // small caption above the current value, e.g. "TIPO"
    value,                // selected option's key
    options,              // [{ key, label }]
    onChange,             // (key) => void
    style,
}) {
    const { theme } = useTheme();
    const styles = fieldStyles(theme);
    const [open, setOpen] = useState(false);
    const selected = options.find(o => o.key === value);

    return (
        <>
            <TouchableOpacity style={[styles.field, style]} onPress={() => setOpen(true)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                    {label && <Text style={styles.label}>{label}</Text>}
                    <Text style={styles.value} numberOfLines={1}>{selected?.label ?? '—'}</Text>
                </View>
                <IconChevronDown color={theme.muted} size={14} />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    {label && <Text style={styles.sheetTitle}>{label}</Text>}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {options.map(opt => {
                            const isSelected = opt.key === value;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={styles.option}
                                    onPress={() => { onChange(opt.key); setOpen(false); }}
                                >
                                    <Text style={[styles.optionText, isSelected && { color: theme.brand, fontWeight: '800' }]}>
                                        {opt.label}
                                    </Text>
                                    {isSelected && <IconCheck color={theme.brand} size={14} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
}

function fieldStyles(theme) {
    return StyleSheet.create({
        field: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Spacing.xs,
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            borderWidth: 1.5,
            borderColor: theme.border,
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
        },
        label: {
            fontSize: FontSize.xs - 2,
            fontWeight: '800',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 1,
        },
        value: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.ink,
        },
        backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
        sheet: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            padding: Spacing.lg,
            paddingBottom: Spacing.xl,
            maxHeight: '60%',
        },
        handle: {
            width: 36, height: 4,
            borderRadius: 2,
            backgroundColor: theme.border,
            alignSelf: 'center',
            marginBottom: Spacing.md,
        },
        sheetTitle: {
            fontSize: FontSize.lg,
            fontWeight: '800',
            color: theme.ink,
            marginBottom: Spacing.sm,
            textAlign: 'center',
        },
        option: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        optionText: {
            fontSize: FontSize.md,
            color: theme.ink,
            fontWeight: '600',
        },
    });
}