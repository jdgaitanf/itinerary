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
  // Marcar como visitado antes de obtener aristas para evitar ciclos infinitos
  visitedNodeIds.add(nodeId);
  // getEdgesFromNode internamente usa sortEdgesByDate (orden descendente)
  // Lo cual, al ser apilado (LIFO), resulta en que la arista más temprana se procese primero.
  return getEdgesFromNode(graph, nodeId);
}

/**
 * Construye el itinerario en orden de visita mediante un recorrido DFS con pila.
 * El algoritmo garantiza que cada nodo se agregue solo una vez al resultado,
 * mientras que las aristas se dibujan en el orden cronológico de salida.
 * 
 * @param {Object} graph - Grafo completo con nodos y aristas
 * @returns {Array<{tipo: 'nodo'|'arista', id: string}>} Itinerario ordenado
 */
export function buildItinerary(graph) {
  // 1. Validar y obtener nodo inicial
  const startNode = findStartNode(graph);
  
  // 2. Inicializar estructuras de estado
  const pendingEdgeIds = new Set(graph.aristas.map(edge => edge.id));
  const visitedNodeIds = new Set();
  const stack = [];           // Pila LIFO para aristas pendientes de procesar
  const stackSet = new Set(); // Búsqueda O(1) para evitar duplicados en la pila
  const result = [];
  
  let currentNode = startNode;
  let iteration = 0;

  // 3. Agregar nodo inicial al resultado
  result.push({ tipo: 'nodo', id: startNode.id });

  // 4. Recorrido principal
  while ((stack.length > 0 || pendingEdgeIds.size > 0) && iteration < MAX_TRAVERSAL_ITERATIONS) {
    iteration++;

    // 4a. Obtener aristas salientes del nodo actual (si es la primera vez que se visita)
    const availableEdges = getEdgesForUnvisitedNode(graph, currentNode.id, visitedNodeIds);

    // 4b. Filtrar aristas que aún no han sido procesadas y no están ya en la pila
    for (const edge of availableEdges) {
      if (pendingEdgeIds.has(edge.id) && !stackSet.has(edge.id)) {
        stackSet.add(edge.id);
        stack.push(edge.id);
      }
    }

    // 4c. Obtener la siguiente arista a procesar (LIFO)
    const nextEdgeId = stack.pop();
    if (!nextEdgeId) {
      // Si la pila está vacía pero aún hay aristas pendientes, el grafo está desconectado.
      // En lugar de fallar silenciosamente, emitimos una advertencia y rompemos el bucle.
      console.warn(
        `Grafo posiblemente desconectado. Quedan ${pendingEdgeIds.size} aristas sin procesar.`
      );
      break;
    }
    stackSet.delete(nextEdgeId);

    // 4d. Verificar que la arista aún esté pendiente (podría haber sido procesada en otro camino)
    if (!pendingEdgeIds.has(nextEdgeId)) {
      continue;
    }

    // 4e. Buscar la arista en el grafo
    const edge = graph.aristas.find(e => e.id === nextEdgeId);
    if (!edge) {
      // Limpiar el ID huérfano para no bloquear el proceso
      pendingEdgeIds.delete(nextEdgeId);
      console.warn(`Arista con ID "${nextEdgeId}" no encontrada en el grafo. Se omite.`);
      continue;
    }

    // 4f. Agregar arista al resultado y marcarla como procesada
    result.push({ tipo: 'arista', id: edge.id });
    pendingEdgeIds.delete(edge.id);

    // 4g. Moverse al nodo destino
    const nextNode = graph.nodos.find(n => n.id === edge.destino_id);
    if (!nextNode) {
      throw new Error(
        `El nodo destino "${edge.destino_id}" de la arista "${edge.id}" no existe en el grafo.`
      );
    }

    result.push({ tipo: 'nodo', id: nextNode.id });
    currentNode = nextNode;
  }

  // 5. Verificar si se alcanzó el límite de seguridad
  if (iteration >= MAX_TRAVERSAL_ITERATIONS) {
    console.warn(
      `El recorrido alcanzó el límite de ${MAX_TRAVERSAL_ITERATIONS} iteraciones. ` +
      `Quedan ${pendingEdgeIds.size} aristas sin procesar.`
    );
  }
  console.log ("Ay sí, ay sí. Yo soy mejor que tú", result)
  return result;
}