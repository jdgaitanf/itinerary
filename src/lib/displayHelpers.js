export function formatFullItinerary(itineraryArray, graph) {
  if (!itineraryArray || itineraryArray.length === 0) {
    return 'No hay itinerario disponible';
  }

  if (!graph || !graph.nodos || !graph.aristas) {
    return 'No hay datos del grafo disponibles';
  }

  const nodosMap = new Map();
  const aristasMap = new Map();

  // Crear mapas para búsqueda rápida
  graph.nodos.forEach(nodo => {
    nodosMap.set(nodo.id, nodo);
  });

  graph.aristas.forEach(arista => {
    aristasMap.set(arista.id, arista);
  });

  let result = '';

  itineraryArray.forEach((item, index) => {
    const numero = index + 1;
    if (item.tipo === 'nodo') {
      const nodo = nodosMap.get(item.id);
      if (nodo) {
        const nombre = nodo.nombre || nodo.id;
        result += `${numero}. NODO: ${nombre}\n`;
        if (nodo.tipo) {
          result += `   Tipo: ${nodo.tipo}\n`;
        }
        if (nodo.direccion && nodo.direccion.ciudad) {
          result += `   Ciudad: ${nodo.direccion.ciudad}\n`;
        }
      } else {
        result += `${numero}. NODO: ${item.id} (no encontrado)\n`;
      }
    } else if (item.tipo === 'arista') {
      const arista = aristasMap.get(item.id);
      if (arista) {
        const origen = nodosMap.get(arista.origen_id);
        const destino = nodosMap.get(arista.destino_id);
        const origenNombre = origen ? origen.nombre || origen.id : arista.origen_id;
        const destinoNombre = destino ? destino.nombre || destino.id : arista.destino_id;
        const modo = arista.modo || 'desplazamiento';
        result += `${numero}. ARISTA: ${modo} (${origenNombre} → ${destinoNombre})\n`;
        if (arista.transporte && arista.transporte.compania) {
          result += `   Compañía: ${arista.transporte.compania}\n`;
        }
        if (arista.transporte && arista.transporte.numero_vuelo) {
          result += `   Vuelo: ${arista.transporte.numero_vuelo}\n`;
        }
      } else {
        result += `${numero}. ARISTA: ${item.id} (no encontrado)\n`;
      }
    }
  });

  return result;
}