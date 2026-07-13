import { NodeRenderer } from './NodeRenderer.js';
import { EdgeRenderer } from './EdgeRenderer.js';
import { addToggleListeners } from '../utils/domUtils.js';

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

    // Crear mapas para búsqueda rápida
    const nodosMap = new Map();
    graph.nodos.forEach(nodo => {
      nodosMap.set(nodo.id, nodo);
    });

    const aristasMap = new Map();
    graph.aristas.forEach(arista => {
      aristasMap.set(arista.id, arista);
    });

    // Inicializar el renderer de aristas con el mapa de nodos
    this.edgeRenderer = new EdgeRenderer(nodosMap);

    // Construir el HTML
    let html = '';

    for (const item of itinerary) {
      if (item.tipo === 'nodo') {
        const nodo = nodosMap.get(item.id);
        if (nodo) {
          html += this.nodeRenderer.render(nodo);
        }
      } else if (item.tipo === 'arista') {
        const arista = aristasMap.get(item.id);
        if (arista) {
          html += this.edgeRenderer.render(arista);
        }
      }
    }

    container.innerHTML = html;

    // Agregar event listeners para expansión/contracción
    addToggleListeners(container);
  }
}