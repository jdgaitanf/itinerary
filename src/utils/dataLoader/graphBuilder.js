/**
 * Constructor de grafo para el DataLoader
 * Construye el orden de visita y los días del itinerario
 */

export class GraphBuilder {
  constructor(nodos, aristas, raiz) {
    this.nodos = nodos;
    this.aristas = aristas;
    this.raiz = raiz;
    this.ordenVisita = [];
    this.dias = [];
  }

  /**
   * Obtiene el orden de visita para un elemento (nodo o arista)
   */
  getOrden(tipo, id) {
    const encontrado = this.ordenVisita.find(item => item.tipo === tipo && item.id === id);
    return encontrado ? encontrado.indice : -1;
  }

  /**
   * Compara dos elementos por su orden de visita
   */
  compararOrden(a, b) {
    const ordenA = this.getOrden(a.tipo, a.id);
    const ordenB = this.getOrden(b.tipo, b.id);
    
    if (ordenA >= 0 && ordenB >= 0) {
      return ordenA - ordenB;
    }
    
    if (ordenA >= 0) return -1;
    if (ordenB >= 0) return 1;
    
    return 0;
  }

  // ============================================================
  // CRITERIOS DE ORDENAMIENTO DE ARISTAS
  // ============================================================
  /**
   * Comparador para ordenar aristas según criterios establecidos:
   * 
   * CRITERIO 1: Arista sin fecha_salida va primero (prioridad máxima)
   * CRITERIO 2: Fecha más antigua primero
   * CRITERIO 3: Hora más temprana primero
   * CRITERIO 4: ID (desempate final)
   */
  _compararAristas(a, b) {
    // CRITERIO 1: Arista sin fecha_salida va primero
    const aSinFecha = !a.logistica_salida?.fecha_salida;
    const bSinFecha = !b.logistica_salida?.fecha_salida;
    
    if (aSinFecha && !bSinFecha) return -1;
    if (!aSinFecha && bSinFecha) return 1;

    // CRITERIO 2: Fecha más antigua primero
    const fechaA = a.logistica_salida?.fecha_salida || '9999-99-99';
    const fechaB = b.logistica_salida?.fecha_salida || '9999-99-99';
    if (fechaA !== fechaB) {
      return fechaA.localeCompare(fechaB);
    }

    // CRITERIO 3: Hora más temprana primero
    const horaA = a.logistica_salida?.hora_salida_origen || '00:00';
    const horaB = b.logistica_salida?.hora_salida_origen || '00:00';
    if (horaA !== horaB) {
      return horaA.localeCompare(horaB);
    }

    // CRITERIO 4: Desempate final por ID
    return a.id.localeCompare(b.id);
  }

  /**
   * Ordena aristas usando el comparador definido
   */
  _ordenarAristas(aristas) {
    return [...aristas].sort((a, b) => this._compararAristas(a, b));
  }

