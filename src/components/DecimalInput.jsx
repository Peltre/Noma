// TextInput preset for money/number fields (keyboardType="decimal-pad").
// iOS's decimal-pad has no return key, so this adds a "Listo"
// accessory bar above the keyboard to dismiss it — Android already
// has a done key, so the bar only renders on iOS.
//
// Also sanitizes every keystroke: digits and a single "." only,
// capped at 2 decimals. The one shared money input in the app
// (Transaction, Onboarding, Savings, AddCard, History's edit sheet),
// so fixing it here fixes "too many decimals" everywhere at once.
import { TextInput, InputAccessoryView, View, Text, TouchableOpacity, Platform, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from '../store/useTheme';
import { useAccent } from '../store/useAccent';
import { FontSize } from '../constants';

const ACCESSORY_ID = 'decimal-pad-done';

// Strips anything that isn't a digit or ".", collapses to a single
// decimal point, and truncates (not rounds) past 2 decimal places —
// truncating is what a live input mask should do; rounding would make
// digits the person already typed change out from under them as they
// keep typing (e.g. "12.345" silently becoming "12.35").
function sanitizeDecimal(text) {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
        const [intPart, decPart] = cleaned.split('.');
        if (decPart.length > 2) {
            cleaned = `${intPart}.${decPart.slice(0, 2)}`;
        }
    }
    return cleaned;
}

export default function DecimalInput({ style, keyboardType = 'decimal-pad', onChangeText, ...props }) {
    const { theme } = useTheme();
    const { accent } = useAccent();

    const handleChangeText = (text) => {
        onChangeText?.(sanitizeDecimal(text));
    };

    return (
        <>
            <TextInput
                {...props}
                keyboardType={keyboardType}
                style={style}
                onChangeText={handleChangeText}
                inputAccessoryViewID={Platform.OS === 'ios' ? ACCESSORY_ID : undefined}
            />
            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID={ACCESSORY_ID}>
                    <View style={[styles.bar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                        <TouchableOpacity onPress={() => Keyboard.dismiss()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={[styles.doneText, { color: accent }]}>Listo</Text>
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
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
});