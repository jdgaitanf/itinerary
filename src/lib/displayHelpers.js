export function formatNodeIds(nodos) {
  if (!nodos || nodos.length === 0) {
    return 'No hay nodos disponibles';
  }
  return nodos.map(nodo => nodo.id).join(', ');
}