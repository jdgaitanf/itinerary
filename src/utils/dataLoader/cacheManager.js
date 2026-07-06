/**
 * Gestor de caché para el DataLoader
 * Maneja almacenamiento en localStorage con versionado
 */

const CACHE_VERSION = '1.0.0';
const CACHE_KEY_GRAPH = 'itinerary-graph';
const CACHE_KEY_VERSION = 'itinerary-graph-version';
const CACHE_KEY_TIMESTAMP = 'itinerary-graph-timestamp';

export class CacheManager {
  /**
   * Verifica si la caché es válida y está actualizada
   */
  isCacheValid() {
    try {
      const storedVersion = localStorage.getItem(CACHE_KEY_VERSION);
      const storedData = localStorage.getItem(CACHE_KEY_GRAPH);
      
      if (!storedData || !storedVersion) return false;
      
      if (storedVersion !== CACHE_VERSION) return false;
      
      try {
        JSON.parse(storedData);
      } catch {
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Error verificando caché:', error);
      return false;
    }
  }

  /**
   * Carga datos desde caché de localStorage
   */
  loadFromCache() {
    try {
      const storedData = localStorage.getItem(CACHE_KEY_GRAPH);
      if (!storedData) return null;
      
      const data = JSON.parse(storedData);
      console.log('✅ Datos cargados desde caché. Versión:', CACHE_VERSION);
      return data;
    } catch (error) {
      console.warn('Error cargando desde caché:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Guarda datos en caché
   */
  saveToCache(data) {
    try {
      const cacheData = {
        ...data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(CACHE_KEY_GRAPH, JSON.stringify(cacheData));
      localStorage.setItem(CACHE_KEY_VERSION, CACHE_VERSION);
      localStorage.setItem(CACHE_KEY_TIMESTAMP, String(Date.now()));
      
      console.log('💾 Datos guardados en caché');
      return true;
    } catch (error) {
      console.warn('Error guardando en caché:', error);
      if (error.name === 'QuotaExceededError') {
        this.clearCache();
      }
      return false;
    }
  }

  /**
   * Limpia la caché
   */
  clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY_GRAPH);
      localStorage.removeItem(CACHE_KEY_VERSION);
      localStorage.removeItem(CACHE_KEY_TIMESTAMP);
      console.log('🗑️ Caché limpiada');
    } catch (error) {
      console.warn('Error limpiando caché:', error);
    }
  }

  /**
   * Obtiene información de la caché
   */
  getCacheInfo() {
    const version = localStorage.getItem(CACHE_KEY_VERSION);
    const timestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
    const hasData = !!localStorage.getItem(CACHE_KEY_GRAPH);
    
    return {
      existe: hasData,
      version: version || null,
      timestamp: timestamp ? new Date(parseInt(timestamp)) : null,
      esValida: this.isCacheValid(),
    };
  }
}