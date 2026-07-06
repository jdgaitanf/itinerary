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
      const dataLoaderModule = await import('/src/utils/dataLoader/index.js');
      const builderModule = await import('/src/utils/itineraryBuilder.js');

      this.dataLoader = dataLoaderModule.getDataLoader();
      this.itineraryBuilder = builderModule.getItineraryBuilder();

      console.log('Builders cargados');



      // Forzar recarga sin caché para depuración
      console.log('🔧 Forzando recarga sin caché...');
      this.dataLoader.clearCache();
      await this.itineraryBuilder.build();
      console.log('✅ Datos recargados desde archivos');
      console.log('Itinerario construido. Días:', this.itineraryBuilder.dias.length);

      // NUEVO: Verificar el orden de visita
      const ordenVisita = this.dataLoader.ordenVisita || [];
      console.log(`📋 Orden de visita: ${ordenVisita.length} elementos`);

      // Mostrar los primeros 10 elementos del orden
      if (ordenVisita.length > 0) {
        const muestra = ordenVisita.slice(0, 10).map(item =>
          `${item.tipo}:${item.id} (${item.indice})`
        );
        console.log('📌 Primeros elementos del orden:', muestra.join(', '));
        console.log('📌 Primeros elementos del orden:', ordenVisita);
      }

      // Cargar los días iniciales
      this.dias = this.itineraryBuilder.dias;
      this.diasCargados = this.itineraryBuilder.getInitialDays(this.CANTIDAD_INICIAL);

      // NUEVO: Verificar el orden de eventos en el primer día
      if (this.diasCargados.length > 0 && this.diasCargados[0].eventos.length > 0) {
        const eventos = this.diasCargados[0].eventos;
        console.log(`📌 Eventos del día 1 (${eventos.length}):`);
        eventos.forEach((ev, idx) => {
          console.log(`  ${idx + 1}. ${ev.nombre} (tipo: ${ev.tipoElemento || 'nodo'}, orden: ${ev.ordenVisita ?? 'N/A'})`);
        });
      }

      this.diaInicioCargado = this.CANTIDAD_INICIAL;
      console.log('Días cargados:', this.diasCargados.length);

      // NUEVO: Verificar el orden de eventos en el primer día
      if (this.diasCargados.length > 0 && this.diasCargados[0].eventos.length > 0) {
        const eventos = this.diasCargados[0].eventos;
        console.log(`📌 Eventos del día 1 (${eventos.length}):`);
        eventos.forEach((ev, idx) => {
          console.log(`  ${idx + 1}. ${ev.nombre} (orden: ${ev.ordenVisita ?? 'N/A'})`);
        });
      }

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
  // src/scripts/alpine-store.js

  // ... resto del código ...

  /**
   * Carga más días para scroll infinito
   */
  cargarMasDias() {
    if (this.cargando || this.todosLosDiasCargados) return;

    this.cargando = true;

    // Usar setTimeout para no bloquear la UI
    setTimeout(() => {
      // 🔥 CORREGIDO: Usar dataLoader en lugar de itineraryBuilder
      const nuevosDias = this.dataLoader.obtenerMasDias(
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

  // ... resto del código ...

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
   * Obtiene información de la caché
   */
  getCacheInfo() {
    if (!this.dataLoader) return { existe: false };
    return this.dataLoader.getCacheInfo();
  },

  /**
   * Limpia la caché
   */
  limpiarCache() {
    if (!this.dataLoader) return;
    this.dataLoader.clearCache();
    console.log('Caché limpiada. Recargando datos...');
  },

  /**
   * NUEVO: Obtiene el orden de visita para un elemento
   */
  getOrdenVisita(tipo, id) {
    if (!this.dataLoader) return -1;
    return this.dataLoader.getOrden(tipo, id);
  },

  /**
   * NUEVO: Obtiene la posición en el itinerario para un elemento
   */
  getPosicion(tipo, id) {
    const orden = this.getOrdenVisita(tipo, id);
    return orden >= 0 ? orden + 1 : null;
  },

  /**
   * NUEVO: Compara dos elementos por su orden de visita
   */
  compararOrden(a, b) {
    if (!this.dataLoader) return 0;
    return this.dataLoader.compararOrden(a, b);
  },

  /**
   * NUEVO: Obtiene todos los elementos del orden de visita
   */
  getOrdenCompleto() {
    if (!this.dataLoader) return [];
    return this.dataLoader.ordenVisita || [];
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