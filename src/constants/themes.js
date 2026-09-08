// Medianoche. La familia dice qué le pasa al dinero, el tono con qué
// instrumento:
//   turquesa  tu dinero      brand · moneyIn · transfer
//   ámbar     sale hoy       moneyOut · cardPayment
//   violeta   compromiso     msi
//   azul      apartado       savings (apartados, interés, objetivos)
//   gris      programado     alert
// Un gasto en texto siempre usa `ink`, nunca moneyOut: un gasto suelto
// no debe leerse como alerta.

export const theme = {
    label: 'Medianoche',
    statusBarStyle: 'light',

    // Un paso más oscuro que el original (#151B27 / #0E1219 / #0A0D13).
    // Los tres bajan a la vez y conservan la distancia entre ellos, así
    // que el degradado de AppBackground mantiene su forma; solo cambia
    // de nivel. El azul de medianoche se queda: no es un gris.
    //
    // Ojo si algún día se baja más: glassFill es un valor fijo, así que
    // cuanto más oscuro el fondo, más claras se ven las tarjetas por
    // contraste. A este nivel todavía no despegan.
    bg: '#0A0E14',
    bgTop: '#11161F',
    bgBottom: '#07090D',
    surface: '#1A1F29',
    border: 'rgba(255,255,255,0.08)',

    ink: '#ECF0EB',
    inkMid: '#ADB5C0',
    inkDim: '#7E8792',
    muted: '#ADB5C0',
    inkSoft: 'rgba(236,240,235,0.4)',

    brand: '#47BEAE',
    brandSoft: 'rgba(71,190,174,0.16)',
    brandOn: '#0E1219',

    moneyIn: '#47BEAE',
    moneyInSoft: 'rgba(71,190,174,0.14)',

    transfer: '#40978C',
    transferSoft: 'rgba(64,151,140,0.18)',
    transferOn: '#0E1219',

    moneyOut: '#D69A5A',
    moneyOutSoft: 'rgba(214,154,90,0.16)',

    cardPayment: '#DCB87A',
    cardPaymentSoft: 'rgba(220,184,122,0.16)',
    cardPaymentOn: '#12100C',

    msi: '#A89BE7',
    msiSoft: 'rgba(168,155,231,0.16)',
    msiOn: '#141220',

    savings: '#78ABEB',
    savingsSoft: 'rgba(120,171,235,0.18)',
    savingsOn: '#0E1219',

    alert: '#99A2B0',
    alertSoft: 'rgba(153,162,176,0.12)',
    alertOn: '#0E1219',

    cashTone: '#4A4C52',

    cardColors: ['#1F4E4A', '#2C3E5C', '#4A3F6B', '#2D5F6E', '#3D4A5C', '#5C4A6B', '#2C5C4A', '#4A5C6B'],

    // Dos niveles de vidrio: glass* para tarjetas, sheet* para hojas y
    // modales. glassBorderTop es más brillante que glassBorder a
    // propósito: la luz pega arriba, y eso es lo que hace que se lea
    // como vidrio y no como opacidad baja.
    glassFill: 'rgba(27,31,40,0.4)',
    glassBorder: 'rgba(255,255,255,0.09)',
    glassBorderTop: 'rgba(255,255,255,0.22)',
    glassTint: 'dark',
    glassIntensity: 55,

    sheetFill: 'rgba(17,21,29,0.78)',
    sheetIntensity: 80,

    inputFill: 'rgba(255,255,255,0.045)',
};