// src/scripts/finance.js

import { dataService } from '../lib/services/DataService.js';
import { FinanceService } from '../lib/services/FinanceService.js';
import { FinanceRenderer } from '../lib/models/FinanceRenderer.js';

let rendererInstance = null;
let currentData = null;
let container = null;

function getContainer() {
  if (!container) {
    container = document.getElementById('finance-content');
  }
  return container;
}

function getCurrency() {
  try {
    return localStorage.getItem('selectedCurrency') || 'COP';
  } catch {
    return 'COP';
  }
}

async function renderFinance() {
  const container = getContainer();
  if (!container) return;

  try {
    const data = await dataService.getData();
    if (!data.graph) {
      container.innerHTML = '<p>No hay datos del grafo disponibles</p>';
      return;
    }

    const financeService = new FinanceService();
    const currency = getCurrency();
    const financeData = financeService.calculate(data.graph, currency);

    currentData = financeData;

    if (!rendererInstance) {
      rendererInstance = new FinanceRenderer();
    }
    rendererInstance.render(container, financeData);
  } catch (error) {
    console.error('Error al renderizar finanzas:', error);
    container.innerHTML = '<p>Error al cargar los datos financieros</p>';
  }
}

// Escuchar cambios de moneda
window.addEventListener('currencyChanged', () => {
  renderFinance();
});

// Exportar función para que tabs.js pueda llamarla cuando se active la pestaña
export function loadFinance() {
  renderFinance();
}

// Si la pestaña de finanzas es la activa al cargar, renderizar
// (se llamará desde tabs.js al inicializar)