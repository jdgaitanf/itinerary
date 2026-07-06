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
      // Primero por orden de visita
      if (a.ordenVisita >= 0 && b.ordenVisita >= 0) {
        return a.ordenVisita - b.ordenVisita;
      }
      if (a.ordenVisita >= 0) return -1;
      if (b.ordenVisita >= 0) return 1;

      // Luego por tipo (nodos primero, aristas después)
      if (a.esArista && !b.esArista) return 1;
      if (!a.esArista && b.esArista) return -1;

      // Luego por hora de inicio
      if (a.horaInicio && b.horaInicio) {
        return a.horaInicio.localeCompare(b.horaInicio);
      }
      if (a.horaInicio) return -1;
      if (b.horaInicio) return 1;

      return 0;
    });
  }

  /**
   * Reordena el orden de visita según el algoritmo de dibujo
   * Permite dibujar nodos repetidos cuando se regresa a lugares ya visitados
   */
  _reordenarOrdenVisita() {
    if (!this.ordenVisita || this.ordenVisita.length === 0) {
      return;
    }

    console.log('🔄 Reordenando ordenVisita con algoritmo de dibujo...');

    // 1. Separar nodos y aristas en listas ordenadas por índice
    // Los nodos son únicos (cada nodo aparece una vez en la lista original)
    const nodos = this.ordenVisita
      .filter(item => item.tipo === 'nodo')
      .sort((a, b) => a.indice - b.indice);

    const aristas = this.ordenVisita
      .filter(item => item.tipo === 'arista')
      .sort((a, b) => a.indice - b.indice);

    console.log(`📊 Nodos únicos: ${nodos.length}, Aristas: ${aristas.length}`);
    console.log('📋 Nodos:', nodos.map(n => n.id).join(', '));

    // 2. Mapa de aristas por origen para búsqueda rápida
    const aristasPorOrigen = new Map();
    aristas.forEach(a => {
      if (!aristasPorOrigen.has(a.origen)) {
        aristasPorOrigen.set(a.origen, []);
      }
      aristasPorOrigen.get(a.origen).push(a);
    });

    // 3. Mapa de nodos por ID para búsqueda rápida (del orden original)
    const nodosMap = new Map();
    this.ordenVisita.forEach(item => {
      if (item.tipo === 'nodo') {
        nodosMap.set(item.id, item);
      }
    });

    // 4. Conjuntos para rastrear qué elementos ya se usaron
    const nodosUsados = new Set();  // IDs de nodos que ya fueron "consumidos" de la lista
    const aristasUsadas = new Set();

    // 5. Resultado final
    const nuevoOrden = [];

    // 6. Función para obtener el primer nodo no usado
    function obtenerPrimerNodo() {
      for (const nodo of nodos) {
        if (!nodosUsados.has(nodo.id)) {
          return nodo;
        }
      }
      return null;
    }

    // 7. Función para obtener aristas de un nodo origen no usadas
    function obtenerAristasDeOrigen(origenId) {
      const list = aristasPorOrigen.get(origenId) || [];
      return list.filter(a => !aristasUsadas.has(a.id));
    }

    // 8. Función para dibujar un nodo (agregarlo al nuevo orden)
    function dibujarNodo(nodoId) {
      // Buscar el nodo en el mapa original
      const nodoOriginal = nodosMap.get(nodoId);
      if (!nodoOriginal) {
        console.warn(`⚠️ Nodo ${nodoId} no encontrado en el orden original`);
        return null;
      }
      // Crear una copia con el nuevo índice
      const nuevoNodo = {
        ...nodoOriginal,
        indice: nuevoOrden.length
      };
      nuevoOrden.push(nuevoNodo);
      console.log(`  🏠 Dibujando nodo: ${nodoId} (índice: ${nuevoNodo.indice})`);
      return nuevoNodo;
    }

    // 9. Función para dibujar una arista
    function dibujarArista(arista) {
      const nuevaArista = {
        ...arista,
        indice: nuevoOrden.length
      };
      nuevoOrden.push(nuevaArista);
      aristasUsadas.add(arista.id);
      console.log(`  ➜ Dibujando arista: ${arista.id} (${arista.origen} → ${arista.destino})`);
      return nuevaArista;
    }

    // 10. Algoritmo principal
    let PN = obtenerPrimerNodo();
    if (!PN) {
      console.warn('⚠️ No hay nodos para procesar');
      this.ordenVisita = nuevoOrden;
      return;
    }

    // 1. Dibuja PN
    console.log(`📍 Nodo inicial: ${PN.id}`);
    dibujarNodo(PN.id);
    nodosUsados.add(PN.id);  // Remueve PN de la lista

    let N = PN;  // Ahora PN se llamará N

    // Función principal recursiva
    function procesar() {
      // ¿Hay otro nodo en la lista?
      const siguienteNodo = obtenerPrimerNodo();

      if (!siguienteNodo) {
        // No: FIN
        console.log('✅ No hay más nodos en la lista, proceso completado');
        return;
      }

      // Sí: Ahora PN es el primer nodo de la lista restante
      PN = siguienteNodo;
      console.log(`📌 Siguiente nodo objetivo (PN): ${PN.id}`);

      // ¿Hay una arista desde N a PN?
      const aristaDirecta = aristas.find(a =>
        a.origen === N.id &&
        a.destino === PN.id &&
        !aristasUsadas.has(a.id)
      );

      if (aristaDirecta) {
        // Sí: Dibuje Arista
        console.log(`  ✅ Arista directa encontrada: ${aristaDirecta.id}`);
        dibujarArista(aristaDirecta);

        // Valla a 1.
        N = PN;
        dibujarNodo(PN.id);
        nodosUsados.add(PN.id);  // Remueve PN de la lista
        procesar();
        return;
      }

      // No: 3. ¿N tiene aristas en la lista?
      const aristasDeN = obtenerAristasDeOrigen(N.id);

      if (aristasDeN.length === 0) {
        // No: FIN
        console.log(`  ⚠️ N (${N.id}) no tiene más aristas disponibles`);
        // Intentar con el siguiente nodo
        N = PN;
        dibujarNodo(PN.id);
        nodosUsados.add(PN.id);
        procesar();
        return;
      }

      // Sí: De la lista de posibles aristas restantes que tienen como origen a N, tome la primera (A0)
      const A0 = aristasDeN[0];
      console.log(`  ➜ Tomando arista A0: ${A0.id} (${N.id} → ${A0.destino})`);

      // Dibuje A0
      dibujarArista(A0);

      // Dibuje el nodo destino de A0 (así ya esté dibujado y no exista en el arreglo de nodos)
      const ND = dibujarNodo(A0.destino);
      if (!ND) {
        console.warn(`  ⚠️ No se pudo dibujar el nodo destino ${A0.destino}`);
        procesar();
        return;
      }

      // IMPORTANTE: NO removemos ND de la lista de nodos aquí
      // Solo lo dibujamos, pero si no es PN, permanece en la lista para ser procesado después

      // ¿ND es PN?
      if (ND.id === PN.id) {
        // Sí: Valla a 2.
        console.log(`  ✅ ND (${ND.id}) es igual a PN (${PN.id}), volviendo a 2`);
        // PN ya fue dibujado, pero necesitamos marcarlo como usado porque lo estamos consumiendo
        nodosUsados.add(PN.id);
        // N ahora es PN
        N = PN;
        procesar();
        return;
      }

      // No: ND ahora será N
      console.log(`  ➜ ND (${ND.id}) no es PN, continuando desde ND`);
      N = ND;
      // Valla a 3.
      procesar();
      return;
    }

    // Iniciar el proceso
    procesar();

    // Verificar si quedaron nodos sin procesar (por algún caso borde)
    const nodosRestantes = nodos.filter(n => !nodosUsados.has(n.id));
    if (nodosRestantes.length > 0) {
      console.log(`⚠️ Agregando ${nodosRestantes.length} nodos restantes al final`);
      for (const nodo of nodosRestantes) {
        // Verificar si ya existe en el nuevo orden
        const existe = nuevoOrden.some(item => item.tipo === 'nodo' && item.id === nodo.id);
        if (!existe) {
          dibujarNodo(nodo.id);
        }
        nodosUsados.add(nodo.id);
      }
    }

    // Verificar aristas sin usar
    const aristasRestantes = aristas.filter(a => !aristasUsadas.has(a.id));
    if (aristasRestantes.length > 0) {
      console.log(`⚠️ Agregando ${aristasRestantes.length} aristas restantes al final`);
      for (const arista of aristasRestantes) {
        const existe = nuevoOrden.some(item => item.tipo === 'arista' && item.id === arista.id);
        if (!existe) {
          dibujarArista(arista);
        }
      }
    }

    console.log(`✅ Nuevo orden: ${nuevoOrden.length} elementos`);
    console.log('📋 Nuevo orden:', nuevoOrden.map(item =>
      `${item.tipo}:${item.id}(${item.indice})`
    ).join(' → '));

    // Actualizar el orden de visita
    this.ordenVisita = nuevoOrden;
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
          // Buscar el destino para mostrar información adicional
          const destino = this.nodos.get(arista.destino_id);
          const destinoNombre = destino ? destino.nombre : arista.destino_id;

          this.ordenVisita.push({
            tipo: 'arista',
            id: arista.id,
            indice: indiceOrden++,
            modo: arista.modo,
            origen: arista.origen_id,
            destino: arista.destino_id,
            destinoNombre: destinoNombre,
          });
        }
      }

      // 🔥 MODIFICADO: Agregar TODOS los destinos a la cola, no solo los primeros
      for (const arista of aristasOrdenadas) {
        const destino = this.nodos.get(arista.destino_id);
        // Si el destino existe y no ha sido visitado aún, agregarlo a la cola
        // 🔥 IMPORTANTE: No importa si el destino está oculto o no, debe procesarse
        if (destino && !visitados.has(destino.id)) {
          cola.push(destino);
        }
      }
    }

    console.log('📋 Orden BFS:', orden);
    console.log('📊 Total nodos en orden:', orden.length);
    console.log(`📋 Orden de visita completo: ${this.ordenVisita.length} elementos`);

    // 🔥 NUEVO: Reordenar el orden de visita según el algoritmo de dibujo
    this._reordenarOrdenVisita();


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

    // 🔥🔥🔥 NUEVO: Reordenar después de agregar nodos no alcanzados 🔥🔥🔥
    if (nodosNoAlcanzados.length > 0) {
      console.log('🔄 Reordenando después de agregar nodos no alcanzados...');
      this._reordenarOrdenVisita();
    }



    // Construir días
    const diasMap = new Map();

    // 🔥 NUEVO: Iterar sobre el orden de visita completo (que tiene nodos repetidos)
    this.ordenVisita.forEach((item, index) => {
      // Solo procesar nodos
      if (item.tipo !== 'nodo') return;

      const nodoId = item.id;
      const nodo = this.nodos.get(nodoId);
      if (!nodo) {
        console.warn(`⚠️ Nodo ${nodoId} no encontrado en el orden de visita`);
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

      // Si no tiene fecha, usar la fecha del viaje + el índice actual
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

      // 🔥 NUEVO: Crear evento para el NODO
      const eventoNodo = {
        id: nodo.id,
        tipo: nodo.tipo,
        tipoElemento: 'nodo',
        nombre: nodo.nombre,
        nodo: nodo,
        aristaEntrante: aristaEntrante || null,
        aristaSalida: aristaSalida || null,
        aristaAsociada: null,
        horaInicio: horaInicio,
        horaFin: horaFin,
        holgura: this._calcularHolgura(aristaEntrante, aristaSalida),
        ordenVisita: item.indice, // Usar el índice del orden de visita
        modoTransporte: null,
        esArista: false,
        nodoOriginal: nodo,
      };

      // Agregar el nodo al día
      diasMap.get(fecha).eventos.push(eventoNodo);

      // 🔥 NUEVO: Buscar aristas de salida que correspondan a este nodo en el orden de visita
      // Buscar en ordenVisita las aristas que tienen como origen este nodo
      const aristasSalidaEnOrden = this.ordenVisita.filter(
        item => item.tipo === 'arista' && item.origen === nodo.id
      );

      for (const aristaItem of aristasSalidaEnOrden) {
        const aristaSalidaCompleta = this.aristas.get(aristaItem.id);
        if (!aristaSalidaCompleta || aristaSalidaCompleta.oculto === true) continue;

        const nodoDestino = this.nodos.get(aristaSalidaCompleta.destino_id);

        const eventoArista = {
          id: aristaSalidaCompleta.id,
          tipo: 'arista',
          tipoElemento: 'arista',
          nombre: aristaSalidaCompleta.modo,
          nodo: nodo,
          nodoDestino: nodoDestino || null,
          aristaEntrante: null,
          aristaSalida: aristaSalidaCompleta,
          aristaAsociada: aristaSalidaCompleta,
          horaInicio: aristaSalidaCompleta.logistica_salida?.hora_salida_origen || null,
          horaFin: aristaSalidaCompleta.logistica_salida?.hora_llegada_destino || null,
          holgura: null,
          ordenVisita: aristaItem.indice,
          modoTransporte: aristaSalidaCompleta.modo,
          esArista: true,
          transporte: aristaSalidaCompleta.transporte || null,
          tiempoEstimado: aristaSalidaCompleta.tiempo_estimado || null,
          costo: aristaSalidaCompleta.costos || null,
          notas: aristaSalidaCompleta.notas || null,
        };

        diasMap.get(fecha).eventos.push(eventoArista);
      }
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