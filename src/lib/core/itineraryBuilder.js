import { sortEdgesByDate, getEdgesFromNode } from './itineraryUtils.js';

export function buildItinerary(graph) {
  let edgesIds = graph.aristas.map(e => e.id);
  let stack = [];
  let itineraryList = [];
  let nodes = new Set();
  let node = graph.nodos.find(n => n.tipo === "casa_origen");
  if (node) itineraryList.push({"tipo": "nodo", "id": node.id});

  let counter = 0;

  do {
    let sortedEdges = [];

    if (!nodes.has(node.id)) {
      nodes.add(node.id);
      sortedEdges = sortEdgesByDate(getEdgesFromNode(graph, node.id));
    }
    let sortedEdgesIds = sortedEdges.map(e => e.id);

    edgesIds = edgesIds.filter(e => !sortedEdgesIds.includes(e));
    sortedEdgesIds.forEach(edgeId => {
      if (!stack.includes(edgeId)) {
        stack.push(edgeId);
      }
    });

    let edgeId = stack.pop();
    let edge = graph.aristas.find(a => a.id === edgeId);
    if (edge) {
      itineraryList.push({"tipo": "arista", "id": edge.id});
      node = graph.nodos.find(n => n.id === edge.destino_id);
      if (node) itineraryList.push({"tipo": "nodo", "id": node.id});
    }
  } while ((stack.length > 0 || edgesIds.length > 0) && counter < 200);
  return itineraryList;
}