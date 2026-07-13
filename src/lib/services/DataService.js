import { loadViajeData } from '../core/dataLoader.js';
import { getViajeGraph, getItineraryList } from '../core/storage.js';

class DataService {
  constructor() {
    this.graph = null;
    this.itinerary = null;
    this.loading = false;
    this.loaded = false;
  }

  async getData() {
    if (this.loaded && this.graph) {
      return {
        graph: this.graph,
        itinerary: this.itinerary
      };
    }

    if (this.loading) {
      // Esperar a que termine la carga en curso
      await new Promise(resolve => {
        const checkLoaded = setInterval(() => {
          if (!this.loading) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 50);
      });
      return {
        graph: this.graph,
        itinerary: this.itinerary
      };
    }

    this.loading = true;
    try {
      const graph = await loadViajeData();
      this.graph = graph;
      this.itinerary = getItineraryList();
      this.loaded = true;
      return {
        graph: this.graph,
        itinerary: this.itinerary
      };
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  getGraph() {
    return this.graph || getViajeGraph();
  }

  getItinerary() {
    return this.itinerary || getItineraryList();
  }

  isLoaded() {
    return this.loaded;
  }

  reset() {
    this.graph = null;
    this.itinerary = null;
    this.loaded = false;
  }
}

export const dataService = new DataService();