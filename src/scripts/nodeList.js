import { getViajeGraph, getItineraryList } from '../lib/storage.js';
import { loadViajeData } from '../lib/dataLoader.js';

async function displayItinerary() {
  const nodeListElement = document.getElementById('node-list');
  
  if (!nodeListElement) {
    console.error('Element #node-list not found');
    return;
  }
  
  // Cargar datos si no existen
  let graph = getViajeGraph();
  if (!graph) {
    graph = await loadViajeData();
  }
  
  // Obtener el itinerario como array
  const itinerary = getItineraryList();
  
  if (!itinerary || itinerary.length === 0) {
    nodeListElement.textContent = 'No se encontró itinerario';
    return;
  }

  // Crear mapas para búsqueda rápida
  const nodosMap = new Map();
  graph.nodos.forEach(nodo => {
    nodosMap.set(nodo.id, nodo);
  });

  const aristasMap = new Map();
  graph.aristas.forEach(arista => {
    aristasMap.set(arista.id, arista);
  });

  // Construir el HTML
  let html = '';
  
  for (const item of itinerary) {
    if (item.tipo === 'nodo') {
      const nodo = nodosMap.get(item.id);
      if (nodo) {
        html += buildNodoCardHTML(nodo);
      }
    } else if (item.tipo === 'arista') {
      const arista = aristasMap.get(item.id);
      if (arista) {
        const origen = nodosMap.get(arista.origen_id);
        const destino = nodosMap.get(arista.destino_id);
        html += buildAristaCardHTML(arista, origen, destino);
      }
    }
  }

  nodeListElement.innerHTML = html;

  // Agregar event listeners para expansión/contracción
  document.querySelectorAll('.nodo-card, .arista-card').forEach(card => {
    const header = card.querySelector('.nodo-card-header, .arista-card-header');
    if (header) {
      header.addEventListener('click', () => {
        toggleCard(card);
      });
    }
  });
}

