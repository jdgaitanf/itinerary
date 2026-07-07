import { getViajeData, setViajeData, hasViajeData } from './storage.js';

export async function loadViajeData() {
  if (hasViajeData()) {
    return getViajeData();
  }

  try {
    const response = await fetch('/data/viaje-raiz.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setViajeData(data);
    return data;
  } catch (error) {
    console.error('Error loading viaje data:', error);
    return null;
  }
}