export function formatNodeIds(nodos) {
  if (!nodos || nodos.length === 0) {
    return 'No hay nodos disponibles';
  }
  return nodos.map(nodo => nodo.id).join(', ');
}

export function formatItineraryIds(itineraryArray) {
  if (!itineraryArray || itineraryArray.length === 0) {
    return 'No hay itinerario disponible';
  }
  
  return itineraryArray.map((item, index) => {
    const type = item.tipo ? 'NODO' : 'ARISTA';
    const id = item.id || 'sin-id';
    return `${index + 1}. [${type}] ${id}`;
  }).join('\n');
}