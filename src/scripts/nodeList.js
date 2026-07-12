import { getViajeGraph, getItineraryList } from '../lib/storage.js';
import { loadViajeData } from '../lib/dataLoader.js';
import { formatFullItinerary } from '../lib/displayHelpers.js';

async function displayItinerary() {
  const nodeListElement = document.getElementById('node-list');
  
  if (!nodeListElement) {
    console.error('Element #node-list not found');
    return;
  }
  
  // Cargar datos si no existen
  let graph = getViajeGraph();
  if (!graph) {
    graph = await loadViajeData();
  }
  
  // Obtener el itinerario como array
  const itinerary = getItineraryList();
  
  if (itinerary && itinerary.length > 0) {
    // Mostrar con formato completo usando el grafo
    const formatted = formatFullItinerary(itinerary, graph);
    console.log(formatted)
    // Reemplazar saltos de línea por <br> para HTML
    nodeListElement.innerHTML = formatted.replace(/\n/g, '<br>');
  } else {
    nodeListElement.textContent = 'No se encontró itinerario';
  }
}

displayItinerary();