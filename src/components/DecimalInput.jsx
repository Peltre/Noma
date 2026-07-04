// TextInput preset for money/number fields (keyboardType="decimal-pad").
// iOS's decimal-pad has no return key at all — there's no built-in way
// to dismiss it. This adds a small accessory bar with a "Listo" button
// above the keyboard so the flow doesn't get stuck. Android already
// shows a checkmark/done key on its numeric keyboard, so the accessory
// bar only renders on iOS; everything else behaves like a plain
// TextInput.
import { TextInput, InputAccessoryView, View, Text, TouchableOpacity, Platform, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from '../store/useTheme';

const ACCESSORY_ID = 'decimal-pad-done';

export default function DecimalInput({ style, keyboardType = 'decimal-pad', ...props }) {
    const { theme } = useTheme();

    return (
        <>
            <TextInput
                {...props}
                keyboardType={keyboardType}
                style={style}
                inputAccessoryViewID={Platform.OS === 'ios' ? ACCESSORY_ID : undefined}
            />
            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID={ACCESSORY_ID}>
                    <View style={[styles.bar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                        <TouchableOpacity onPress={() => Keyboard.dismiss()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={[styles.doneText, { color: theme.brand }]}>Listo</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderTopWidth: 1,
    },
    doneText: {
        fontSize: 16,
        fontWeight: '700',
    },
});