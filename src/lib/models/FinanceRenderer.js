// src/lib/models/FinanceRenderer.js

import { formatMoney } from '../utils/formatUtils.js';

export class FinanceRenderer {
  render(container, data) {
    if (!container) return;
    container.innerHTML = this._buildHTML(data);
    this._attachEvents(container, data);
  }

  _buildHTML(data) {
    const { totalPresupuesto, totalGastado, saldo, porCategoria, porPersona, gastos, moneda } = data;
    const porcentaje = totalPresupuesto > 0 ? (totalGastado / totalPresupuesto) * 100 : 0;
    const barColor = porcentaje > 80 ? '#d32f2f' : (porcentaje > 50 ? '#f57c00' : '#2e7d32');

    let html = `
      <div class="finance-container">
        <div class="finance-summary">
          <div class="finance-card">
            <span class="finance-label">Presupuesto</span>
            <span class="finance-value">${formatMoney(totalPresupuesto, moneda)}</span>
          </div>
          <div class="finance-card">
            <span class="finance-label">Gastado</span>
            <span class="finance-value">${formatMoney(totalGastado, moneda)}</span>
          </div>
          <div class="finance-card">
            <span class="finance-label">Saldo</span>
            <span class="finance-value ${saldo < 0 ? 'negative' : ''}">${formatMoney(saldo, moneda)}</span>
          </div>
        </div>

        <div class="finance-progress">
          <div class="progress-bar" style="width:${Math.min(porcentaje, 100)}%; background-color:${barColor};"></div>
          <span class="progress-label">${porcentaje.toFixed(0)}%</span>
        </div>

        <div class="finance-currency-selector">
          <label for="currency-select">Moneda:</label>
          <select id="currency-select">
            <option value="COP" ${moneda === 'COP' ? 'selected' : ''}>COP</option>
            <option value="EUR" ${moneda === 'EUR' ? 'selected' : ''}>EUR</option>
            <option value="USD" ${moneda === 'USD' ? 'selected' : ''}>USD</option>
            <option value="CHF" ${moneda === 'CHF' ? 'selected' : ''}>CHF</option>
          </select>
        </div>

        <div class="finance-breakdown">
          <h3>Por categoría</h3>
          <ul class="breakdown-list">
            ${Object.entries(porCategoria).map(([cat, monto]) => `
              <li><span class="breakdown-label">${cat}</span><span class="breakdown-value">${formatMoney(monto, moneda)}</span></li>
            `).join('')}
          </ul>
        </div>

        <div class="finance-breakdown">
          <h3>Por persona</h3>
          <ul class="breakdown-list">
            ${Object.entries(porPersona).map(([persona, monto]) => `
              <li><span class="breakdown-label">${persona}</span><span class="breakdown-value">${formatMoney(monto, moneda)}</span></li>
            `).join('')}
          </ul>
        </div>

        <div class="finance-details">
          <button id="toggle-details-btn" class="toggle-details-btn">Mostrar lista de gastos</button>
          <div id="details-list" style="display:none;">
            <ul class="expense-list">
              ${gastos.map((g, idx) => `
                <li class="expense-item ${g.source === 'user' ? 'confirmed' : 'estimated'}">
                  <span class="expense-desc">${g.descripcion}</span>
                  <span class="expense-amount">${formatMoney(g.montoConvertido, moneda)}</span>
                  <span class="expense-badge ${g.source}">${g.source === 'user' ? 'Confirmado' : 'Estimado'}</span>
                  <span class="expense-source">${g.pagado_por ? `Pagado por: ${g.pagado_por}` : ''}</span>
                  <span class="expense-category">${g.categoria}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  _attachEvents(container, data) {
    const toggleBtn = container.querySelector('#toggle-details-btn');
    const detailsList = container.querySelector('#details-list');
    if (toggleBtn && detailsList) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = detailsList.style.display === 'none';
        detailsList.style.display = isHidden ? 'block' : 'none';
        toggleBtn.textContent = isHidden ? 'Ocultar lista de gastos' : 'Mostrar lista de gastos';
      });
    }

    const currencySelect = container.querySelector('#currency-select');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        const newCurrency = e.target.value;
        try {
          localStorage.setItem('selectedCurrency', newCurrency);
        } catch (err) {}
        window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: newCurrency } }));
      });
    }
  }
}