/**
 * Constructor de itinerario
 * Procesa los datos crudos y los convierte en estructura para la UI
 */

import { getDataLoader } from './dataLoader.js';

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
   */
  async build() {
    await this.dataLoader.cargarTodosLosDatos();
    this.dias = this.dataLoader.construirDias();
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
    return {
      ...evento,
      icon: this.getEventIcon(evento.tipo),
      colorClass: this.getEventColor(evento.tipo),
      displayName: this.getDisplayName(evento),
      displayTime: this.getDisplayTime(evento),
      direccion: this.getDireccion(evento.nodo),
      mapsLink: this.getMapsLink(evento.nodo),
      detalles: this.getDetallesCompletos(evento),
      costo: this.getCosto(evento),
      tieneHolgura: !!evento.holgura,
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
    return partes.join(', ');
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
      nombre: evento.nombre,
      fecha: this._obtenerFechaEvento(evento),
      horaInicio: evento.horaInicio,
      horaFin: evento.horaFin,
      direccion: this.getDireccion(evento.nodo),
      mapsLink: this.getMapsLink(evento.nodo),
    };

    // Detalles específicos según tipo
    const nodo = evento.nodo;
    switch (evento.tipo) {
      case 'vuelo':
        detalles.aerolinea = nodo.aerolinea || 'No especificada';
        detalles.numeroVuelo = nodo.numero_vuelo || 'N/A';
        detalles.terminal = nodo.terminal || 'N/A';
        detalles.puerta = nodo.puerta_embarque || 'N/A';
        detalles.codigoReserva = nodo.codigo_reserva || 'N/A';
        break;
      
      case 'hotel':
        detalles.checkIn = nodo.horarios?.check_in || 'N/A';
        detalles.checkOut = nodo.horarios?.check_out || 'N/A';
        detalles.titular = nodo.reserva?.nombre_titular || 'No especificado';
        detalles.plataforma = nodo.reserva?.plataforma || 'N/A';
        break;
      
      case 'festival':
        detalles.apertura = nodo.horarios?.apertura || 'N/A';
        detalles.cierre = nodo.horarios?.cierre || 'N/A';
        detalles.lineup = nodo.lineup || [];
        break;
      
      case 'actividad':
        detalles.duracion = nodo.tiempo_estimado_visita || 'N/A';
        detalles.horarioRecomendado = nodo.horario_recomendado || 'N/A';
        detalles.urlOficial = nodo.url_oficial || null;
        break;
    }

    // Actividades dentro del nodo
    if (nodo.actividades && nodo.actividades.length > 0) {
      detalles.actividades = nodo.actividades;
    }

    // Notas adicionales
    if (nodo.notas_adicionales) {
      detalles.notas = nodo.notas_adicionales;
    }

    // Información de la arista si existe
    if (evento.aristaSalida) {
      const arista = evento.aristaSalida;
      detalles.transporte = {
        modo: arista.modo,
        compania: arista.transporte?.compania || 'No especificada',
        tipoVehiculo: arista.transporte?.tipo_vehiculo || 'N/A',
        tiempoEstimado: arista.tiempo_estimado,
      };
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
    
    // Buscar en arista
    if (evento.aristaSalida?.costos) {
      return evento.aristaSalida.costos;
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
}

// Instancia singleton
let builderInstance = null;

export function getItineraryBuilder() {
  if (!builderInstance) {
    builderInstance = new ItineraryBuilder(getDataLoader());
  }
  return builderInstance;
}