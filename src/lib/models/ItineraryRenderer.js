import { NodeRenderer } from './NodeRenderer.js';
import { EdgeRenderer } from './EdgeRenderer.js';
import { addToggleListeners } from '../utils/domUtils.js';
import { agruparPorDias } from '../utils/groupUtils.js';
import { formatDate } from '../utils/dateUtils.js';

export class ItineraryRenderer {
  constructor() {
    this.nodeRenderer = new NodeRenderer();
    this.edgeRenderer = null;
    this.container = null;
  }

  render(itinerary, graph, container) {
    this.container = container;
    
    if (!itinerary || itinerary.length === 0) {
      container.textContent = 'No se encontró itinerario';
      return;
    }

    if (!graph || !graph.nodos || !graph.aristas) {
      container.textContent = 'No hay datos del grafo disponibles';
      return;
    }

    const nodosMap = new Map();
    graph.nodos.forEach(nodo => {
      nodosMap.set(nodo.id, nodo);
    });

    const aristasMap = new Map();
    graph.aristas.forEach(arista => {
      aristasMap.set(arista.id, arista);
    });

    this.edgeRenderer = new EdgeRenderer(nodosMap);

    // Agrupar por días
    const diasAgrupados = agruparPorDias(itinerary);
    const fechasOrdenadas = Object.keys(diasAgrupados).sort();

    let html = '';
    for (const fecha of fechasOrdenadas) {
      const items = diasAgrupados[fecha];
      html += this._renderDay(fecha, items, nodosMap, aristasMap);
    }

    container.innerHTML = html;

    // Determinar la fecha actual (real o simulada)
    // Para simular: en consola del navegador, escribe window.__simulatedDate = '2026-07-19'; y recarga
    const today = (typeof window !== 'undefined' && window.__simulatedDate)
      ? window.__simulatedDate
      : new Date().toISOString().slice(0, 10);
    this._expandirDiaCorrecto(today, container);

    // Listeners para nodos y aristas
    addToggleListeners(container);

    // Listeners para los días (toggle de día)
    this._addDayToggleListeners(container);
  }

  _renderDay(fecha, items, nodosMap, aristasMap) {
    const fechaFormateada = formatDate(fecha);

    // Construir resumen del día
    const ciudades = new Set();
    let eventoCount = 0;
    for (const item of items) {
      if (item.tipo === 'nodo') {
        const nodo = nodosMap.get(item.id);
        const eventTypes = ['atraccion', 'festival'];
        if (eventTypes.includes(nodo.tipo)) eventoCount++;
        if (nodo && nodo.direccion && nodo.direccion.ciudad) {
          ciudades.add(nodo.direccion.ciudad);
        }
      } else if (item.tipo === 'arista') {
        const arista = aristasMap.get(item.id);
        if (arista) {
          const origen = nodosMap.get(arista.origen_id);
          const destino = nodosMap.get(arista.destino_id);
          if (origen && origen.direccion && origen.direccion.ciudad) {
            ciudades.add(origen.direccion.ciudad);
          }
          if (destino && destino.direccion && destino.direccion.ciudad) {
            ciudades.add(destino.direccion.ciudad);
          }
        }
      }
    }

    const ciudadText = ciudades.size > 0 ? Array.from(ciudades).join(', ') : '';
    const eventoText = eventoCount > 0 ? ` · ${eventoCount} eventos` : '';
    const resumen = ciudadText ? `${ciudadText}${eventoText}` : eventoText;

    let eventsHtml = '';
    for (const item of items) {
      if (item.tipo === 'nodo') {
        const nodo = nodosMap.get(item.id);
        if (nodo) {
          eventsHtml += this.nodeRenderer.render(
            nodo,
            item.visitaIndex || 0,
            item.fecha || ''
          );
        }
      } else if (item.tipo === 'arista') {
        const arista = aristasMap.get(item.id);
        if (arista) {
          eventsHtml += this.edgeRenderer.render(arista);
        }
      }
    }

    return `
      <div class="dia-card" data-fecha="${fecha}">
        <div class="dia-card-header">
          <span class="dia-card-fecha">${fechaFormateada}</span>
          <span class="dia-card-resumen">${resumen}</span>
        </div>
        <div class="dia-card-body">
          ${eventsHtml}
        </div>
      </div>
    `;
  }

  _expandirDiaCorrecto(today, container) {
    const dayCards = container.querySelectorAll('.dia-card');
    if (dayCards.length === 0) return;

    const dates = [];
    dayCards.forEach(card => {
      const fecha = card.dataset.fecha;
      if (fecha) dates.push(fecha);
    });
    if (dates.length === 0) return;

    // Ordenar fechas
    dates.sort((a, b) => a.localeCompare(b));
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    let targetDate = null;

    // Si hoy es antes de la primera fecha → expandir el primer día
    if (today < firstDate) {
      targetDate = firstDate;
    } 
    // Si hoy es después de la última fecha → no expandir ninguno
    else if (today > lastDate) {
      return;
    } 
    // Si hoy está dentro del rango
    else {
      // Buscar fecha exacta
      if (dates.includes(today)) {
        targetDate = today;
      } else {
        // Buscar la fecha más cercana anterior (menor o igual)
        for (let i = dates.length - 1; i >= 0; i--) {
          if (dates[i] <= today) {
            targetDate = dates[i];
            break;
          }
        }
        // Fallback: primera fecha
        if (!targetDate) {
          targetDate = firstDate;
        }
      }
    }

    if (targetDate) {
      const targetCard = container.querySelector(`.dia-card[data-fecha="${targetDate}"]`);
      if (targetCard) {
        targetCard.classList.add('expanded');
        // El CSS se encarga del resto
      }
    }
  }

  _addDayToggleListeners(container) {
    const dayHeaders = container.querySelectorAll('.dia-card-header');
    dayHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.dia-card');
        if (!card) return;

        // Cerrar otros días abiertos (opcional)
        const allOpen = container.querySelectorAll('.dia-card.expanded');
        allOpen.forEach(other => {
          if (other !== card) {
            other.classList.remove('expanded');
          }
        });

        // Toggle el día actual
        card.classList.toggle('expanded');
      });
    });
  }
}