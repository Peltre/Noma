// Tipografía "de display": la Bricolage Grotesque en importes, títulos
// de pantalla, de hojas y de estados vacíos. El resto del texto (cuerpo,
// etiquetas, botones) usa la fuente del sistema a propósito.
//
// Antes este archivo también intentaba aplicar la Bricolage a TODO
// <Text> parcheando el módulo de react-native (applyGlobalTypography).
// En RN 0.86 con Metro eso no funciona (se parchea una copia del
// módulo) y se decidió dejar el cuerpo en la fuente del sistema, así
// que sólo queda displayFont().
import { DISPLAY_FAMILY_BY_WEIGHT } from '../constants/theme';

export const displayFont = (weight = '700') => ({
    fontFamily: DISPLAY_FAMILY_BY_WEIGHT[String(weight)] || DISPLAY_FAMILY_BY_WEIGHT['700'],
});