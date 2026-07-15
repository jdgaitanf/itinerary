// src/lib/utils/formatUtils.js

export function formatMoney(amount, currency) {
  const symbol = { COP: '$', EUR: '€', USD: 'US$', CHF: 'Fr.' }[currency] || currency;
  // Truncar decimales (sin redondear)
  const integer = Math.floor(amount);
  // Formatear con separador de miles (punto)
  const formatted = integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${symbol} ${formatted}`;
}