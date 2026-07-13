import {
  getViajeGraph,
  setViajeGraph,
  hasViajeGraph,
  setItineraryList,
  hasItineraryList,
} from "./storage.js";
import { buildGraph } from "./graphBuilder.js";
import { buildItinerary } from "./itineraryBuilder.js";

export async function loadViajeData() {
  if (hasViajeGraph()) {
    const graph = getViajeGraph();
    
    // Si el itinerary no existe, construirlo y guardarlo
    if (!hasItineraryList()) {
      const itinerary = buildItinerary(graph);
      setItineraryList(itinerary);
    }
    
    return graph;
  }

  try {
    // Cargar el archivo raiz con ruta relativa
    const response = await fetch("./itinerary/data/viaje-raiz.json");
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