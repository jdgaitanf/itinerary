import { getNodeIcon } from '../utils/iconUtils.js';
import { getNodeLabel } from '../utils/labelUtils.js';
import { formatDate } from '../utils/dateUtils.js';

export class NodeRenderer {
  constructor() {
    this.icons = getNodeIcon;
    this.labels = getNodeLabel;
    this.formatDate = formatDate;
  }

  render(nodo, visitaIndex = 0, fecha = '') {
    const iconName = this.icons(nodo.tipo);
    const tipoLabel = this.labels(nodo.tipo);
    
    const visita = nodo.visitas && nodo.visitas.length > 0 
      ? nodo.visitas[Math.min(visitaIndex, nodo.visitas.length - 1)] 
      : null;
    
    // Usar la fecha proporcionada o la de la visita como fallback
    const fechaMostrar = fecha || visita?.entrada || '';
    const fechaSalida = visita?.salida || '';
    const ciudad = nodo.direccion?.ciudad || '';
    const pais = nodo.direccion?.pais || '';
    const mapsLink = nodo.direccion?.maps_link || '';
    const contacto = nodo.contacto || {};
    const horarios = nodo.horarios || {};
    const clima = visita?.clima || null;
    const reserva = visita?.reserva || null;
    const notas = visita?.notas || null;
    const actividades = nodo.actividades || [];
    const equipaje = nodo.equipaje_recomendado || [];
    const moneda = nodo.moneda_local || {};
    const idioma = nodo.idioma_principal || '';
    const tiempoVisita = nodo.tiempo_estimado_visita || '';
    const reglas = nodo.reglas_especiales || [];

    return `
      <div class="nodo-card" data-id="${nodo.id}" data-visita="${visitaIndex}">
        <div class="nodo-card-header">
          <span class="nodo-card-icon material-symbols-outlined">${iconName}</span>
          <div class="nodo-card-content">
            <div class="nodo-card-title">${nodo.nombre || nodo.id}</div>
            <div class="nodo-card-subtitle">
              <span class="nodo-card-badge ${nodo.tipo}">${tipoLabel}</span>
              ${ciudad ? ` · ${ciudad}` : ''}
              ${pais ? `, ${pais}` : ''}
              ${fechaMostrar ? ` · ${this.formatDate(fechaMostrar)}` : ''}
            </div>
          </div>
          <span class="nodo-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="nodo-card-expanded">
          ${this._renderFecha(fechaMostrar, fechaSalida)}
          ${this._renderUbicacion(ciudad, pais, mapsLink)}
          ${this._renderContacto(contacto)}
          ${this._renderHorarios(horarios)}
          ${this._renderClima(clima)}
          ${this._renderReserva(reserva)}
          ${this._renderActividades(actividades)}
          ${this._renderEquipaje(equipaje)}
          ${this._renderTiempoVisita(tiempoVisita)}
          ${this._renderIdioma(idioma)}
          ${this._renderMoneda(moneda)}
          ${this._renderReglas(reglas)}
          ${this._renderNotas(notas)}
        </div>
      </div>
    `;
  }

  _renderFecha(entrada, salida) {
    if (!entrada) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">calendar_today</span>
        <span><strong>Entrada:</strong> ${this.formatDate(entrada)}${salida && salida !== entrada ? ` · <strong>Salida:</strong> ${this.formatDate(salida)}` : ''}</span>
      </div>
    `;
  }

  _renderUbicacion(ciudad, pais, mapsLink) {
    if (!ciudad && !pais) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">location_on</span>
        <span>${ciudad}${ciudad && pais ? ', ' : ''}${pais}${mapsLink ? ` <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">Ver en mapa</a>` : ''}</span>
      </div>
    `;
  }

  _renderContacto(contacto) {
    if (!contacto.telefono && !contacto.email && !contacto.web) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">contact_support</span>
        <span>
          ${contacto.telefono ? `📞 ${contacto.telefono}` : ''}
          ${contacto.email ? ` · ✉️ ${contacto.email}` : ''}
          ${contacto.web ? ` · 🌐 <a href="${contacto.web}" target="_blank" rel="noopener noreferrer" class="nodo-detail-link">${contacto.web}</a>` : ''}
        </span>
      </div>
    `;
  }

  _renderHorarios(horarios) {
    if (!horarios.check_in && !horarios.check_out && !horarios.horario_apertura && !horarios.horario_cierre && !horarios.atencion) return '';
    return `
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
    `;
  }

  _renderClima(clima) {
    if (!clima) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">partly_cloudy_day</span>
        <span>
          ${clima.temperatura_promedio || ''}
          ${clima.condiciones || ''}
          ${clima.probabilidad_lluvia ? ` · Lluvia: ${clima.probabilidad_lluvia}` : ''}
          ${clima.recomendacion_vestimenta ? ` · 👕 ${clima.recomendacion_vestimenta}` : ''}
        </span>
      </div>
    `;
  }

  _renderReserva(reserva) {
    if (!reserva) return '';
    return `
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
    `;
  }

  _renderActividades(actividades) {
    if (actividades.length === 0) return '';
    return `
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
    `;
  }

  _renderEquipaje(equipaje) {
    if (equipaje.length === 0) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">luggage</span>
        <span>
          <strong>Equipaje recomendado:</strong>
          ${equipaje.map(item => `🧳 ${item}`).join(' · ')}
        </span>
      </div>
    `;
  }

  _renderTiempoVisita(tiempoVisita) {
    if (!tiempoVisita) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">hourglass_top</span>
        <span><strong>Tiempo estimado:</strong> ${tiempoVisita}</span>
      </div>
    `;
  }

  _renderIdioma(idioma) {
    if (!idioma) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">translate</span>
        <span><strong>Idioma:</strong> ${idioma}</span>
      </div>
    `;
  }

  _renderMoneda(moneda) {
    if (!moneda.codigo) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">payments</span>
        <span><strong>Moneda:</strong> ${moneda.codigo} ${moneda.simbolo || ''} ${moneda.tasa_referencia ? `(≈ ${moneda.tasa_referencia})` : ''}</span>
      </div>
    `;
  }

  _renderReglas(reglas) {
    if (reglas.length === 0) return '';
    return `
      <div class="nodo-detail-row">
        <span class="material-symbols-outlined">gavel</span>
        <span>
          <strong>Reglas:</strong>
          <ul class="nodo-detail-list">
            ${reglas.map(regla => `<li>${regla}</li>`).join('')}
          </ul>
        </span>
      </div>
    `;
  }

  _renderNotas(notas) {
    if (!notas) return '';
    return `
      <div class="nodo-detail-row nodo-detail-notas">
        <span class="material-symbols-outlined">note</span>
        <span><strong>Notas:</strong> ${notas}</span>
      </div>
    `;
  }
}