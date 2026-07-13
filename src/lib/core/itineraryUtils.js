export function getEdgesFromNode(graph, nodeId) {
  let edges = graph.aristas.filter(edge => edge.origen_id === nodeId);
  edges = sortEdgesByDate(edges);
  return edges;
}

export function sortEdgesByDate(edges) {
  const sortedEdges = edges.sort((a, b) => {
    const dateA = new Date(`${a.logistica_salida.fecha_salida}T${a.logistica_salida.hora_salida_origen}`);
    const dateB = new Date(`${b.logistica_salida.fecha_salida}T${b.logistica_salida.hora_salida_origen}`);
    return dateB - dateA;
  });
  return sortedEdges;
}

export function getEdgeById(graph, edgeId) {
  return graph.aristas.filter(edge => edge.id === edgeId);
}

export function getNodeById(graph, nodeId) {
  return graph.nodos.filter(node => node.id === nodeId);
}