// Button to add transaction, will be featured inside of homescreen
import { useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Shadow } from '../constants';
import { useTheme } from '../store/useTheme';

export default function FloatingButton({ onPress }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <TouchableOpacity
            style={styles.btn}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Text style={styles.icon}>+</Text>
        </TouchableOpacity>
    );
}

function createStyles(theme) {
    return StyleSheet.create({
        btn: {
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: theme.ink,
            justifyContent: 'center',
            alignItems: 'center',
            ...Shadow.float,
        },
        icon: {
            color: theme.bg,
            fontSize: 28,
            fontWeight: '300',
            lineHeight: 32,
        },
    });
}