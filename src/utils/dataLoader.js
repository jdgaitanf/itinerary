/**
 * Cargador de datos del itinerario
 * Maneja la carga de archivos JSON con caché en localStorage
 */

const CACHE_VERSION = '1.0.0';
const CACHE_KEY_GRAPH = 'itinerary-graph';
const CACHE_KEY_VERSION = 'itinerary-graph-version';
const CACHE_KEY_TIMESTAMP = 'itinerary-graph-timestamp';

export class DataLoader {
  constructor() {
    this.raiz = null;
    this.nodos = new Map();
    this.aristas = new Map();
    this.dias = [];
    this.cargado = false;
    this.cacheValida = false;
  }

  /**
   * Verifica si la caché es válida y está actualizada
   */
  isCacheValid() {
    try {
      const storedVersion = localStorage.getItem(CACHE_KEY_VERSION);
      const storedData = localStorage.getItem(CACHE_KEY_GRAPH);
      
      if (!storedData || !storedVersion) return false;
      
      // Verificar que la versión coincida
      if (storedVersion !== CACHE_VERSION) return false;
      
      // Verificar que los datos no estén corruptos
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
      if (!storedData) return false;
      
      const data = JSON.parse(storedData);
      
      // Restaurar datos
      this.raiz = data.raiz;
      this.nodos = new Map(Object.entries(data.nodos));
      this.aristas = new Map(Object.entries(data.aristas));
      this.dias = data.dias;
      this.cargado = true;
      this.cacheValida = true;
      
      console.log('✅ Datos cargados desde caché. Versión:', CACHE_VERSION);
      console.log(`📊 ${this.nodos.size} nodos, ${this.aristas.size} aristas, ${this.dias.length} días`);
      
      return true;
    } catch (error) {
      console.warn('Error cargando desde caché:', error);
      this.clearCache();
      return false;
    }
  }

  /**
   * Guarda datos en caché
   */
  saveToCache() {
    try {
      const data = {
        raiz: this.raiz,
        nodos: Object.fromEntries(this.nodos),
        aristas: Object.fromEntries(this.aristas),
        dias: this.dias,
        timestamp: Date.now()
      };
      
      localStorage.setItem(CACHE_KEY_GRAPH, JSON.stringify(data));
      localStorage.setItem(CACHE_KEY_VERSION, CACHE_VERSION);
      localStorage.setItem(CACHE_KEY_TIMESTAMP, String(Date.now()));
      
      console.log('💾 Datos guardados en caché');
      this.cacheValida = true;
    } catch (error) {
      console.warn('Error guardando en caché:', error);
      // Si el error es por espacio, limpiar caché antigua
      if (error.name === 'QuotaExceededError') {
        this.clearCache();
      }
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
      this.cacheValida = false;
      console.log('🗑️ Caché limpiada');
    } catch (error) {
      console.warn('Error limpiando caché:', error);
    }
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

    // Intentar cargar desde caché primero
    if (this.loadFromCache()) {
      return this;
    }

    console.log('📥 Cargando datos desde archivos...');

    await this.cargarRaiz();
    if (!this.raiz) throw new Error('No se pudo cargar el archivo raíz');

    // Cargar todos los nodos en paralelo
    const nodosPromises = this.raiz.referencias.nodos.map(ruta => 
      this.cargarNodo(ruta)
    );
    await Promise.all(nodosPromises);

    // Cargar todas las aristas en paralelo
    const aristasPromises = this.raiz.referencias.aristas.map(ruta => 
      this.cargarArista(ruta)
    );
    await Promise.all(aristasPromises);

    this.cargado = true;
    
    // Construir días y guardar en caché
    this.construirDias();
    this.saveToCache();
    
    console.log(`📥 Datos cargados desde archivos. ${this.nodos.size} nodos, ${this.aristas.size} aristas`);
    
    return this;
  }

