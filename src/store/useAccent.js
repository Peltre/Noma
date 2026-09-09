// Acento contextual. El turquesa de marca es el acento por defecto de
// toda la app (botón primario, pastilla seleccionada, borde de un campo
// enfocado, asterisco de requerido). Pero ese turquesa es también el
// color de "ingreso", así que en una pantalla que registra un GASTO los
// bordes y selecciones en turquesa decían lo contrario de lo que la
// persona estaba haciendo.
//
// AccentProvider cambia el acento para todo lo que tenga dentro: los
// componentes de ui (Button, Pill, Field, SelectField, DatePickerField,
// DecimalInput, EmptyState) leen useAccent() y caen a theme.brand si no
// hay proveedor. Un `accent` explícito en un componente sigue ganando:
// el proveedor es el default, no una orden.
//
//   <AccentProvider color={theme.moneyOut} on={theme.brandOn}>
//       ...toda la pantalla de gasto...
//   </AccentProvider>
import { createContext, useContext, useMemo } from 'react';
import { useTheme } from './useTheme';

const AccentContext = createContext(null);

export function AccentProvider({ color, on, children }) {
    const value = useMemo(() => (color ? { color, on } : null), [color, on]);
    return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function useAccent() {
    const { theme } = useTheme();
    const ctx = useContext(AccentContext);
    return {
        accent: ctx?.color || theme.brand,
        accentOn: ctx?.on || theme.brandOn,
    };
}