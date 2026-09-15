// Tema y estilos.
//
// `useTheme()` se mantiene como hook (en vez de importar el tema
// directo) para que los llamados no cambien si algún día vuelve a
// haber una preferencia real; hoy devuelve el único tema, Medianoche.
//
// `useStyles(createX)` memoriza la hoja de estilos por tema. Antes
// cada componente repetía `useMemo(() => createX(theme), [theme])`.
import { useMemo } from 'react';
import { theme } from '../constants/themes';

export function useTheme() {
    return { theme };
}

export function useStyles(createStyles) {
    return useMemo(() => createStyles(theme), [createStyles]);
}