  /**
   * Calcula la holgura para un nodo
   */
  _calcularHolgura(aristaEntrante, aristaSalida) {
    if (!aristaSalida) return null;
    
    const reglas = aristaSalida.reglas_holgura;
    if (!reglas) return null;

    const tiempoRequerido = reglas.tiempo_requerido;
    if (!tiempoRequerido) return null;

    const horas = parseFloat(tiempoRequerido);
    if (isNaN(horas)) return null;

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

  /**
   * Obtiene la ciudad de un nodo
   */
  _obtenerCiudad(nodo) {
    if (nodo.direccion && nodo.direccion.ciudad) {
      return nodo.direccion.ciudad;
    }
    return 'Ciudad no especificada';
  }

  /**
   * Ordena eventos por orden de visita y luego por hora
   */
  _ordenarEventos(eventos) {
    return eventos.sort((a, b) => {
      if (a.ordenVisita >= 0 && b.ordenVisita >= 0) {
        return a.ordenVisita - b.ordenVisita;
      }
      if (a.ordenVisita >= 0) return -1;
      if (b.ordenVisita >= 0) return 1;
      
      if (a.horaInicio && b.horaInicio) {
        return a.horaInicio.localeCompare(b.horaInicio);
      }
      if (a.horaInicio) return -1;
      if (b.horaInicio) return 1;
      
      return 0;
    });
  }

  /**
   * Construye el itinerario por días a partir de nodos y aristas
   */
  construirDias() {
    const nodoInicial = Array.from(this.nodos.values()).find(
      nodo => nodo.tipo === 'casa-origen'
    );

    if (!nodoInicial) {
      throw new Error('No se encontró un nodo de tipo "casa-origen"');
    }

    console.log('🏠 Nodo inicial:', nodoInicial.id);

    // 🔥 NUEVO: Crear mapa de aristas por origen
    const aristasPorOrigen = new Map();
    this.aristas.forEach(arista => {
      if (!aristasPorOrigen.has(arista.origen_id)) {
        aristasPorOrigen.set(arista.origen_id, []);
      }
      aristasPorOrigen.get(arista.origen_id).push(arista);
    });

    // 🔥 NUEVO: Mostrar todas las aristas de roma-villa-angeli para depuración
    const aristasRoma = aristasPorOrigen.get('roma-villa-angeli') || [];
    console.log('📍 Aristas desde roma-villa-angeli:', aristasRoma.map(a => a.id));

    const orden = [];
    const visitados = new Set();
    const cola = [nodoInicial];
    let indiceOrden = 0;

    this.ordenVisita = [];

    while (cola.length > 0) {
      const actual = cola.shift();
      
      if (visitados.has(actual.id)) continue;
      
      visitados.add(actual.id);
      orden.push(actual.id);
      
      // Registrar nodo si no está oculto
      if (actual.oculto !== true) {
        this.ordenVisita.push({
          tipo: 'nodo',
          id: actual.id,
          indice: indiceOrden++
        });
        console.log(`📌 Orden ${indiceOrden}: Nodo ${actual.id} (${actual.nombre})`);
      }
      
      // Obtener aristas de salida de este nodo
      const aristasSalida = aristasPorOrigen.get(actual.id) || [];
      
      // Si no hay aristas de salida, continuar
      if (aristasSalida.length === 0) continue;
      
      // Ordenar aristas por criterios definidos
      const aristasOrdenadas = this._ordenarAristas(aristasSalida);
      
      // 🔥 NUEVO: Registrar TODAS las aristas de salida en el orden de visita
      // (incluyendo las que tienen destinos ya visitados)
      for (const arista of aristasOrdenadas) {
        // Registrar la arista en el orden de visita (solo si no está oculta)
        if (arista.oculto !== true) {
          this.ordenVisita.push({
            tipo: 'arista',
            id: arista.id,
            indice: indiceOrden++
          });
          console.log(`📌 Orden ${indiceOrden}: Arista ${arista.id} (${arista.modo})`);
        }
      }
      
      // 🔥 MODIFICADO: Agregar TODOS los destinos a la cola, no solo los primeros
      for (const arista of aristasOrdenadas) {
        const destino = this.nodos.get(arista.destino_id);
        // Si el destino existe y no ha sido visitado aún, agregarlo a la cola
        // 🔥 IMPORTANTE: No importa si el destino está oculto o no, debe procesarse
        if (destino && !visitados.has(destino.id)) {
          console.log(`  ➜ Agregando destino: ${destino.id} (${destino.nombre})`);
          cola.push(destino);
        }
      }
    }

    console.log('📋 Orden BFS:', orden);
    console.log('📊 Total nodos en orden:', orden.length);
    console.log(`📋 Orden de visita completo: ${this.ordenVisita.length} elementos`);

    // Verificar nodos no alcanzados
    const nodosNoAlcanzados = Array.from(this.nodos.keys()).filter(
      id => !visitados.has(id)
    );
    
    if (nodosNoAlcanzados.length > 0) {
      console.warn('⚠️ Nodos no alcanzados por BFS:', nodosNoAlcanzados);
      // 🔥 NUEVO: Para cada nodo no alcanzado, buscar su arista entrante y agregarlo
      for (const id of nodosNoAlcanzados) {
        if (!visitados.has(id)) {
          // Buscar una arista que llegue a este nodo
          const aristaEntrante = Array.from(this.aristas.values()).find(
            a => a.destino_id === id && a.oculto !== true
          );
          
          if (aristaEntrante) {
            console.log(`  ➜ Nodo ${id} tiene arista entrante: ${aristaEntrante.id} desde ${aristaEntrante.origen_id}`);
            
            // Verificar si el origen ya fue visitado
            if (visitados.has(aristaEntrante.origen_id)) {
              // El origen fue visitado, pero este nodo no - agregarlo manualmente
              console.log(`  ➜ Agregando nodo ${id} manualmente (origen ya visitado)`);
              orden.push(id);
              visitados.add(id);
              const nodo = this.nodos.get(id);
              if (nodo && nodo.oculto !== true) {
                this.ordenVisita.push({
                  tipo: 'nodo',
                  id: id,
                  indice: indiceOrden++
                });
              }
              // Registrar la arista también
              if (aristaEntrante.oculto !== true) {
                this.ordenVisita.push({
                  tipo: 'arista',
                  id: aristaEntrante.id,
                  indice: indiceOrden++
                });
              }
            }
          } else {
            // Si no tiene arista entrante, agregarlo al final
            orden.push(id);
            visitados.add(id);
            const nodo = this.nodos.get(id);
            if (nodo && nodo.oculto !== true) {
              this.ordenVisita.push({
                tipo: 'nodo',
                id: id,
                indice: indiceOrden++
              });
            }
          }
        }
      }
    }

    // Construir días
    const diasMap = new Map();

    const nodosOrdenados = [...orden].sort((a, b) => {
      const ordenA = this.getOrden('nodo', a);
      const ordenB = this.getOrden('nodo', b);
      if (ordenA >= 0 && ordenB >= 0) return ordenA - ordenB;
      if (ordenA >= 0) return -1;
      if (ordenB >= 0) return 1;
      return 0;
    });

    nodosOrdenados.forEach((nodoId, index) => {
      const nodo = this.nodos.get(nodoId);
      if (!nodo) {
        console.warn(`⚠️ Nodo ${nodoId} no encontrado`);
        return;
      }

      if (nodo.oculto === true) {
        console.log(`🔇 Nodo oculto: ${nodo.id} (${nodo.nombre})`);
        return;
      }

      let fecha = null;
      let horaInicio = null;
      let horaFin = null;

      if (nodo.fechas_estadia && nodo.fechas_estadia.entrada) {
        fecha = nodo.fechas_estadia.entrada;
      }

      if (!fecha) {
        const aristaEntrante = Array.from(this.aristas.values()).find(
          a => a.destino_id === nodoId && a.oculto !== true
        );
        if (aristaEntrante && aristaEntrante.logistica_salida && aristaEntrante.logistica_salida.fecha_salida) {
          fecha = aristaEntrante.logistica_salida.fecha_salida;
        }
      }

      if (!fecha && this.raiz) {
        const fechaInicio = new Date(this.raiz.fechas.inicio);
        const fechaNueva = new Date(fechaInicio);
        fechaNueva.setDate(fechaNueva.getDate() + index);
        fecha = fechaNueva.toISOString().split('T')[0];
      }

      if (!fecha) {
        fecha = '2099-12-31';
      }

      const aristaEntrante = Array.from(this.aristas.values()).find(
        a => a.destino_id === nodoId && a.oculto !== true
      );

      const aristaSalida = Array.from(this.aristas.values()).find(
        a => a.origen_id === nodoId && a.oculto !== true
      );

      if (aristaEntrante && aristaEntrante.logistica_salida) {
        if (aristaEntrante.logistica_salida.hora_llegada_destino) {
          horaInicio = aristaEntrante.logistica_salida.hora_llegada_destino;
        }
        if (aristaEntrante.logistica_salida.hora_salida_origen) {
          horaFin = aristaEntrante.logistica_salida.hora_salida_origen;
        }
      }

      if (!horaInicio && aristaSalida && aristaSalida.logistica_salida) {
        if (aristaSalida.logistica_salida.hora_salida_origen) {
          horaInicio = aristaSalida.logistica_salida.hora_salida_origen;
        }
      }

      if (!diasMap.has(fecha)) {
        diasMap.set(fecha, {
          fecha: fecha,
          eventos: [],
          ciudad: this._obtenerCiudad(nodo),
        });
      }

      const evento = {
        id: nodo.id,
        tipo: null,
        nombre: nodo.nombre,
        nodo: nodo,
        aristaEntrante: aristaEntrante || null,
        aristaSalida: aristaSalida || null,
        horaInicio: horaInicio,
        horaFin: horaFin,
        holgura: this._calcularHolgura(aristaEntrante, aristaSalida),
        ordenVisita: this.getOrden('nodo', nodo.id),
      };

      diasMap.get(fecha).eventos.push(evento);
    });

    this.dias = Array.from(diasMap.values())
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((dia, index) => ({
        ...dia,
        numeroDia: index + 1,
        eventos: this._ordenarEventos(dia.eventos),
      }));

    console.log(`📅 Días construidos: ${this.dias.length}`);
    console.log('📅 Fechas:', this.dias.map(d => d.fecha));

    return this.dias;
  }
}