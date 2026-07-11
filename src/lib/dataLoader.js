import {
  getViajeGraph,
  setViajeGraph,
  hasViajeGraph,
  setItineraryList,
} from "./storage.js";
import { buildGraph } from "./graphBuilder.js";
import { buildItinerary } from "./itineraryBuilder.js";

export async function loadViajeData() {
  if (hasViajeGraph()) {
    localStorage.clear();
    //return getViajeGraph();
  }

  try {
    // Cargar el archivo raiz
    const response = await fetch("/data/viaje-raiz.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rootData = await response.json();

    // Construir el grafo completo
    const graph = await buildGraph(rootData);

    // Guardar en localStorage
    setViajeGraph(graph);
    // Construir y guardar el itinerario (lista de lugares en orden)
    const itinerary = buildItinerary(graph);
    setItineraryList(itinerary);

    return graph;
  } catch (error) {
    console.error("Error loading viaje data:", error);
    return null;
  }
}
