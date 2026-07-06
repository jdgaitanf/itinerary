/**
 * Punto de entrada del DataLoader
 * Exporta la instancia singleton y la clase principal
 */

import { DataLoader } from './DataLoader.js';

// Instancia singleton
let dataLoaderInstance = null;

export function getDataLoader() {
  if (!dataLoaderInstance) {
    dataLoaderInstance = new DataLoader();
  }
  return dataLoaderInstance;
}

export { DataLoader };