  /**
   * Construye el itinerario por días a partir de nodos y aristas
   * Ordena los nodos por fecha_estadia.entrada
   */
  construirDias() {
    if (!this.cargado) {
      throw new Error('Los datos no han sido cargados');
    }

    // Paso 1: Filtrar nodos que tienen fecha_estadia.entrada
    const nodosConFecha = [];
    const nodosSinFecha = [];
    
    this.nodos.forEach((nodo, id) => {
      if (nodo.fechas_estadia && nodo.fechas_estadia.entrada) {
        nodosConFecha.push({ id, nodo, fecha: nodo.fechas_estadia.entrada });
      } else {
        nodosSinFecha.push({ id, nodo });
      }
    });

    console.log(`📅 Nodos con fecha: ${nodosConFecha.length}, sin fecha: ${nodosSinFecha.length}`);

    // Paso 2: Ordenar nodos con fecha por fecha_estadia.entrada
    nodosConFecha.sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Paso 3: Construir orden final
    const orden = [];
    const visitados = new Set();

    // Primero agregar los nodos con fecha en orden cronológico
    nodosConFecha.forEach(({ id }) => {
      orden.push(id);
      visitados.add(id);
    });

    // Paso 4: Para nodos sin fecha, intentar insertarlos después de su padre
    // (nodo del que proviene según arista entrante)
    nodosSinFecha.forEach(({ id }) => {
      const aristaEntrante = Array.from(this.aristas.values()).find(
        a => a.destino_id === id
      );
      
      if (aristaEntrante) {
        const padreId = aristaEntrante.origen_id;
        const padreIndex = orden.indexOf(padreId);
        if (padreIndex !== -1) {
          // Insertar justo después del padre
          orden.splice(padreIndex + 1, 0, id);
          visitados.add(id);
          return;
        }
      }
      
      // Si no tiene padre o no se encontró, agregar al final
      if (!visitados.has(id)) {
        orden.push(id);
        visitados.add(id);
      }
    });

    // Verificar que todos los nodos estén en el orden
    const nodosFaltantes = Array.from(this.nodos.keys()).filter(
      id => !visitados.has(id)
    );
    
    if (nodosFaltantes.length > 0) {
      console.warn('Nodos faltantes en el orden:', nodosFaltantes);
      nodosFaltantes.forEach(id => {
        if (!visitados.has(id)) {
          orden.push(id);
          visitados.add(id);
        }
      });
    }

    console.log(`📋 Orden final: ${orden.length} nodos`);

    // Paso 5: Construir los días agrupando nodos por fecha
    const diasMap = new Map();

    orden.forEach((nodoId, index) => {
      const nodo = this.nodos.get(nodoId);
      if (!nodo) {
        console.warn(`Nodo ${nodoId} no encontrado`);
        return;
      }

      // Determinar la fecha del nodo
      let fecha = null;
      let horaInicio = null;
      let horaFin = null;

      // 1. Usar fechas_estadia.entrada
      if (nodo.fechas_estadia && nodo.fechas_estadia.entrada) {
        fecha = nodo.fechas_estadia.entrada;
      }

      // 2. Si no tiene fecha, buscar en arista entrante
      if (!fecha) {
        const aristaEntrante = Array.from(this.aristas.values()).find(
          a => a.destino_id === nodoId
        );
        if (aristaEntrante && aristaEntrante.logistica_salida && aristaEntrante.logistica_salida.fecha_salida) {
          fecha = aristaEntrante.logistica_salida.fecha_salida;
        }
      }

      // 3. Si aún no tiene fecha, usar la fecha de inicio del viaje + el índice
      if (!fecha && this.raiz) {
        const fechaInicio = new Date(this.raiz.fechas.inicio);
        const fechaNueva = new Date(fechaInicio);
        fechaNueva.setDate(fechaNueva.getDate() + index);
        fecha = fechaNueva.toISOString().split('T')[0];
      }

      // Si no hay fecha, usar '2099-12-31' para ponerlo al final
      if (!fecha) {
        fecha = '2099-12-31';
      }

      // Buscar arista que llega a este nodo para obtener la hora de llegada
      const aristaEntrante = Array.from(this.aristas.values()).find(
        a => a.destino_id === nodoId
      );

      if (aristaEntrante && aristaEntrante.logistica_salida) {
        if (aristaEntrante.logistica_salida.hora_llegada_destino) {
          horaInicio = aristaEntrante.logistica_salida.hora_llegada_destino;
        }
        if (aristaEntrante.logistica_salida.hora_salida_origen) {
          horaFin = aristaEntrante.logistica_salida.hora_salida_origen;
        }
      }

      if (!diasMap.has(fecha)) {
        diasMap.set(fecha, {
          fecha: fecha,
          eventos: [],
          ciudad: this._obtenerCiudad(nodo),
        });
      }

      // Determinar tipo de evento
      const tipo = this._determinarTipoEvento(nodo);
      const aristaSalida = Array.from(this.aristas.values()).find(
        a => a.origen_id === nodoId
      );

      // Crear evento
      const evento = {
        id: nodo.id,
        tipo: tipo,
        nombre: nodo.nombre,
        nodo: nodo,
        aristaEntrante: aristaEntrante || null,
        aristaSalida: aristaSalida || null,
        horaInicio: horaInicio,
        horaFin: horaFin,
        holgura: this._calcularHolgura(aristaEntrante, aristaSalida),
      };

      diasMap.get(fecha).eventos.push(evento);
    });

    // Convertir a array y ordenar por fecha
    this.dias = Array.from(diasMap.values())
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((dia, index) => ({
        ...dia,
        numeroDia: index + 1,
        eventos: this._ordenarEventosPorHora(dia.eventos),
      }));

    console.log(`📅 Días construidos: ${this.dias.length}`);
    console.log('📅 Fechas:', this.dias.map(d => d.fecha));

    return this.dias;
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

  // Métodos privados de ayuda

  _obtenerCiudad(nodo) {
    if (nodo.direccion && nodo.direccion.ciudad) {
      return nodo.direccion.ciudad;
    }
    return 'Ciudad no especificada';
  }

  _determinarTipoEvento(nodo) {
    const tipoMap = {
      'aeropuerto': 'vuelo',
      'hotel': 'hotel',
      'atraccion': 'actividad',
      'festival': 'festival',
      'oficina_alquiler': 'transporte',
      'casa_amigo': 'casa',
      'casa': 'casa',
    };
    return tipoMap[nodo.tipo] || 'actividad';
  }

  _calcularHolgura(aristaEntrante, aristaSalida) {
    if (!aristaSalida) return null;
    
    const reglas = aristaSalida.reglas_holgura;
    if (!reglas) return null;

    const tiempoRequerido = reglas.tiempo_requerido;
    if (!tiempoRequerido) return null;

    // Extraer horas del string (ej. "3h" -> 3)
    const horas = parseInt(tiempoRequerido);
    if (isNaN(horas)) return null;

    // Calcular hora de salida del hotel
    if (aristaSalida.logistica_salida && 
        aristaSalida.logistica_salida.hora_salida_origen) {
      const horaVuelo = aristaSalida.logistica_salida.hora_salida_origen;
      const [h, m] = horaVuelo.split(':').map(Number);
      
      let hSalida = h - horas;
      let mSalida = m;
      
      if (hSalida < 0) {
        hSalida += 24;
      }

      const horaSalida = `${String(hSalida).padStart(2, '0')}:${String(mSalida).padStart(2, '0')}`;
      
      return {
        tiempoRequerido: tiempoRequerido,
        motivo: reglas.motivo || 'Llegar con anticipación',
        horaSalidaRecomendada: horaSalida,
      };
    }

    return null;
  }

  _ordenarEventosPorHora(eventos) {
    return eventos.sort((a, b) => {
      if (a.horaInicio && b.horaInicio) {
        return a.horaInicio.localeCompare(b.horaInicio);
      }
      if (a.horaInicio) return -1;
      if (b.horaInicio) return 1;
      return 0;
    });
  }

  /**
   * Obtiene información financiera del viaje
   */
  obtenerFinanzas() {
    const gastos = [];
    let totalPresupuesto = 0;
    let totalGastado = 0;
    let gastosPendientes = 0;

    this.nodos.forEach(nodo => {
      // Gastos de reserva
      if (nodo.reserva && nodo.reserva.costo) {
        const costo = nodo.reserva.costo;
        if (costo.valor) {
          totalPresupuesto += costo.valor;
          if (costo.pagado_por) {
            totalGastado += costo.valor;
          } else {
            gastosPendientes += costo.valor;
          }
          gastos.push({
            id: nodo.id,
            tipo: this._determinarTipoEvento(nodo),
            nombre: nodo.nombre,
            fecha: nodo.fechas_estadia?.entrada || 'N/A',
            monto: costo.valor,
            moneda: costo.moneda || 'COP',
            pagadoPor: costo.pagado_por || null,
            incluidoEn: costo.incluido_en || null,
            categoria: this._categorizarGasto(nodo),
          });
        }
      }

      // Gastos de actividades
      if (nodo.actividades) {
        nodo.actividades.forEach(act => {
          if (act.reserva && act.reserva.costo) {
            const costo = act.reserva.costo;
            if (costo.valor) {
              totalPresupuesto += costo.valor;
              if (costo.pagado_por) {
                totalGastado += costo.valor;
              } else {
                gastosPendientes += costo.valor;
              }
              gastos.push({
                id: `${nodo.id}-act-${act.id}`,
                tipo: 'actividad',
                nombre: act.nombre,
                fecha: act.reserva.fecha_reservada || nodo.fechas_estadia?.entrada || 'N/A',
                monto: costo.valor,
                moneda: costo.moneda || 'COP',
                pagadoPor: costo.pagado_por || null,
                incluidoEn: costo.incluido_en || null,
                categoria: this._categorizarGasto(nodo),
              });
            }
          }
        });
      }
    });

    // Gastos de aristas (transporte)
    this.aristas.forEach(arista => {
      if (arista.costos && arista.costos.valor) {
        const costo = arista.costos;
        totalPresupuesto += costo.valor;
        if (costo.pagado_por) {
          totalGastado += costo.valor;
        } else {
          gastosPendientes += costo.valor;
        }
        const nodoOrigen = this.nodos.get(arista.origen_id);
        gastos.push({
          id: arista.id,
          tipo: 'transporte',
          nombre: `${arista.modo}: ${nodoOrigen?.nombre || arista.origen_id}`,
          fecha: arista.logistica_salida?.fecha_salida || 'N/A',
          monto: costo.valor,
          moneda: costo.moneda || 'COP',
          pagadoPor: costo.pagado_por || null,
          incluidoEn: costo.incluido_en || null,
          categoria: 'Transporte',
        });
      }
    });

    return {
      totalPresupuesto,
      totalGastado,
      gastosPendientes,
      saldoRestante: totalPresupuesto - totalGastado - gastosPendientes,
      porcentajeGastado: totalPresupuesto > 0 ? (totalGastado / totalPresupuesto) * 100 : 0,
      gastos,
      gastosPorCategoria: this._agruparPorCategoria(gastos),
      gastosPorPersona: this._agruparPorPersona(gastos),
    };
  }

  _categorizarGasto(nodo) {
    const mapa = {
      'aeropuerto': 'Transporte',
      'hotel': 'Alojamiento',
      'atraccion': 'Entretenimiento',
      'festival': 'Festival',
      'oficina_alquiler': 'Transporte',
      'casa_amigo': 'Alojamiento',
      'casa': 'Alojamiento',
    };
    return mapa[nodo.tipo] || 'Otros';
  }

  _agruparPorCategoria(gastos) {
    const categorias = {};
    gastos.forEach(g => {
      if (!categorias[g.categoria]) {
        categorias[g.categoria] = { total: 0, items: [] };
      }
      categorias[g.categoria].total += g.monto;
      categorias[g.categoria].items.push(g);
    });
    return categorias;
  }

  _agruparPorPersona(gastos) {
    const personas = {};
    gastos.forEach(g => {
      const persona = g.pagadoPor || 'Pendiente';
      if (!personas[persona]) {
        personas[persona] = { total: 0, items: [] };
      }
      personas[persona].total += g.monto;
      personas[persona].items.push(g);
    });
    return personas;
  }
}

// Instancia singleton para usar en toda la aplicación
let dataLoaderInstance = null;

export function getDataLoader() {
  if (!dataLoaderInstance) {
    dataLoaderInstance = new DataLoader();
  }
  return dataLoaderInstance;
}