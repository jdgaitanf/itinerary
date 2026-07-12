import LinkedList from "../models/LinkedList.js";

export function buildItinerary(graph) {
  let edgesIds = graph.aristas.map(e => e.id);
  let stack = [];
  const itineraryList = new LinkedList();
  let nodes = new Set();
  let node = graph.nodos.find(n => n.tipo === "casa_origen");
  if (node) itineraryList.append(node)

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
      itineraryList.append(edge);
      node = graph.nodos.find(n => n.id === edge.destino_id);
      if (node) itineraryList.append(node);
    }
  } while ((stack.length > 0 || edgesIds.length > 0) && counter < 200);

  console.log("Itinerary built successfully.", itineraryList.toArray());

  // Retornar como array para guardar en localStorage
  return itineraryList.toArray();
}

function getEdgesFromNode(graph, nodeId) {
  let edges = graph.aristas.filter(edge => edge.origen_id === nodeId);
  edges = sortEdgesByDate(edges);
  return edges;
}

function sortEdgesByDate(edges) {
  const sortedEdges = edges.sort((a, b) => {
    const dateA = new Date(`${a.logistica_salida.fecha_salida}T${a.logistica_salida.hora_salida_origen}`);
    const dateB = new Date(`${b.logistica_salida.fecha_salida}T${b.logistica_salida.hora_salida_origen}`);
    return dateB - dateA;
  });
  return sortedEdges;
}