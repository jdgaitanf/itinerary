/**
 * Constructor de itinerario
 * Procesa los datos crudos y los convierte en estructura para la UI
 */

import { getDataLoader } from './dataLoader/index.js';

export class ItineraryBuilder {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.dias = [];
    this.eventColors = {
      vuelo: 'event-color-vuelo',
      hotel: 'event-color-hotel',
      actividad: 'event-color-actividad',
      transporte: 'event-color-transporte',
      caminata: 'event-color-caminata',
      festival: 'event-color-festival',
      comida: 'event-color-comida',
      casa: 'event-color-casa',
      taxi: 'event-color-taxi',
      tren: 'event-color-tren',
      metro: 'event-color-metro',
      bus: 'event-color-bus',
      oficina: 'event-color-oficina',
    };
    this.eventIcons = {
      vuelo: 'flight',
      hotel: 'bed',
      actividad: 'theater_comedy',
      transporte: 'directions_car',
      caminata: 'directions_walk',
      festival: 'music_note',
      comida: 'restaurant',
      casa: 'home',
      taxi: 'taxi',
      tren: 'train',
      metro: 'subway',
      bus: 'bus_alert',
      oficina: 'business_center',
    };
  }

  /**
   * Construye el itinerario completo
   * Usa caché si está disponible
   */
  async build() {
    await this.dataLoader.cargarTodosLosDatos();
    this.dias = this.dataLoader.dias;
    return this.dias;
  }

  /**
   * Obtiene los primeros N días para carga inicial
   */
  getInitialDays(cantidad = 4) {
    return this.dias.slice(0, cantidad);
  }

  /**
   * Obtiene días adicionales para scroll infinito
   */
  getMoreDays(desde, cantidad = 3) {
    return this.dias.slice(desde, desde + cantidad);
  }

  /**
   * Prepara un día para la UI
   */
  prepareDia(dia, index) {
    return {
      ...dia,
      numeroDia: index + 1,
      eventos: dia.eventos.map(evento => this.prepareEvento(evento)),
      ciudad: this._obtenerCiudadPrincipal(dia),
      clima: this._obtenerClima(dia),
      totalEventos: dia.eventos.length,
    };
  }

  /**
   * Prepara un evento para la UI
   */
  prepareEvento(evento) {
    // NUEVO: Obtener el orden de visita si existe
    const ordenVisita = this.dataLoader.getOrden('nodo', evento.id);
    
    // Determinar el tipo de evento para ícono y color
    // Si es una arista, usar el modo de transporte como tipo
    let tipoParaIcono = evento.tipo;
    let esArista = evento.esArista || false;
    
    if (esArista && evento.modoTransporte) {
      // Mapear modo de transporte a tipo de evento para ícono
      const modoMap = {
        'avion': 'vuelo',
        'tren': 'tren',
        'metro': 'metro',
        'bus': 'bus',
        'auto': 'transporte',
        'caminata': 'caminata',
      };
      tipoParaIcono = modoMap[evento.modoTransporte] || 'transporte';
    }
    
    return {
      ...evento,
      icon: this.getEventIcon(tipoParaIcono),
      colorClass: this.getEventColor(tipoParaIcono),
      displayName: this.getDisplayName(evento),
      displayTime: this.getDisplayTime(evento),
      direccion: this.getDireccion(evento.nodo),
      mapsLink: this.getMapsLink(evento.nodo),
      detalles: this.getDetallesCompletos(evento),
      costo: this.getCosto(evento),
      tieneHolgura: !!evento.holgura,
      // NUEVO: Añadir el orden de visita para la UI
      ordenVisita: ordenVisita,
      // NUEVO: Indicador de posición en el itinerario
      posicion: ordenVisita >= 0 ? `#${ordenVisita + 1}` : null,
      // NUEVO: Indicar si es arista para la UI
      esArista: esArista,
      // NUEVO: Tipo de elemento para la UI (nodo o arista)
      tipoElemento: evento.tipoElemento || 'nodo',
    };
  }
  /**
   * Obtiene el ícono para un tipo de evento
   */
  getEventIcon(tipo) {
    return this.eventIcons[tipo] || 'help';
  }

  /**
   * Obtiene la clase de color para un tipo de evento
   */
  getEventColor(tipo) {
    return this.eventColors[tipo] || 'event-color-actividad';
  }

  /**
   * Obtiene el nombre a mostrar para el evento
   */
  getDisplayName(evento) {
    if (evento.tipo === 'vuelo' && evento.nodo.codigo_iata) {
      return `${evento.nombre} (${evento.nodo.codigo_iata})`;
    }
    return evento.nombre;
  }

  /**
   * Obtiene la hora a mostrar para el evento
   */
  getDisplayTime(evento) {
    if (evento.horaInicio) {
      return this._formatearHora(evento.horaInicio);
    }
    if (evento.aristaEntrante?.logistica_salida?.hora_llegada_destino) {
      return this._formatearHora(
        evento.aristaEntrante.logistica_salida.hora_llegada_destino
      );
    }
    if (evento.aristaSalida?.logistica_salida?.hora_salida_origen) {
      return this._formatearHora(
        evento.aristaSalida.logistica_salida.hora_salida_origen
      );
    }
    return null;
  }

  /**
   * Obtiene la dirección del evento
   */
  getDireccion(nodo) {
    if (!nodo.direccion) return null;
    const dir = nodo.direccion;
    const partes = [];
    if (dir.calle) partes.push(dir.calle);
    if (dir.ciudad) partes.push(dir.ciudad);
    if (dir.pais) partes.push(dir.pais);
    return partes.join(', ') || null;
  }

  /**
   * Obtiene el enlace a Google Maps
   */
  getMapsLink(nodo) {
    if (!nodo.direccion) return null;
    const dir = nodo.direccion;
    
    if (dir.maps_link) return dir.maps_link;
    
    if (dir.coordenadas && dir.coordenadas.lat && dir.coordenadas.lng) {
      return `https://www.google.com/maps?q=${dir.coordenadas.lat},${dir.coordenadas.lng}`;
    }
    
    // Construir URL desde dirección
    const query = encodeURIComponent(this.getDireccion(nodo) || '');
    if (query) {
      return `https://www.google.com/maps?q=${query}`;
    }
    
    return null;
  }

  /**
   * Obtiene todos los detalles del evento para la expansión
   */
  getDetallesCompletos(evento) {
    const detalles = {
      tipo: evento.tipo,
      tipoElemento: evento.tipoElemento || 'nodo',
      esArista: evento.esArista || false,
      nombre: evento.nombre,
      fecha: this._obtenerFechaEvento(evento),
      horaInicio: evento.horaInicio,
      horaFin: evento.horaFin,
      direccion: this.getDireccion(evento.nodo),
      mapsLink: this.getMapsLink(evento.nodo),
      // NUEVO: Añadir el orden de visita en los detalles
      ordenVisita: evento.ordenVisita,
      posicion: evento.ordenVisita >= 0 ? `#${evento.ordenVisita + 1}` : null,
    };
    
    // Si es una arista, añadir información del transporte
    if (evento.esArista && evento.aristaAsociada) {
      const arista = evento.aristaAsociada;
      detalles.modo = arista.modo;
      detalles.compania = arista.transporte?.compania || null;
      detalles.numeroVuelo = arista.transporte?.numero_vuelo || null;
      detalles.tiempoEstimado = arista.tiempo_estimado || null;
      detalles.notasTransporte = arista.notas || null;
      detalles.costoTransporte = arista.costos || null;
    }

    return detalles;
  }

  /**
   * Obtiene el costo del evento
   */
  getCosto(evento) {  
    const nodo = evento.nodo;
    
    // Buscar en reserva del nodo
    if (nodo.reserva?.costo) {
      return nodo.reserva.costo;
    }
    
    // Buscar en arista de salida
    if (evento.aristaSalida?.costos) {
      return evento.aristaSalida.costos;
    }
    
    // Buscar en arista de entrada
    if (evento.aristaEntrante?.costos) {
      return evento.aristaEntrante.costos;
    }
    
    return null;
  }

  /**
   * Obtiene la ciudad principal del día
   */
  _obtenerCiudadPrincipal(dia) {
    // Intentar obtener de la ciudad del primer evento del día
    if (dia.eventos.length > 0) {
      const primerEvento = dia.eventos[0];
      if (primerEvento.nodo.direccion?.ciudad) {
        return primerEvento.nodo.direccion.ciudad;
      }
    }
    return 'Ciudad no especificada';
  }

  /**
   * Obtiene el clima del día
   */
  _obtenerClima(dia) {
    // Buscar clima en los nodos del día
    for (const evento of dia.eventos) {
      if (evento.nodo.clima_esperado) {
        return evento.nodo.clima_esperado;
      }
    }
    return null;
  }

  /**
   * Obtiene la fecha del evento
   */
  _obtenerFechaEvento(evento) {
    if (evento.nodo.fechas_estadia?.entrada) {
      return evento.nodo.fechas_estadia.entrada;
    }
    if (evento.aristaEntrante?.logistica_salida?.fecha_salida) {
      return evento.aristaEntrante.logistica_salida.fecha_salida;
    }
    if (evento.aristaSalida?.logistica_salida?.fecha_salida) {
      return evento.aristaSalida.logistica_salida.fecha_salida;
    }
    return null;
  }

  /**
   * Formatea una hora para mostrar
   */
  _formatearHora(hora) {
    if (!hora) return null;
    const [h, m] = hora.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  /**
   * NUEVO: Obtiene el orden de visita para un evento
   */
  getOrdenVisita(tipo, id) {
    return this.dataLoader.getOrden(tipo, id);
  }

  /**
   * NUEVO: Obtiene la posición en el itinerario para un evento
   */
  getPosicion(tipo, id) {
    const orden = this.getOrdenVisita(tipo, id);
    return orden >= 0 ? orden + 1 : null;
  }

  /**
   * NUEVO: Compara dos elementos por su orden de visita
   */
  compararOrden(a, b) {
    return this.dataLoader.compararOrden(a, b);
  }
}

// Instancia singleton
let builderInstance = null;

export function getItineraryBuilder() {
  if (!builderInstance) {
    builderInstance = new ItineraryBuilder(getDataLoader());
  }
  return builderInstance;
}