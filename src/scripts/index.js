import { dataService } from '../lib/services/DataService.js';

async function updateTitle() {
  let nombreViaje = 'Itinerario';
  
  try {
    const data = await dataService.getData();
    if (data && data.graph && data.graph.nombre_viaje) {
      nombreViaje = data.graph.nombre_viaje;
    }
  } catch (error) {
    console.error('Error loading viaje name:', error);
  }
  
  document.title = nombreViaje;
  
  const h1Element = document.querySelector('h1');
  if (h1Element) {
    h1Element.textContent = nombreViaje;
  }
}

updateTitle();