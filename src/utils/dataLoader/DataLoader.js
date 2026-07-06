/**
 * DataLoader - Clase principal
 * Coordina la carga de datos, caché y construcción del itinerario
 */

import { CacheManager } from './cacheManager.js';
import { GraphBuilder } from './graphBuilder.js';
import { FinanceHelper } from './financeHelper.js';

export class DataLoader {
  constructor() {
    this.raiz = null;
    this.nodos = new Map();
    this.aristas = new Map();
    this.dias = [];
    this.cargado = false;
    this.cacheValida = false;
    this.ordenVisita = [];
    
    this.cacheManager = new CacheManager();
  }

  /**
   * Carga datos desde caché
   */
  loadFromCache() {
    const data = this.cacheManager.loadFromCache();
    if (!data) return false;
    
    this.raiz = data.raiz;
    this.nodos = new Map(Object.entries(data.nodos));
    this.aristas = new Map(Object.entries(data.aristas));
    this.dias = data.dias;
    this.ordenVisita = data.ordenVisita || [];
    this.cargado = true;
    this.cacheValida = true;
    
    console.log(`📊 ${this.nodos.size} nodos, ${this.aristas.size} aristas, ${this.dias.length} días`);
    console.log(`📋 Orden de visita: ${this.ordenVisita.length} elementos`);
    
    return true;
  }

  /**
   * Guarda datos en caché
   */
  saveToCache() {
    const data = {
      raiz: this.raiz,
      nodos: Object.fromEntries(this.nodos),
      aristas: Object.fromEntries(this.aristas),
      dias: this.dias,
      ordenVisita: this.ordenVisita,
    };
    
    const success = this.cacheManager.saveToCache(data);
    if (success) {
      this.cacheValida = true;
    }
    return success;
  }

  /**
   * Limpia la caché
   */
  clearCache() {
    this.cacheManager.clearCache();
    this.cacheValida = false;
  }

  /**
   * Obtiene información de la caché
   */
  getCacheInfo() {
    return this.cacheManager.getCacheInfo();
  }

  /**
   * Carga el archivo raíz del viaje
   */
  async cargarRaiz() {
    try {
      const response = await fetch('/data/viaje-raiz.json');
      if (!response.ok) throw new Error('Error cargando viaje-raiz.json');
      this.raiz = await response.json();
      return this.raiz;
    } catch (error) {
      console.error('Error cargando raíz:', error);
      throw error;
    }
  }

  /**
   * Carga un nodo específico por su ruta
   */
  async cargarNodo(ruta) {
    try {
      const response = await fetch(`/data/${ruta}`);
      if (!response.ok) throw new Error(`Error cargando nodo: ${ruta}`);
      const nodo = await response.json();
      this.nodos.set(nodo.id, nodo);
      return nodo;
    } catch (error) {
      console.error(`Error cargando nodo ${ruta}:`, error);
      return null;
    }
  }

  /**
   * Carga una arista específica por su ruta
   */
  async cargarArista(ruta) {
    try {
      const response = await fetch(`/data/${ruta}`);
      if (!response.ok) throw new Error(`Error cargando arista: ${ruta}`);
      const arista = await response.json();
      this.aristas.set(arista.id, arista);
      return arista;
    } catch (error) {
      console.error(`Error cargando arista ${ruta}:`, error);
      return null;
    }
  }

  /**
   * Carga todos los nodos y aristas referenciados
   */
  async cargarTodosLosDatos() {
    if (this.cargado) return this;

    if (this.loadFromCache()) {
      return this;
    }

    console.log('📥 Cargando datos desde archivos...');

    await this.cargarRaiz();
    if (!this.raiz) throw new Error('No se pudo cargar el archivo raíz');

    const nodosPromises = this.raiz.referencias.nodos.map(ruta => 
      this.cargarNodo(ruta)
    );
    await Promise.all(nodosPromises);

    const aristasPromises = this.raiz.referencias.aristas.map(ruta => 
      this.cargarArista(ruta)
    );
    await Promise.all(aristasPromises);

    this.cargado = true;
    
    // Construir días usando GraphBuilder
    this._construirDias();
    this.saveToCache();
    
    console.log(`📥 Datos cargados desde archivos. ${this.nodos.size} nodos, ${this.aristas.size} aristas`);
    
    return this;
  }

  /**
   * Construye el itinerario usando GraphBuilder
   */
  _construirDias() {
    const builder = new GraphBuilder(this.nodos, this.aristas, this.raiz);
    this.dias = builder.construirDias();
    this.ordenVisita = builder.ordenVisita;
  }

  /**
   * Obtiene el orden de visita para un elemento
   */
  getOrden(tipo, id) {
    const builder = new GraphBuilder(this.nodos, this.aristas, this.raiz);
    builder.ordenVisita = this.ordenVisita;
    return builder.getOrden(tipo, id);
  }

  /**
   * Compara dos elementos por su orden de visita
   */
  compararOrden(a, b) {
    const builder = new GraphBuilder(this.nodos, this.aristas, this.raiz);
    builder.ordenVisita = this.ordenVisita;
    return builder.compararOrden(a, b);
  }

  /**
   * Obtiene los primeros N días del itinerario
   */
  obtenerDias(cantidad = 4) {
    return this.dias.slice(0, cantidad);
  }

  /**
   * Obtiene días adicionales a partir de un índice
   */
  obtenerMasDias(desde, cantidad = 3) {
    return this.dias.slice(desde, desde + cantidad);
  }

  /**
   * Obtiene un día específico por índice
   */
  obtenerDia(index) {
    return this.dias[index] || null;
  }

  /**
   * Obtiene todos los días (para carga completa)
   */
  obtenerTodosLosDias() {
    return this.dias;
  }

  /**
   * Obtiene información financiera del viaje
   */
  obtenerFinanzas() {
    return FinanceHelper.obtenerFinanzas(
      this.nodos,
      this.aristas,
      FinanceHelper.determinarTipoEvento
    );
  }

  /**
   * Determina el tipo de evento para un nodo
   */
  _determinarTipoEvento(nodo) {
    return FinanceHelper.determinarTipoEvento(nodo);
  }
}