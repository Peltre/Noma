import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../store/useTheme';
import { FontSize, Spacing } from '../../constants';

export default function SectionHeader({ title, actionLabel, onAction, style }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.row, style]}>
            <Text style={[styles.title, { color: theme.inkDim }]}>{title}</Text>
            {!!actionLabel && (
                <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.action, { color: theme.brand }]}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.md + 2,
        marginBottom: Spacing.sm + 1,
    },
    title: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        letterSpacing: 1.6,
        textTransform: 'uppercase',
    },
    action: { fontSize: FontSize.sm, fontWeight: '700' },
});