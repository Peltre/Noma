// Misma anatomía en las cinco pantallas con estado vacío: icono soft,
// título, una línea que explica, un botón que actúa.
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../store/useTheme';
import { useAccent } from '../../store/useAccent';
import { FontSize, Radius, Spacing } from '../../constants';
import { displayFont } from '../../setup/Typography';
import Button from './Button';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    accent,
    style,
}) {
    const { theme } = useTheme();
    const { accent: ctxAccent } = useAccent();
    const tone = accent || ctxAccent;

    return (
        <View style={[styles.wrap, { borderColor: theme.border }, style]}>
            {Icon && (
                <View style={[styles.icon, { backgroundColor: tone + '29' }]}>
                    <Icon color={tone} size={20} />
                </View>
            )}
            <Text style={[styles.title, displayFont('700'), { color: theme.ink }]}>{title}</Text>
            {!!description && <Text style={[styles.desc, { color: theme.inkMid }]}>{description}</Text>}
            {!!actionLabel && (
                <Button label={actionLabel} onPress={onAction} accent={tone} compact style={styles.btn} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        paddingVertical: Spacing.xl - 4,
        paddingHorizontal: Spacing.lg,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: Radius.md,
    },
    icon: {
        width: 42, height: 42, borderRadius: Radius.xs + 2,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.sm + 4,
    },
    title: { fontSize: FontSize.lg - 1, letterSpacing: -0.2, textAlign: 'center' },
    desc: {
        fontSize: FontSize.sm, textAlign: 'center', marginTop: 6,
        lineHeight: FontSize.sm * 1.45, maxWidth: 260,
    },
    btn: { marginTop: Spacing.md, minWidth: 170 },
});