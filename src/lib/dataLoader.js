import { getViajeGraph, setViajeGraph, hasViajeGraph } from './storage.js';
import { buildGraph } from './graphBuilder.js';

export async function loadViajeData() {
  if (hasViajeGraph()) {
    return getViajeGraph();
  }

  try {
    // Cargar el archivo raiz
    const response = await fetch('/data/viaje-raiz.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rootData = await response.json();

    // Construir el grafo completo
    const graph = await buildGraph(rootData);

    // Guardar en localStorage
    setViajeGraph(graph);

    return graph;
  } catch (error) {
    console.error('Error loading viaje data:', error);
    return null;
  }
}