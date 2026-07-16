import { getEdgesFromNode } from './itineraryUtils.js';

// Límite de seguridad para evitar bucles infinitos en grafos mal formados
const MAX_TRAVERSAL_ITERATIONS = 500;

/**
 * Encuentra el nodo de inicio del viaje.
 * @param {Object} graph - Grafo completo
 * @returns {Object} Nodo de tipo 'casa_origen'
 * @throws {Error} Si no se encuentra el nodo de inicio
 */
function findStartNode(graph) {
  const startNode = graph.nodos.find(node => node.tipo === 'casa_origen');
  if (!startNode) {
    throw new Error('Grafo inválido: no se encontró un nodo de tipo "casa_origen".');
  }
  return startNode;
}

/**
 * Obtiene la fecha de un nodo basada en la arista que llega a él.
 * Si el nodo es el inicial, usa la fecha de su primera visita.
 * @param {Object} graph - Grafo completo
 * @param {string} nodeId - ID del nodo
 * @param {string} edgeId - ID de la arista que llega al nodo (opcional)
 * @param {number} visitaIndex - Índice de la visita
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getNodeDate(graph, nodeId, edgeId, visitaIndex) {
  const node = graph.nodos.find(n => n.id === nodeId);
  if (!node) return '';

  // Si es el nodo inicial, usar la fecha de su primera visita
  if (node.tipo === 'casa_origen') {
    const visita = node.visitas && node.visitas.length > 0 ? node.visitas[0] : null;
    return visita?.entrada || '';
  }

  // Si hay una arista que llega al nodo, usar su fecha de llegada si existe, o la de salida
  if (edgeId) {
    const edge = graph.aristas.find(e => e.id === edgeId);
    if (edge && edge.logistica_salida) {
      // Priorizar fecha_llegada si existe, de lo contrario fecha_salida
      return edge.logistica_salida.fecha_llegada || edge.logistica_salida.fecha_salida || '';
    }
  }

  // Fallback: usar la fecha de la visita correspondiente
  const visita = node.visitas && node.visitas.length > 0 
    ? node.visitas[Math.min(visitaIndex || 0, node.visitas.length - 1)] 
    : null;
  return visita?.entrada || '';
}

/**
 * Obtiene las aristas salientes de un nodo que aún no ha sido visitado.
 * Marca el nodo como visitado si tiene aristas disponibles.
 * @param {Object} graph - Grafo completo
 * @param {string} nodeId - ID del nodo actual
 * @param {Set<string>} visitedNodeIds - Conjunto de nodos ya visitados
 * @returns {Array} Lista de aristas ordenadas cronológicamente
 */
function getEdgesForUnvisitedNode(graph, nodeId, visitedNodeIds) {
  if (visitedNodeIds.has(nodeId)) {
    return [];
  }
  visitedNodeIds.add(nodeId);
  return getEdgesFromNode(graph, nodeId);
}

/**
 * Construye el itinerario en orden de visita mediante un recorrido DFS con pila.
 * Cada elemento del itinerario incluye su fecha correspondiente.
 * 
 * @param {Object} graph - Grafo completo con nodos y aristas
 * @returns {Array<{tipo: 'nodo'|'arista', id: string, fecha: string, visitaIndex?: number}>} Itinerario ordenado
 */
export function buildItinerary(graph) {
  // 1. Validar y obtener nodo inicial
  const startNode = findStartNode(graph);
  
  // 2. Inicializar estructuras de estado
  const pendingEdgeIds = new Set(graph.aristas.map(edge => edge.id));
  const visitedNodeIds = new Set();
  const nodeVisitIndexMap = new Map();
  const stack = [];
  const stackSet = new Set();
  const result = [];
  
  let currentNode = startNode;
  let iteration = 0;

  // 3. Agregar nodo inicial al resultado
  nodeVisitIndexMap.set(startNode.id, 0);
  const startDate = startNode.visitas && startNode.visitas.length > 0 
    ? startNode.visitas[0].entrada 
    : '';
  result.push({ 
    tipo: 'nodo', 
    id: startNode.id, 
    visitaIndex: 0,
    fecha: startDate
  });

  // 4. Recorrido principal
  while ((stack.length > 0 || pendingEdgeIds.size > 0) && iteration < MAX_TRAVERSAL_ITERATIONS) {
    iteration++;

    const availableEdges = getEdgesForUnvisitedNode(graph, currentNode.id, visitedNodeIds);

    for (const edge of availableEdges) {
      if (pendingEdgeIds.has(edge.id) && !stackSet.has(edge.id)) {
        stackSet.add(edge.id);
        stack.push(edge.id);
      }
    }

    const nextEdgeId = stack.pop();
    if (!nextEdgeId) {
      console.warn(
        `Grafo posiblemente desconectado. Quedan ${pendingEdgeIds.size} aristas sin procesar.`
      );
      break;
    }
    stackSet.delete(nextEdgeId);

    if (!pendingEdgeIds.has(nextEdgeId)) {
      continue;
    }

    const edge = graph.aristas.find(e => e.id === nextEdgeId);
    if (!edge) {
      pendingEdgeIds.delete(nextEdgeId);
      console.warn(`Arista con ID "${nextEdgeId}" no encontrada en el grafo. Se omite.`);
      continue;
    }

    // Obtener la fecha de la arista
    const edgeDate = edge.logistica_salida?.fecha_salida || '';

    // Agregar arista al resultado
    result.push({ 
      tipo: 'arista', 
      id: edge.id,
      fecha: edgeDate
    });
    pendingEdgeIds.delete(edge.id);

    // Moverse al nodo destino
    const nextNode = graph.nodos.find(n => n.id === edge.destino_id);
    if (!nextNode) {
      throw new Error(
        `El nodo destino "${edge.destino_id}" de la arista "${edge.id}" no existe en el grafo.`
      );
    }

    // Determinar el índice de visita para el nodo destino
    const currentVisitIndex = nodeVisitIndexMap.get(nextNode.id) || 0;
    const existingNodeWithSameIndex = result.find(
      item => item.tipo === 'nodo' && item.id === nextNode.id && item.visitaIndex === currentVisitIndex
    );
    let visitaIndex = currentVisitIndex;
    if (existingNodeWithSameIndex) {
      visitaIndex = currentVisitIndex + 1;
      nodeVisitIndexMap.set(nextNode.id, visitaIndex);
    } else {
      nodeVisitIndexMap.set(nextNode.id, currentVisitIndex);
    }

    // Calcular la fecha del nodo: usar fecha_llegada de la arista si existe, o fecha_salida,
    // o fallback a la fecha de la visita correspondiente
    let nodeDate = edge.logistica_salida?.fecha_llegada || edge.logistica_salida?.fecha_salida || '';
    if (!nodeDate) {
      const visita = nextNode.visitas && nextNode.visitas.length > 0 
        ? nextNode.visitas[Math.min(visitaIndex, nextNode.visitas.length - 1)] 
        : null;
      nodeDate = visita?.entrada || '';
    }

    result.push({ 
      tipo: 'nodo', 
      id: nextNode.id, 
      visitaIndex: visitaIndex,
      fecha: nodeDate
    });
    currentNode = nextNode;
  }

  if (iteration >= MAX_TRAVERSAL_ITERATIONS) {
    console.warn(
      `El recorrido alcanzó el límite de ${MAX_TRAVERSAL_ITERATIONS} iteraciones. ` +
      `Quedan ${pendingEdgeIds.size} aristas sin procesar.`
    );
  }

  console.log(result)
  return result;
}