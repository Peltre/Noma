// Button to add transaction, will be featured inside of homescreen

import { TouchableOpacity, Text, StyleSheets } from "react-native";
import { Colors, Shadow } from '../constants';

export default function FloatingButton({ onPress }) {
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

const styles = StyleSheet.create({
    btn: {
        position:        'absolute',
        bottom:          24,
        right:           24,
        width:           58,
        height:          58,
        borderRadius:    29,
        backgroundColor: Colors.ink,
        justifyContent:  'center',
        alignItems:      'center',
        ...Shadow.float,
    },
    icon: {
        color:      Colors.white,
        fontSize:   28,
        fontWeight: '300',
        lineHeight: 32,
    },
});