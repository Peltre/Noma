// Dos formas: raíz (título 30) y apilada, con botón de regresar
// (título 20). Ninguna otra.
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../store/useTheme';
import { FontSize, Radius, Spacing } from '../../constants';
import { displayFont } from '../../setup/Typography';
import { IconChevronLeft } from '../Icons';

export default function ScreenHeader({
    title,
    subtitle,
    onBack,
    actionIcon: ActionIcon,
    onAction,
    actionStyle = 'brand', // 'brand' | 'glass'
    withInset = true,
    style,
}) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const stacked = !!onBack;

    return (
        <View style={[styles.row, withInset && { paddingTop: insets.top + 8 }, style]}>
            <View style={styles.left}>
                {stacked && (
                    <TouchableOpacity
                        style={[styles.back, { backgroundColor: theme.glassFill, borderColor: theme.glassBorder }]}
                        onPress={onBack}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel="Regresar"
                    >
                        <IconChevronLeft color={theme.ink} size={16} />
                    </TouchableOpacity>
                )}
                <View style={styles.titleWrap}>
                    <Text
                        style={[
                            styles.title,
                            displayFont('700'),
                            { color: theme.ink, fontSize: stacked ? FontSize.xl : FontSize.xxl },
                        ]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    {!!subtitle && <Text style={[styles.subtitle, { color: theme.inkDim }]}>{subtitle}</Text>}
                </View>
            </View>

            {ActionIcon && (
                <TouchableOpacity
                    style={[
                        actionStyle === 'brand' ? styles.actionBrand : styles.actionGlass,
                        actionStyle === 'brand'
                            ? { backgroundColor: theme.brand }
                            : { backgroundColor: theme.glassFill, borderColor: theme.glassBorder, borderWidth: 1 },
                    ]}
                    onPress={onAction}
                    accessibilityRole="button"
                >
                    <ActionIcon
                        color={actionStyle === 'brand' ? theme.brandOn : theme.ink}
                        bgColor={theme.brand}
                        size={20}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md + 2,
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md - 2, flex: 1 },
    titleWrap: { flex: 1 },
    title: { letterSpacing: -0.9 },
    subtitle: { fontSize: FontSize.sm, fontWeight: '500', marginTop: 5 },
    back: {
        width: 38, height: 38, borderRadius: Radius.sm, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    actionBrand: {
        width: 40, height: 40, borderRadius: Radius.full,
        alignItems: 'center', justifyContent: 'center',
    },
    actionGlass: {
        width: 38, height: 38, borderRadius: Radius.sm,
        alignItems: 'center', justifyContent: 'center',
    },
});