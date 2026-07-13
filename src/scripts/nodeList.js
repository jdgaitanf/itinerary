import { dataService } from '../lib/services/DataService.js';
import { ItineraryRenderer } from '../lib/models/ItineraryRenderer.js';

async function displayItinerary() {
  const container = document.getElementById('node-list');

  if (!container) {
    console.error('Element #node-list not found');
    return;
  }

  try {
    const data = await dataService.getData();
    if (!data.graph || !data.itinerary) {
      container.textContent = 'No se encontraron datos del itinerario';
      return;
    }

    const renderer = new ItineraryRenderer();
    renderer.render(data.itinerary, data.graph, container);
  } catch (error) {
    console.error('Error displaying itinerary:', error);
    container.textContent = 'Error al cargar el itinerario';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', displayItinerary);
} else {
  displayItinerary();
}