// Cómo se ve un movimiento: ícono, color y etiqueta, según su tipo y
// categoría. Una sola fuente para Inicio e Historial; antes cada una
// tenía su copia y podían salirse de sincronía.
//
// Las cuatro familias del tema (ver themes.js): teal es tu dinero,
// ámbar sale hoy, violeta es un compromiso a futuro, azul es dinero
// apartado. Un retiro simple (cajero, sin categoría) no es ninguna, así
// que se queda neutro.
import {
    IconCalendarClock, IconCardPayment, IconPercent, IconGoal,
    IconBanknotePlus, IconReceipt, IconSwap, IconWallet,
} from '../components/Icons';

export function getTxnVisual(theme, type, category) {
    if (category === 'msi') return { Icon: IconCalendarClock, color: theme.msi, bg: theme.msiSoft, label: 'Mensualidad' };
    if (category === 'card_payment') return { Icon: IconCardPayment, color: theme.cardPayment, bg: theme.cardPaymentSoft, label: 'Pago de tarjeta' };
    // El interés es un ingreso real pero lo genera la app: lleva el
    // acento de ahorro, como en todos lados donde aparece.
    if (category === 'interest') return { Icon: IconPercent, color: theme.savings, bg: theme.savingsSoft, label: 'Interés' };
    // "Objetivo cumplido" es un gasto por debajo (ver handleRedeemGoal
    // en SavingsScreen), pero es dinero que ya estaba apartado, no una
    // salida nueva: mismo acento que el interés para que no se lea como
    // un Gasto más.
    if (category === 'goal') return { Icon: IconGoal, color: theme.savings, bg: theme.savingsSoft, label: 'Objetivo cumplido' };
    if (type === 'income') return { Icon: IconBanknotePlus, color: theme.moneyIn, bg: theme.moneyInSoft, label: 'Ingreso' };
    if (type === 'expense') return { Icon: IconReceipt, color: theme.moneyOut, bg: theme.moneyOutSoft, label: 'Gasto' };
    if (type === 'transfer') return { Icon: IconSwap, color: theme.transfer, bg: theme.transferSoft, label: 'Traspaso' };
    // En la práctica no se alcanza: nada crea un `withdrawal` sin
    // card_payment o msi como categoría. Queda como respaldo seguro.
    return { Icon: IconWallet, color: theme.muted, bg: theme.border, label: 'Movimiento' };
}

// El color de una cuenta: el suyo si lo eligió, gris de efectivo si es
// efectivo, tinta tenue si no hay nada.
export const getAccountColor = (theme, account) =>
    account?.color || (account?.type === 'cash' ? theme.cashTone : theme.inkDim);