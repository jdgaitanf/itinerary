/**
 * Cargador de datos del itinerario
 * Maneja la carga progresiva de archivos JSON segmentados
 */

export class DataLoader {
  constructor() {
    this.raiz = null;
    this.nodos = new Map();
    this.aristas = new Map();
    this.dias = [];
    this.cargado = false;
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
    if (this.cargado) return;

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
    return this;
  }

  /**
   * Construye el itinerario por días a partir de nodos y aristas
   */
  construirDias() {
    if (!this.cargado) {
      throw new Error('Los datos no han sido cargados');
    }

    // Construir el orden cronológico siguiendo las aristas
    const orden = [];
    const visitados = new Set();

    // Encontrar el nodo inicial (sin aristas entrantes)
    const nodosIds = new Set(this.nodos.keys());
    const destinosIds = new Set(
      Array.from(this.aristas.values()).map(a => a.destino_id)
    );
    
    const nodoInicialId = Array.from(nodosIds).find(id => !destinosIds.has(id));
    if (!nodoInicialId) {
      throw new Error('No se encontró un nodo inicial');
    }

    console.log('Nodo inicial:', nodoInicialId);

    // Crear un mapa de aristas por origen para acceso rápido
    const aristasPorOrigen = new Map();
    this.aristas.forEach(arista => {
      if (!aristasPorOrigen.has(arista.origen_id)) {
        aristasPorOrigen.set(arista.origen_id, []);
      }
      aristasPorOrigen.get(arista.origen_id).push(arista);
    });

    // Guardar referencias para usar en la función navegar
    const self = this;

    // Función para navegar recursivamente (usando función normal pero con self)
    function navegar(nodoId) {
      if (visitados.has(nodoId)) return;
      
      visitados.add(nodoId);
      orden.push(nodoId);
      console.log(`Agregando nodo: ${nodoId} (${orden.length})`);

      const aristasSalida = aristasPorOrigen.get(nodoId) || [];
      
      // Primero, procesar las aristas que van a nodos que NO son atracciones (hoteles, aeropuertos, etc.)
      // y luego las atracciones
      const aristasPrincipales = aristasSalida.filter(a => {
        const destino = self.nodos.get(a.destino_id);
        return destino && destino.tipo !== 'atraccion';
      });
      
      const aristasAtracciones = aristasSalida.filter(a => {
        const destino = self.nodos.get(a.destino_id);
        return destino && destino.tipo === 'atraccion';
      });

      // Procesar aristas principales primero
      for (const arista of aristasPrincipales) {
        if (!visitados.has(arista.destino_id)) {
          navegar(arista.destino_id);
        }
      }

      // Luego procesar atracciones
      for (const arista of aristasAtracciones) {
        if (!visitados.has(arista.destino_id)) {
          navegar(arista.destino_id);
        }
      }
    }

    // Iniciar navegación desde el nodo inicial
    navegar(nodoInicialId);

    // Verificar si hay nodos que no fueron visitados
    const nodosNoVisitados = Array.from(this.nodos.keys()).filter(
      id => !visitados.has(id)
    );

    if (nodosNoVisitados.length > 0) {
      console.warn('Nodos no visitados:', nodosNoVisitados);
      
      // Intentar insertarlos en el orden correcto según sus aristas entrantes
      for (const nodoId of nodosNoVisitados) {
        const aristaEntrante = Array.from(this.aristas.values()).find(
          a => a.destino_id === nodoId
        );
        if (aristaEntrante) {
          const padreId = aristaEntrante.origen_id;
          const padreIndex = orden.indexOf(padreId);
          if (padreIndex !== -1) {
            orden.splice(padreIndex + 1, 0, nodoId);
            visitados.add(nodoId);
          }
        }
      }
    }

    console.log('Orden final de nodos:', orden);
    console.log('Total nodos:', orden.length);

    // Construir los días agrupando nodos por fecha
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

      // 1. Primero intentar con fechas_estadia
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
      if (!fecha) {
        const fechaInicio = new Date(this.raiz.fechas.inicio);
        const fechaNueva = new Date(fechaInicio);
        fechaNueva.setDate(fechaNueva.getDate() + index);
        fecha = fechaNueva.toISOString().split('T')[0];
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

    console.log('Días construidos:', this.dias.length);
    console.log('Fechas:', this.dias.map(d => d.fecha));

    return this.dias;
  }

  /**
   * Obtiene los primeros N días del itinerario
   */
  obtenerDias(cantidad = 3) {
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