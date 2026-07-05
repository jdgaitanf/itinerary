// src/scripts/alpine-store.js
// Primero importar Alpine y los plugins
import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.15.12/+esm';
import persist from 'https://cdn.jsdelivr.net/npm/@alpinejs/persist@3.15.12/+esm';
import collapse from 'https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.15.12/+esm';

// Registrar los plugins ANTES de definir el store
Alpine.plugin(persist);
Alpine.plugin(collapse);

// Definir el store usando Alpine directamente
Alpine.store('itinerary', {
  // Estado
  dias: [],
  diasCargados: [],
  diaInicioCargado: 0,
  todosLosDiasCargados: false,
  cargando: false,
  
  // Estado de UI - usando Alpine.$persist
  tema: Alpine.$persist('claro').as('itinerary-theme'),
  moneda: Alpine.$persist('COP').as('itinerary-currency'),
  eventosExpandidos: Alpine.$persist({}).as('itinerary-expanded'),
  scrollPositions: Alpine.$persist({}).as('itinerary-scroll'),
  ultimaInteraccion: Alpine.$persist(Date.now()).as('itinerary-last-interaction'),
  
  // Vista activa
  vistaActiva: Alpine.$persist('itinerario').as('itinerary-active-view'),
  
  // Referencias a los builders
  dataLoader: null,
  itineraryBuilder: null,
  
  // Configuración de carga
  CANTIDAD_INICIAL: 4,
  CANTIDAD_ADICIONAL: 3,
  TIMEOUT_SCROLL: 30 * 60 * 1000,

  /**
   * Inicializa el store
   */
  async init() {
    console.log('Inicializando store...');
    
    try {
      // Cargar los módulos
      const dataLoaderModule = await import('/src/utils/dataLoader.js');
      const builderModule = await import('/src/utils/itineraryBuilder.js');
      
      this.dataLoader = dataLoaderModule.getDataLoader();
      this.itineraryBuilder = builderModule.getItineraryBuilder();
      
      console.log('Builders cargados');
      
      // Construir el itinerario
      await this.itineraryBuilder.build();
      console.log('Itinerario construido. Días:', this.itineraryBuilder.dias.length);
      
      // Cargar los días iniciales
      this.dias = this.itineraryBuilder.dias;
      this.diasCargados = this.itineraryBuilder.getInitialDays(this.CANTIDAD_INICIAL);
      this.diaInicioCargado = this.CANTIDAD_INICIAL;
      console.log('Días cargados:', this.diasCargados.length);
      
      if (this.diaInicioCargado >= this.dias.length) {
        this.todosLosDiasCargados = true;
      }
      
      this._aplicarTema();
    } catch (error) {
      console.error('Error inicializando store:', error);
    }
  },

  /**
   * Carga más días para scroll infinito
   */
  cargarMasDias() {
    if (this.cargando || this.todosLosDiasCargados) return;
    
    this.cargando = true;
    
    setTimeout(() => {
      const nuevosDias = this.itineraryBuilder.getMoreDays(
        this.diaInicioCargado,
        this.CANTIDAD_ADICIONAL
      );
      
      if (nuevosDias.length === 0) {
        this.todosLosDiasCargados = true;
      } else {
        this.diasCargados = [...this.diasCargados, ...nuevosDias];
        this.diaInicioCargado += nuevosDias.length;
        
        if (this.diaInicioCargado >= this.dias.length) {
          this.todosLosDiasCargados = true;
        }
      }
      
      this.cargando = false;
    }, 100);
  },

  /**
   * Alterna el tema claro/oscuro
   */
  toggleTema() {
    this.tema = this.tema === 'claro' ? 'oscuro' : 'claro';
    this._aplicarTema();
  },

  /**
   * Cambia la moneda de visualización
   */
  cambiarMoneda(nuevaMoneda) {
    this.moneda = nuevaMoneda;
  },

  /**
   * Alterna la expansión de un evento
   */
  toggleEvento(diaIndex, eventoId) {
    const key = `${diaIndex}-${eventoId}`;
    if (this.eventosExpandidos[key]) {
      delete this.eventosExpandidos[key];
    } else {
      this.eventosExpandidos[key] = true;
    }
    this.ultimaInteraccion = Date.now();
    this.eventosExpandidos = { ...this.eventosExpandidos };
  },

  /**
   * Verifica si un evento está expandido
   */
  estaExpandido(diaIndex, eventoId) {
    const key = `${diaIndex}-${eventoId}`;
    return !!this.eventosExpandidos[key];
  },

  /**
   * Guarda la posición de scroll para una vista
   */
  guardarScroll(vista, posicion) {
    this.scrollPositions[vista] = posicion;
    this.ultimaInteraccion = Date.now();
  },

  /**
   * Obtiene la posición de scroll guardada para una vista
   */
  obtenerScroll(vista) {
    return this.scrollPositions[vista] || 0;
  },

  /**
   * Cambia la vista activa
   */
  cambiarVista(vista) {
    this.vistaActiva = vista;
  },

  /**
   * Obtiene el ícono para un tipo de evento
   */
  getEventIcon(tipo) {
    return this.itineraryBuilder?.getEventIcon(tipo) || 'help';
  },

  /**
   * Obtiene la clase de color para un tipo de evento
   */
  getEventColor(tipo) {
    return this.itineraryBuilder?.getEventColor(tipo) || '';
  },

  /**
   * Obtiene el enlace a Google Maps
   */
  getMapsLink(nodo) {
    return this.itineraryBuilder?.getMapsLink(nodo) || null;
  },

  /**
   * Obtiene los detalles completos de un evento
   */
  getDetallesEvento(evento) {
    return this.itineraryBuilder?.getDetallesCompletos(evento) || {};
  },

  /**
   * Obtiene datos financieros
   */
  getFinanzas() {
    if (!this.dataLoader) return null;
    return this.dataLoader.obtenerFinanzas();
  },

  /**
   * Convierte un monto a la moneda seleccionada
   */
  convertirMoneda(monto, monedaOrigen) {
    const tasas = {
      COP: 1,
      EUR: 4200,
      USD: 3900,
      CHF: 4400,
    };
    
    if (!tasas[monedaOrigen]) return monto;
    if (this.moneda === monedaOrigen) return monto;
    
    const enCOP = monto * tasas[monedaOrigen];
    
    if (this.moneda === 'COP') return enCOP;
    if (tasas[this.moneda]) {
      return enCOP / tasas[this.moneda];
    }
    
    return monto;
  },

  /**
   * Formatea un monto en la moneda seleccionada
   */
  formatearMonto(monto, monedaOrigen) {
    const convertido = this.convertirMoneda(monto, monedaOrigen);
    const simbolos = {
      COP: '$',
      EUR: '€',
      USD: '$',
      CHF: 'CHF',
    };
    const simbolo = simbolos[this.moneda] || '$';
    const decimales = this.moneda === 'COP' ? 0 : 2;
    
    return `${simbolo} ${convertido.toFixed(decimales).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  },

  // Métodos privados
  _aplicarTema() {
    if (this.tema === 'oscuro') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  },

  /**
   * Obtiene el número de días totales
   */
  get totalDias() {
    return this.dias.length;
  },

  /**
   * Verifica si hay más días por cargar
   */
  get hayMasDias() {
    return !this.todosLosDiasCargados;
  },

  /**
   * Obtiene el porcentaje de días cargados
   */
  get porcentajeCargado() {
    if (this.dias.length === 0) return 0;
    return Math.round((this.diasCargados.length / this.dias.length) * 100);
  },
});

// Iniciar Alpine
window.Alpine = Alpine;
Alpine.start();

console.log('Alpine iniciado correctamente');