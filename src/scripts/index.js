import { getViajeGraph } from '../lib/storage.js';
import { loadViajeData } from '../lib/dataLoader.js';

async function updateTitle() {
  let nombreViaje = 'Itinerario';
  
  try {
    let graph = getViajeGraph();
    if (!graph) {
      graph = await loadViajeData();
    }
    
    if (graph && graph.nombre_viaje) {
      nombreViaje = graph.nombre_viaje;
    }
  } catch (error) {
    console.error('Error loading viaje name:', error);
  }
  
  // Actualizar el título de la página
  document.title = nombreViaje;
  
  // Actualizar el h1
  const h1Element = document.querySelector('h1');
  if (h1Element) {
    h1Element.textContent = nombreViaje;
  }
}

updateTitle();