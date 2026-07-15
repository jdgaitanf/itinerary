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

    // Listeners para nodos y aristas (ya existentes)
    addToggleListeners(container);

    // Listeners para los días (toggle de día)
    this._addDayToggleListeners(container);
  }

    _renderDay(fecha, items, nodosMap, aristasMap) {
    const fechaFormateada = formatDate(fecha);
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
      <div class="dia-card expanded">
        <div class="dia-card-header">
          <span class="dia-card-fecha">${fechaFormateada}</span>
        </div>
        <div class="dia-card-body">
          ${eventsHtml}
        </div>
      </div>
    `;
  }

    _addDayToggleListeners(container) {
    const dayHeaders = container.querySelectorAll('.dia-card-header');
    dayHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.dia-card');
        if (!card) return;

        // Cerrar otros días abiertos (opcional, comenta si quieres varios abiertos)
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