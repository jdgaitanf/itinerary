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
    // Ordenar por orden de visita (el índice en el orden de visita)
    return eventos.sort((a, b) => {
      // 1. Si ambos tienen orden de visita, usarlo
      if (a.ordenVisita !== undefined && a.ordenVisita >= 0 &&
        b.ordenVisita !== undefined && b.ordenVisita >= 0) {
        return a.ordenVisita - b.ordenVisita;
      }

      // 2. Si solo a tiene orden, va primero
      if (a.ordenVisita !== undefined && a.ordenVisita >= 0) return -1;
      if (b.ordenVisita !== undefined && b.ordenVisita >= 0) return 1;

      // 3. Si no tienen orden, ordenar por hora de inicio
      if (a.horaInicio && b.horaInicio) {
        return a.horaInicio.localeCompare(b.horaInicio);
      }
      if (a.horaInicio) return -1;
      if (b.horaInicio) return 1;

      // 4. Último recurso: por ID
      return (a.id || '').localeCompare(b.id || '');
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
    let nodos = this.ordenVisita
      .filter(item => item.tipo === 'nodo')
      .sort((a, b) => a.indice - b.indice);

    let aristas = this.ordenVisita
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

    // 4. Resultado final
    const nuevoOrden = [];

    // 5. Función para dibujar un nodo (agregarlo al nuevo orden)
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

    // 6. Función para dibujar una arista
    function dibujarArista(arista) {
      const nuevaArista = {
        ...arista,
        indice: nuevoOrden.length
      };
      nuevoOrden.push(nuevaArista);
      console.log(`  ➜ Dibujando arista: ${arista.id} (${arista.origen} → ${arista.destino})`);
      return nuevaArista;
    }

    // 7. Función para remover un nodo de la lista de nodos pendientes
    function removerNodo(nodoId) {
      const index = nodos.findIndex(n => n.id === nodoId);
      if (index !== -1) {
        nodos.splice(index, 1);
        console.log(`  🗑️ Nodo ${nodoId} removido de la lista de nodos pendientes (quedan ${nodos.length})`);
        return true;
      }
      return false;
    }

    // 8. Función para remover una arista de la lista de aristas pendientes
    function removerArista(aristaId) {
      const index = aristas.findIndex(a => a.id === aristaId);
      if (index !== -1) {
        aristas.splice(index, 1);
        console.log(`  🗑️ Arista ${aristaId} removida de la lista de aristas pendientes (quedan ${aristas.length})`);
        // También remover del mapa de aristas por origen
        for (const [origen, lista] of aristasPorOrigen) {
          const idx = lista.findIndex(a => a.id === aristaId);
          if (idx !== -1) {
            lista.splice(idx, 1);
            if (lista.length === 0) {
              aristasPorOrigen.delete(origen);
            }
            break;
          }
        }
        return true;
      }
      return false;
    }

    // 9. Función para obtener aristas de un nodo origen no usadas
    function obtenerAristasDeOrigen(origenId) {
      return aristasPorOrigen.get(origenId) || [];
    }

    // 10. Función principal recursiva
    function procesar(N) {
      console.log(`📍 Nodo actual (N): ${N.id}`);

      // 2. Remueve N de la lista (ya fue dibujado en el paso 1)
      removerNodo(N.id);

      // ¿Hay otro nodo en la lista?
      if (nodos.length === 0) {
        console.log('✅ No hay más nodos en la lista, proceso completado');
        // Verificar si quedan aristas sin dibujar
        if (aristas.length > 0) {
          console.log(`⚠️ Quedan ${aristas.length} aristas sin dibujar, agregando al final`);
          for (const arista of aristas) {
            dibujarArista(arista);
          }
        }
        return;
      }

      // Sí: Ahora PN es el primer nodo de la lista restante
      const PN = nodos[0];
      console.log(`📌 Siguiente nodo objetivo (PN): ${PN.id}`);

      // ¿Hay una arista desde N a PN?
      const aristaDirecta = aristas.find(a =>
        a.origen === N.id &&
        a.destino === PN.id
      );

      if (aristaDirecta) {
        // Sí: Dibuje Arista
        console.log(`  ✅ Arista directa encontrada: ${aristaDirecta.id}`);
        dibujarArista(aristaDirecta);
        // Remueva la Arista Dibujada (solo esa) de la lista de Aristas
        removerArista(aristaDirecta.id);

        // Valla a 1. (Dibuja PN)
        // 1. Dibuja PN
        const nodoDibujado = dibujarNodo(PN.id);
        if (nodoDibujado) {
          // Ahora PN se llamará N y continuamos
          procesar(nodoDibujado);
        } else {
          // Si no se pudo dibujar, removerlo y continuar con el siguiente
          removerNodo(PN.id);
          if (nodos.length > 0) {
            procesar(nodos[0]);
          }
        }
        return;
      }

      // No: 3. ¿N tiene aristas en la lista?
      const aristasDeN = obtenerAristasDeOrigen(N.id);

      if (aristasDeN.length === 0) {
        // No: FIN - N no tiene más aristas
        console.log(`  ⚠️ N (${N.id}) no tiene más aristas disponibles`);
        // N ya fue removido de la lista, continuar con el siguiente nodo
        if (nodos.length > 0) {
          // El siguiente nodo se convierte en N sin dibujarlo primero
          // (esto es porque N no pudo llegar a PN, así que saltamos a PN)
          const siguienteNodo = nodos[0];
          console.log(`  ➜ Saltando a siguiente nodo: ${siguienteNodo.id}`);
          // Dibujar el siguiente nodo directamente (paso 1)
          const nodoDibujado = dibujarNodo(siguienteNodo.id);
          if (nodoDibujado) {
            procesar(nodoDibujado);
          } else {
            removerNodo(siguienteNodo.id);
            if (nodos.length > 0) {
              procesar(nodos[0]);
            }
          }
        }
        return;
      }

      // Sí: De la lista de posibles aristas restantes que tienen como origen a N, tome la primera (A0)
      const A0 = aristasDeN[0];
      console.log(`  ➜ Tomando arista A0: ${A0.id} (${N.id} → ${A0.destino})`);

      // Dibuje A0
      dibujarArista(A0);
      // Remueva A0 de la lista de aristas
      removerArista(A0.id);

      // Dibuje el nodo destino de A0 (Así ya esté dibujado y no exista en el arreglo de nodos)
      const ND = dibujarNodo(A0.destino);
      if (!ND) {
        console.warn(`  ⚠️ No se pudo dibujar el nodo destino ${A0.destino}`);
        // Si no se pudo dibujar, continuar con el siguiente nodo
        if (nodos.length > 0) {
          procesar(nodos[0]);
        }
        return;
      }

      // ¿ND es PN?
      if (ND.id === PN.id) {
        // Sí: Valla a 2.
        console.log(`  ✅ ND (${ND.id}) es igual a PN (${PN.id}), volviendo a 2`);
        // Remover PN de la lista (ya fue dibujado como ND)
        removerNodo(PN.id);
        // Ahora N es ND (que es PN)
        procesar(ND);
        return;
      }

      // No: ND a hora será N
      console.log(`  ➜ ND (${ND.id}) no es PN, continuando desde ND`);
      // Valla a 3. (N tiene aristas en la lista?)
      // Aquí ND ya fue dibujado y removido de la lista de nodos
      procesar(ND);
    }

    // Iniciar el proceso: Tomar el primer nodo (el del índice menor), le llamaremos PN
    if (nodos.length === 0) {
      console.warn('⚠️ No hay nodos para procesar');
      this.ordenVisita = nuevoOrden;
      return;
    }

    let PN = nodos[0];
    console.log(`📍 Nodo inicial/actual: ${PN.id}`);

    // 1. Dibuja PN
    const nodoInicial = dibujarNodo(PN.id);
    if (!nodoInicial) {
      console.warn('⚠️ No se pudo dibujar el nodo inicial');
      this.ordenVisita = nuevoOrden;
      return;
    }

    // Ahora PN se llamará N y continuamos
    procesar(nodoInicial);

    // Actualizar el orden de visita
    this.ordenVisita = nuevoOrden;
    console.log(`✅ Nuevo orden: ${this.ordenVisita.length} elementos`);
    console.log('📋 Nuevo orden:', this.ordenVisita.map(item =>
      `${item.tipo}:${item.id}(${item.indice})`
    ).join(' → '));
  }

  _construirOrdenBFS(nodoInicial) {
    console.log('🏗️ Construyendo orden BFS básico...');

    const visitados = new Set();
    const cola = [nodoInicial];
    let indice = 0;

    // Mapa de aristas por origen
    const aristasPorOrigen = new Map();
    this.aristas.forEach(arista => {
      if (!aristasPorOrigen.has(arista.origen_id)) {
        aristasPorOrigen.set(arista.origen_id, []);
      }
      aristasPorOrigen.get(arista.origen_id).push(arista);
    });

    // Usar un Set para rastrear aristas ya agregadas
    const aristasAgregadas = new Set();

    this.ordenVisita = [];

    while (cola.length > 0) {
      const actual = cola.shift();

      if (visitados.has(actual.id)) continue;
      visitados.add(actual.id);

      // Agregar el nodo
      if (actual.oculto !== true) {
        this.ordenVisita.push({
          tipo: 'nodo',
          id: actual.id,
          indice: indice++
        });
      }

      // Obtener todas las aristas de salida de este nodo
      const aristasSalida = aristasPorOrigen.get(actual.id) || [];
      const aristasOrdenadas = this._ordenarAristas(aristasSalida);

      // 🔥 IMPORTANTE: Agregar TODAS las aristas, no solo las que van a nodos no visitados
      for (const arista of aristasOrdenadas) {
        // Solo agregar cada arista una vez
        if (aristasAgregadas.has(arista.id)) continue;

        if (arista.oculto !== true) {
          const destino = this.nodos.get(arista.destino_id);
          const destinoNombre = destino ? destino.nombre : arista.destino_id;

          this.ordenVisita.push({
            tipo: 'arista',
            id: arista.id,
            indice: indice++,
            modo: arista.modo,
            origen: arista.origen_id,
            destino: arista.destino_id,
            destinoNombre: destinoNombre,
          });
          aristasAgregadas.add(arista.id);
        }

        // Agregar el destino a la cola solo si no ha sido visitado
        const destino = this.nodos.get(arista.destino_id);
        if (destino && !visitados.has(destino.id)) {
          cola.push(destino);
        }
      }
    }

    console.log(`✅ BFS básico completado: ${this.ordenVisita.length} elementos`);
    console.log(`   📊 Nodos: ${this.ordenVisita.filter(i => i.tipo === 'nodo').length}, Aristas: ${this.ordenVisita.filter(i => i.tipo === 'arista').length}`);
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

    // 1. Primero, asegurarse de que el orden de visita esté construido
    // Si no hay orden de visita, construirlo primero (BFS básico para tener nodos)
    if (this.ordenVisita.length === 0) {
      console.log('⚠️ Orden de visita vacío, construyendo BFS básico...');
      this._construirOrdenBFS(nodoInicial);
    }

    // 2. Reordenar el orden de visita con el algoritmo de dibujo
    // (esto ya debería estar hecho, pero lo llamamos por si acaso)
    this._reordenarOrdenVisita();

    console.log(`📋 Orden de visita final: ${this.ordenVisita.length} elementos`);

    // 3. Construir días usando el orden de visita reordenado
    const diasMap = new Map();

    // Para rastrear qué nodos ya se procesaron y qué fecha tienen
    const nodosProcesados = new Set();

    // Para obtener la fecha de un nodo
    const obtenerFechaNodo = (nodo) => {
      if (nodo.fechas_estadia && nodo.fechas_estadia.entrada) {
        return nodo.fechas_estadia.entrada;
      }
      return null;
    };

    // Para obtener la fecha de una arista
    const obtenerFechaArista = (arista) => {
      if (arista.logistica_salida && arista.logistica_salida.fecha_salida) {
        return arista.logistica_salida.fecha_salida;
      }
      // Si la arista no tiene fecha, usar la fecha del nodo origen
      const nodoOrigen = this.nodos.get(arista.origen_id);
      return nodoOrigen ? obtenerFechaNodo(nodoOrigen) : null;
    };

    // 4. Recorrer el orden de visita para construir los días
    let fechaActual = null;
    let diaIndex = 0;

    // Usar un Set para rastrear qué nodos ya han sido agregados al mapa de días
    const nodosAgregados = new Set();

    // 4. Recorrer el orden de visita para construir los días
for (const item of this.ordenVisita) {
  if (item.tipo === 'nodo') {
    const nodo = this.nodos.get(item.id);
    if (!nodo) continue;

    // Si el nodo está oculto, no se muestra
    if (nodo.oculto === true) {
      console.log(`🔇 Nodo oculto: ${nodo.id} (${nodo.nombre})`);
      continue;
    }

    // Obtener la fecha del nodo
    let fecha = obtenerFechaNodo(nodo);

    // Si el nodo no tiene fecha, buscar la fecha de la arista entrante
    if (!fecha) {
      const aristaEntrante = Array.from(this.aristas.values()).find(
        a => a.destino_id === nodo.id && a.oculto !== true
      );
      if (aristaEntrante) {
        fecha = obtenerFechaArista(aristaEntrante);
      }
    }

    // Si aún no tiene fecha, usar la fecha del viaje + índice
    if (!fecha && this.raiz) {
      const fechaInicio = new Date(this.raiz.fechas.inicio);
      const fechaNueva = new Date(fechaInicio);
      fechaNueva.setDate(fechaNueva.getDate() + diaIndex);
      fecha = fechaNueva.toISOString().split('T')[0];
      diaIndex++;
    }

    if (!fecha) {
      fecha = '2099-12-31';
    }

    // Crear el día si no existe
    if (!diasMap.has(fecha)) {
      diasMap.set(fecha, {
        fecha: fecha,
        eventos: [],
        ciudad: this._obtenerCiudad(nodo),
      });
    }

    // Buscar arista entrante y saliente para este nodo
    const aristaEntrante = Array.from(this.aristas.values()).find(
      a => a.destino_id === nodo.id && a.oculto !== true
    );

    const aristaSalida = Array.from(this.aristas.values()).find(
      a => a.origen_id === nodo.id && a.oculto !== true
    );

    // Obtener hora de inicio y fin
    let horaInicio = null;
    let horaFin = null;

    if (aristaEntrante && aristaEntrante.logistica_salida) {
      if (aristaEntrante.logistica_salida.hora_llegada_destino) {
        horaInicio = aristaEntrante.logistica_salida.hora_llegada_destino;
      }
    }

    if (!horaInicio && aristaSalida && aristaSalida.logistica_salida) {
      if (aristaSalida.logistica_salida.hora_salida_origen) {
        horaInicio = aristaSalida.logistica_salida.hora_salida_origen;
      }
    }

    // Crear el evento del nodo
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
      ordenVisita: item.indice,
      modoTransporte: null,
      esArista: false,
      nodoOriginal: nodo,
    };

    // Agregar el nodo al día
    diasMap.get(fecha).eventos.push(eventoNodo);
    console.log(`✅ Nodo ${nodo.id} agregado al día ${fecha}`);

    // 5. Buscar aristas de salida que correspondan a este nodo en el orden de visita
    const aristasSalidaEnOrden = this.ordenVisita.filter(
      ordenItem => ordenItem.tipo === 'arista' && ordenItem.origen === nodo.id
    );

    // Usar un Set para aristas ya agregadas en este día
    const aristasAgregadasEnDia = new Set();

    for (const aristaItem of aristasSalidaEnOrden) {
      const aristaSalidaCompleta = this.aristas.get(aristaItem.id);
      if (!aristaSalidaCompleta || aristaSalidaCompleta.oculto === true) continue;

      // Verificar si esta arista ya fue agregada en este día
      if (aristasAgregadasEnDia.has(aristaSalidaCompleta.id)) {
        console.log(`⏭️ Arista ${aristaSalidaCompleta.id} ya agregada al día ${fecha}, saltando...`);
        continue;
      }
      aristasAgregadasEnDia.add(aristaSalidaCompleta.id);

      const nodoDestino = this.nodos.get(aristaSalidaCompleta.destino_id);

      // Obtener la fecha de la arista
      let fechaArista = obtenerFechaArista(aristaSalidaCompleta);
      if (!fechaArista) {
        fechaArista = fecha;
      }

      // Crear el día para la arista si no existe
      if (!diasMap.has(fechaArista)) {
        diasMap.set(fechaArista, {
          fecha: fechaArista,
          eventos: [],
          ciudad: this._obtenerCiudad(nodo),
        });
      }

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
        displayName: `${aristaSalidaCompleta.modo}: ${nodoDestino?.nombre || aristaSalidaCompleta.destino_id}`,
        nodoOrigenNombre: nodo.nombre,
        nodoDestinoNombre: nodoDestino?.nombre || aristaSalidaCompleta.destino_id,
      };

      diasMap.get(fechaArista).eventos.push(eventoArista);
      console.log(`✅ Arista ${aristaSalidaCompleta.id} agregada al día ${fechaArista}`);
    }
  }
}

    // 6. Convertir el mapa a array y ordenar
    this.dias = Array.from(diasMap.values())
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((dia, index) => ({
        ...dia,
        numeroDia: index + 1,
        eventos: this._ordenarEventos(dia.eventos),
      }));

    console.log(`📅 Días construidos: ${this.dias.length}`);

    // Log de los eventos por día para depuración
    this.dias.forEach((dia, i) => {
      console.log(`📌 Día ${i + 1} (${dia.fecha}): ${dia.eventos.length} eventos`);
      dia.eventos.forEach((ev, j) => {
        const tipo = ev.esArista ? '🔹 arista' : '📍 nodo';
        const nombre = ev.esArista ? `${ev.modoTransporte} → ${ev.nodoDestinoNombre || ev.nodoDestino?.nombre || '?'}` : ev.nombre;
        console.log(`  ${j + 1}. ${tipo} ${nombre} (orden: ${ev.ordenVisita ?? 'N/A'})`);
      });
    });

    // Log detallado de días
    console.log('📅 RESUMEN FINAL DE DÍAS:');
    this.dias.forEach((dia, i) => {
      console.log(`  Día ${i + 1} (${dia.fecha}): ${dia.eventos.length} eventos`);
      dia.eventos.forEach((ev, j) => {
        const tipo = ev.esArista ? '🔹 arista' : '📍 nodo';
        const nombre = ev.esArista ? `${ev.modoTransporte} → ${ev.nodoDestinoNombre || '?'}` : ev.nombre;
        console.log(`    ${j + 1}. ${tipo} ${nombre} (orden: ${ev.ordenVisita ?? 'N/A'})`);
      });
    });

    return this.dias;
  }
}