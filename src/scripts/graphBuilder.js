export function buildItineraryFromGraph(nodos, aristas) {
  if (!nodos || !aristas) {
    return [];
  }

  // Encontrar el nodo casa_origen
  const casaOrigen = nodos.find(n => n.tipo === 'casa_origen');
  if (!casaOrigen) {
    console.warn('No se encontró nodo casa_origen');
    return [];
  }

  // Construir un mapa de nodos por ID
  const nodosMap = {};
  nodos.forEach(n => {
    nodosMap[n.id] = n;
  });

  // Construir el grafo de adyacencia (origen -> [aristas])
  const adj = {};
  aristas.forEach(a => {
    if (!adj[a.origen_id]) {
      adj[a.origen_id] = [];
    }
    adj[a.origen_id].push(a);
  });

  // Algoritmo BFS para recorrer el grafo desde casa_origen
  const visitados = new Set();
  const cola = [casaOrigen.id];
  const orden = [];
  const eventos = [];

  while (cola.length > 0) {
    const currentId = cola.shift();
    if (visitados.has(currentId)) continue;
    visitados.add(currentId);

    const nodo = nodosMap[currentId];
    if (!nodo) continue;

    // Agregar el nodo como evento (solo si no está oculto o es casa_origen)
    if (nodo.tipo === 'casa_origen' || !nodo.oculto) {
      orden.push({ tipo: 'nodo', data: nodo });
      
      // Crear evento para el nodo
      const evento = {
        id: nodo.id,
        tipo: nodo.tipo,
        nombre: nodo.nombre,
        hora: obtenerHoraDeVisita(nodo),
        direccion: obtenerDireccion(nodo),
        detalles: obtenerDetalles(nodo),
        icono: obtenerIconoParaTipo(nodo.tipo),
        reserva: obtenerReserva(nodo),
        compania: obtenerCompania(nodo),
        tiempo_estimado: nodo.tiempo_estimado_visita || ''
      };
      eventos.push(evento);
    }

    // Procesar aristas salientes
    if (adj[currentId]) {
      // Ordenar aristas por fecha/hora de salida
      const aristasOrdenadas = adj[currentId].sort((a, b) => {
        const fechaA = a.logistica_salida?.fecha_salida || '';
        const fechaB = b.logistica_salida?.fecha_salida || '';
        if (fechaA !== fechaB) return fechaA.localeCompare(fechaB);
        const horaA = a.logistica_salida?.hora_salida_origen || '';
        const horaB = b.logistica_salida?.hora_salida_origen || '';
        return horaA.localeCompare(horaB);
      });

      for (const arista of aristasOrdenadas) {
        // Solo agregar aristas visibles o con reglas_holgura
        if (arista.oculto && !arista.reglas_holgura) continue;

        // Crear evento para la arista
        const eventoArista = {
          id: arista.id,
          tipo: 'arista',
          nombre: `${obtenerNombreModo(arista.modo)}: ${arista.origen_id} → ${arista.destino_id}`,
          hora: arista.logistica_salida?.hora_salida_origen || '',
          detalles: arista.transporte?.detalles || arista.notas || '',
          icono: obtenerIconoParaModo(arista.modo),
          tiempo_estimado: arista.tiempo_estimado?.rango || '',
          reserva: arista.transporte?.codigo_reserva_confirmacion || '',
          compania: arista.transporte?.compania || ''
        };
        eventos.push(eventoArista);

        // Agregar destino a la cola si no está visitado
        const destino = nodosMap[arista.destino_id];
        if (destino && !visitados.has(destino.id) && (!destino.oculto || destino.tipo === 'casa_origen')) {
          cola.push(destino.id);
        }
      }
    }
  }

  return eventos;
}

// Funciones auxiliares para extraer información de los nodos
function obtenerHoraDeVisita(nodo) {
  if (nodo.visitas && nodo.visitas.length > 0) {
    // Si tiene visita, usar la fecha de entrada como referencia
    return nodo.visitas[0].entrada || '';
  }
  return '';
}

function obtenerDireccion(nodo) {
  if (nodo.direccion) {
    const partes = [];
    if (nodo.direccion.calle) partes.push(nodo.direccion.calle);
    if (nodo.direccion.ciudad) partes.push(nodo.direccion.ciudad);
    if (nodo.direccion.pais) partes.push(nodo.direccion.pais);
    return partes.join(', ') || '';
  }
  return '';
}

function obtenerDetalles(nodo) {
  const detalles = [];
  if (nodo.visitas && nodo.visitas.length > 0) {
    const visita = nodo.visitas[0];
    if (visita.notas) detalles.push(visita.notas);
    if (visita.clima) {
      const clima = visita.clima;
      if (clima.condiciones) detalles.push(`Clima: ${clima.condiciones}`);
      if (clima.temperatura_promedio) detalles.push(`Temp: ${clima.temperatura_promedio}`);
    }
  }
  if (nodo.horarios) {
    const h = nodo.horarios;
    if (h.check_in) detalles.push(`Check-in: ${h.check_in}`);
    if (h.check_out) detalles.push(`Check-out: ${h.check_out}`);
    if (h.horario_apertura) detalles.push(`Apertura: ${h.horario_apertura}`);
    if (h.horario_cierre) detalles.push(`Cierre: ${h.horario_cierre}`);
  }
  return detalles.join(' | ') || '';
}

function obtenerReserva(nodo) {
  if (nodo.visitas && nodo.visitas.length > 0) {
    const visita = nodo.visitas[0];
    if (visita.reserva) {
      const r = visita.reserva;
      if (r.codigo_reserva) return r.codigo_reserva;
      if (r.codigo) return r.codigo;
    }
  }
  return '';
}

function obtenerCompania(nodo) {
  if (nodo.visitas && nodo.visitas.length > 0) {
    const visita = nodo.visitas[0];
    if (visita.reserva && visita.reserva.plataforma) {
      return visita.reserva.plataforma;
    }
  }
  return '';
}

function obtenerIconoParaTipo(tipo) {
  const iconos = {
    'casa_origen': 'home',
    'casa': 'home',
    'casa_amigo': 'home',
    'aeropuerto': 'flight_takeoff',
    'hotel': 'bed',
    'atraccion': 'theater_masks',
    'festival': 'music_note',
    'oficina_alquiler': 'corporate_fare'
  };
  return iconos[tipo] || 'place';
}

function obtenerIconoParaModo(modo) {
  const iconos = {
    'avion': 'flight',
    'tren': 'train',
    'metro': 'subway',
    'bus': 'bus_alert',
    'auto': 'directions_car',
    'caminata': 'directions_walk',
    'taxi': 'taxi'
  };
  return iconos[modo] || 'directions_transit';
}

function obtenerNombreModo(modo) {
  const nombres = {
    'avion': 'Avión',
    'tren': 'Tren',
    'metro': 'Metro',
    'bus': 'Autobús',
    'auto': 'Auto',
    'caminata': 'Caminata',
    'taxi': 'Taxi'
  };
  return nombres[modo] || modo;
}