function buildNodoCardHTML(nodo) {
  const iconName = getNodeIcon(nodo.tipo);
  const tipoLabel = getNodeTipoLabel(nodo.tipo);
  const fechaEntrada = nodo.visitas && nodo.visitas.length > 0 ? nodo.visitas[0].entrada : '';
  const fechaSalida = nodo.visitas && nodo.visitas.length > 0 ? nodo.visitas[0].salida : '';
  const ciudad = nodo.direccion?.ciudad || '';
  const pais = nodo.direccion?.pais || '';
  const mapsLink = nodo.direccion?.maps_link || '';
  const contacto = nodo.contacto || {};
  const horarios = nodo.horarios || {};
  const clima = nodo.visitas && nodo.visitas.length > 0 ? nodo.visitas[0].clima : null;
  const reserva = nodo.visitas && nodo.visitas.length > 0 ? nodo.visitas[0].reserva : null;
  const notas = nodo.visitas && nodo.visitas.length > 0 ? nodo.visitas[0].notas : null;
  const actividades = nodo.actividades || [];
  const equipaje = nodo.equipaje_recomendado || [];
  const moneda = nodo.moneda_local || {};
  const idioma = nodo.idioma_principal || '';
  const tiempoVisita = nodo.tiempo_estimado_visita || '';
  const reglas = nodo.reglas_especiales || [];

  return `
    <div class="nodo-card" data-id="${nodo.id}">
      <div class="nodo-card-header">
        <span class="nodo-card-icon material-symbols-outlined">${iconName}</span>
        <div class="nodo-card-content">
          <div class="nodo-card-title">${nodo.nombre || nodo.id}</div>
          <div class="nodo-card-subtitle">
            <span class="nodo-card-badge ${nodo.tipo}">${tipoLabel}</span>
            ${ciudad ? ` · ${ciudad}` : ''}
            ${pais ? `, ${pais}` : ''}
            ${fechaEntrada ? ` · ${formatDate(fechaEntrada)}` : ''}
          </div>
        </div>
        <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
      </div>

      <div class="nodo-card-expanded">
        ${fechaEntrada ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">calendar_today</span>
            <span><strong>Entrada:</strong> ${formatDate(fechaEntrada)}${fechaSalida && fechaSalida !== fechaEntrada ? ` · <strong>Salida:</strong> ${formatDate(fechaSalida)}` : ''}</span>
          </div>
        ` : ''}

        ${ciudad || pais ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">location_on</span>
            <span>${ciudad}${ciudad && pais ? ', ' : ''}${pais}</span>
            ${mapsLink ? `<a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">Ver en mapa</a>` : ''}
          </div>
        ` : ''}

        ${contacto.telefono || contacto.email || contacto.web ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">contact_support</span>
            <span>
              ${contacto.telefono ? `📞 ${contacto.telefono}` : ''}
              ${contacto.email ? ` · ✉️ ${contacto.email}` : ''}
              ${contacto.web ? ` · 🌐 <a href="${contacto.web}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">${contacto.web}</a>` : ''}
            </span>
          </div>
        ` : ''}

        ${horarios.check_in || horarios.check_out || horarios.horario_apertura || horarios.horario_cierre || horarios.atencion ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">schedule</span>
            <span>
              ${horarios.check_in ? `Check-in: ${horarios.check_in}` : ''}
              ${horarios.check_out ? ` · Check-out: ${horarios.check_out}` : ''}
              ${horarios.horario_apertura ? ` · Apertura: ${horarios.horario_apertura}` : ''}
              ${horarios.horario_cierre ? ` · Cierre: ${horarios.horario_cierre}` : ''}
              ${horarios.atencion ? ` · Atención: ${horarios.atencion}` : ''}
            </span>
          </div>
        ` : ''}

        ${clima ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">partly_cloudy_day</span>
            <span>
              ${clima.temperatura_promedio || ''}
              ${clima.condiciones || ''}
              ${clima.probabilidad_lluvia ? ` · Lluvia: ${clima.probabilidad_lluvia}` : ''}
              ${clima.recomendacion_vestimenta ? ` · 👕 ${clima.recomendacion_vestimenta}` : ''}
            </span>
          </div>
        ` : ''}

        ${reserva ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">confirmation_number</span>
            <span>
              ${reserva.confirmada !== undefined ? (reserva.confirmada ? '✅ Confirmada' : '❌ No confirmada') : ''}
              ${reserva.nombre_titular ? ` · Titular: ${reserva.nombre_titular}` : ''}
              ${reserva.codigo_reserva ? ` · Código: ${reserva.codigo_reserva}` : ''}
              ${reserva.plataforma ? ` · ${reserva.plataforma}` : ''}
              ${reserva.costo ? ` · 💰 ${reserva.costo.valor} ${reserva.costo.moneda}` : ''}
            </span>
          </div>
        ` : ''}

        ${actividades.length > 0 ? `
          <div class="nodo-detail-row nodo-detail-actividades">
            <span class="material-symbols-outlined">tour</span>
            <span>
              <strong>Actividades:</strong>
              <ul class="nodo-detail-list">
                ${actividades.map(act => `
                  <li>
                    ${act.nombre || act.id}
                    ${act.tipo ? ` (${act.tipo})` : ''}
                    ${act.duracion_estimada ? ` · ⏱️ ${act.duracion_estimada}` : ''}
                    ${act.horario_recomendado ? ` · 🕐 ${act.horario_recomendado}` : ''}
                    ${act.notas ? ` · ${act.notas}` : ''}
                  </li>
                `).join('')}
              </ul>
            </span>
          </div>
        ` : ''}

        ${equipaje.length > 0 ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">luggage</span>
            <span>
              <strong>Equipaje recomendado:</strong>
              ${equipaje.map(item => `🧳 ${item}`).join(' · ')}
            </span>
          </div>
        ` : ''}

        ${tiempoVisita ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">hourglass_top</span>
            <span><strong>Tiempo estimado:</strong> ${tiempoVisita}</span>
          </div>
        ` : ''}

        ${idioma ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">translate</span>
            <span><strong>Idioma:</strong> ${idioma}</span>
          </div>
        ` : ''}

        ${moneda.codigo ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">payments</span>
            <span><strong>Moneda:</strong> ${moneda.codigo} ${moneda.simbolo || ''} ${moneda.tasa_referencia ? `(≈ ${moneda.tasa_referencia})` : ''}</span>
          </div>
        ` : ''}

        ${reglas.length > 0 ? `
          <div class="nodo-detail-row">
            <span class="material-symbols-outlined">gavel</span>
            <span>
              <strong>Reglas:</strong>
              <ul class="nodo-detail-list">
                ${reglas.map(regla => `<li>${regla}</li>`).join('')}
              </ul>
            </span>
          </div>
        ` : ''}

        ${notas ? `
          <div class="nodo-detail-row nodo-detail-notas">
            <span class="material-symbols-outlined">note</span>
            <span><strong>Notas:</strong> ${notas}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function buildAristaCardHTML(arista, origen, destino) {
  const iconName = getAristaIcon(arista.modo);
  const modoLabel = getAristaModoLabel(arista.modo);
  const origenNombre = origen ? origen.nombre || origen.id : arista.origen_id;
  const destinoNombre = destino ? destino.nombre || destino.id : arista.destino_id;
  const fecha = arista.logistica_salida?.fecha_salida || '';
  const horaSalida = arista.logistica_salida?.hora_salida_origen || '';
  const horaLlegada = arista.logistica_salida?.hora_llegada_destino || '';
  const transporte = arista.transporte || {};
  const tiempo = arista.tiempo_estimado || {};
  const costos = arista.costos || {};
  const notas = arista.notas || '';
  const reglasHolgura = arista.reglas_holgura || null;

  return `
    <div class="arista-card" data-id="${arista.id}">
      <div class="arista-card-header">
        <span class="arista-card-icon material-symbols-outlined">${iconName}</span>
        <div class="arista-card-content">
          <div class="arista-card-title">
            ${modoLabel}: ${origenNombre} → ${destinoNombre}
          </div>
          <div class="arista-card-subtitle">
            ${fecha ? ` · ${formatDate(fecha)}` : ''}
            ${horaSalida ? ` · Salida ${horaSalida}` : ''}
            ${horaLlegada ? ` → Llegada ${horaLlegada}` : ''}
            ${tiempo.minutos ? ` · ⏱️ ${tiempo.minutos} min` : ''}
          </div>
        </div>
        <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
      </div>

      <div class="arista-card-expanded">
        ${transporte.compania || transporte.tipo_vehiculo || transporte.numero_vuelo || transporte.linea ? `
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">directions_car</span>
            <span>
              ${transporte.compania ? `${transporte.compania}` : ''}
              ${transporte.tipo_vehiculo ? ` · ${transporte.tipo_vehiculo}` : ''}
              ${transporte.numero_vuelo ? ` · ✈️ ${transporte.numero_vuelo}` : ''}
              ${transporte.linea ? ` · 🚆 ${transporte.linea}` : ''}
            </span>
          </div>
        ` : ''}

        ${transporte.terminal_origen || transporte.terminal_destino ? `
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">terminal</span>
            <span>
              ${transporte.terminal_origen ? `Terminal origen: ${transporte.terminal_origen}` : ''}
              ${transporte.terminal_destino ? ` · Terminal destino: ${transporte.terminal_destino}` : ''}
            </span>
          </div>
        ` : ''}

        ${transporte.codigo_reserva_confirmacion ? `
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">confirmation_number</span>
            <span><strong>Código de reserva:</strong> ${transporte.codigo_reserva_confirmacion}</span>
          </div>
        ` : ''}

        ${fecha || horaSalida || horaLlegada ? `
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">schedule</span>
            <span>
              ${fecha ? `<strong>Fecha:</strong> ${formatDate(fecha)}` : ''}
              ${horaSalida ? ` · <strong>Salida:</strong> ${horaSalida}` : ''}
              ${horaLlegada ? ` · <strong>Llegada:</strong> ${horaLlegada}` : ''}
            </span>
          </div>
        ` : ''}

        ${tiempo.minutos || tiempo.rango ? `
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">hourglass_bottom</span>
            <span>
              <strong>Tiempo estimado:</strong> 
              ${tiempo.minutos ? `${tiempo.minutos} min` : ''}
              ${tiempo.rango ? ` (${tiempo.rango})` : ''}
              ${tiempo.con_holgura ? ` · Con holgura: ${tiempo.con_holgura} min` : ''}
            </span>
          </div>
        ` : ''}

        ${reglasHolgura ? `
          <div class="arista-detail-row arista-detail-holgura">
            <span class="material-symbols-outlined">warning</span>
            <span>
              <strong>${reglasHolgura.tiempo_requerido || ''}</strong>
              ${reglasHolgura.motivo ? ` · ${reglasHolgura.motivo}` : ''}
            </span>
          </div>
        ` : ''}

        ${costos.valor || costos.moneda ? `
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">payments</span>
            <span>
              <strong>Costo:</strong> ${costos.valor || ''} ${costos.moneda || ''}
              ${costos.pagado_por ? ` · Pagado por: ${costos.pagado_por}` : ''}
              ${costos.incluido_en ? ` · Incluido en: ${costos.incluido_en}` : ''}
            </span>
          </div>
        ` : ''}

        ${transporte.detalles ? `
          <div class="arista-detail-row">
            <span class="material-symbols-outlined">info</span>
            <span>${transporte.detalles}</span>
          </div>
        ` : ''}

        ${notas ? `
          <div class="arista-detail-row arista-detail-notas">
            <span class="material-symbols-outlined">note</span>
            <span><strong>Notas:</strong> ${notas}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function toggleCard(card) {
  const expanded = card.querySelector('.nodo-card-expanded, .arista-card-expanded');
  const toggleIcon = card.querySelector('.nodo-card-toggle, .arista-card-toggle');
  
  if (!expanded || !toggleIcon) return;

  // Cerrar cualquier otra card abierta
  const allCards = document.querySelectorAll('.nodo-card.expanded, .arista-card.expanded');
  allCards.forEach(otherCard => {
    if (otherCard !== card) {
      const otherExpanded = otherCard.querySelector('.nodo-card-expanded, .arista-card-expanded');
      const otherToggle = otherCard.querySelector('.nodo-card-toggle, .arista-card-toggle');
      if (otherExpanded && otherToggle) {
        otherExpanded.style.maxHeight = '0';
        otherExpanded.style.opacity = '0';
        otherToggle.textContent = 'expand_more';
        otherCard.classList.remove('expanded');
      }
    }
  });
  
  if (card.classList.contains('expanded')) {
    // Contraer
    expanded.style.maxHeight = '0';
    expanded.style.opacity = '0';
    toggleIcon.textContent = 'expand_more';
    card.classList.remove('expanded');
  } else {
    // Expandir
    expanded.style.maxHeight = expanded.scrollHeight + 'px';
    expanded.style.opacity = '1';
    toggleIcon.textContent = 'expand_less';
    card.classList.add('expanded');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(parts[2])} ${meses[parseInt(parts[1]) - 1]} ${parts[0]}`;
}

function getNodeIcon(tipo) {
  const iconMap = {
    'aeropuerto': 'flight_takeoff',
    'hotel': 'bed',
    'casa_origen': 'home',
    'casa_amigo': 'diversity_2',
    'atraccion': 'theater_comedy',
    'festival': 'music_note',
    'oficina_alquiler': 'business_center'
  };
  return iconMap[tipo] || 'location_on';
}

function getNodeTipoLabel(tipo) {
  const labelMap = {
    'aeropuerto': 'Aeropuerto',
    'hotel': 'Hotel',
    'casa_origen': 'Inicio',
    'casa_amigo': 'Casa de amigo',
    'atraccion': 'Atracción',
    'festival': 'Festival',
    'oficina_alquiler': 'Alquiler de auto'
  };
  return labelMap[tipo] || tipo;
}

function getAristaIcon(modo) {
  const iconMap = {
    'avion': 'flight',
    'tren': 'train',
    'metro': 'subway',
    'bus': 'directions_bus',
    'auto': 'directions_car',
    'caminata': 'directions_walk',
    'taxi': 'taxi',
    'transbordador': 'ferry'
  };
  return iconMap[modo] || 'arrow_forward';
}

function getAristaModoLabel(modo) {
  const labelMap = {
    'avion': 'Avión',
    'tren': 'Tren',
    'metro': 'Metro',
    'bus': 'Bus',
    'auto': 'Auto',
    'caminata': 'Caminata',
    'taxi': 'Taxi',
    'transbordador': 'Transbordador'
  };
  return labelMap[modo] || 'Desplazamiento';
}

displayItinerary();