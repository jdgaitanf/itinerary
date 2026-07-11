import LinkedList from "../models/LinkedList.js";

export function buildItinerary(graph) {
  
  const itineraryList = new LinkedList();

  

  const firstNode = graph.nodos.find(n => n.id === "roma-villa-angeli");
  itineraryList.append(firstNode);
  let edges = getEdgesFromNode(graph, firstNode.id);
  itineraryList.append(edges[0]);
  let nextNode = getNextNode(graph, edges);
  itineraryList.append(nextNode);
  return itineraryList;
}

function getEdgesFromNode(graph, nodeId) {
  const edges = graph.aristas.filter(edge => edge.origen_id === nodeId);

  // Ordenar las aristas según la propiedad  logistica_salida.fecha_salida y logistica_salida.hora_salida
  edges.sort((a, b) => {
    const dateA = new Date(`${a.logistica_salida.fecha_salida}T${a.logistica_salida.hora_salida}`);
    const dateB = new Date(`${b.logistica_salida.fecha_salida}T${b.logistica_salida.hora_salida}`);
    return dateA - dateB;
  });

  console.log("Edges from node", nodeId, ":", edges);


  return edges;
}

function getNextNode(graph, edges) {

  if (edges.length > 0) {
    const nextEdge = edges[0]; 
    return graph.nodos.find(n => n.id === nextEdge.destino_id);
  }
  return null; // No hay más nodos a visitar
}
