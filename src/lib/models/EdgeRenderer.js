import { getEdgeIcon } from '../utils/iconUtils.js';
import { getEdgeLabel } from '../utils/labelUtils.js';
import { formatDate } from '../utils/dateUtils.js';

export class EdgeRenderer {
  constructor(nodosMap) {
    this.nodosMap = nodosMap;
    this.icons = getEdgeIcon;
    this.labels = getEdgeLabel;
    this.formatDate = formatDate;
  }

  render(arista) {
    const origen = this.nodosMap.get(arista.origen_id);
    const destino = this.nodosMap.get(arista.destino_id);
    const iconName = this.icons(arista.modo);
    const modoLabel = this.labels(arista.modo);
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
              <span class="arista-modo">${modoLabel}</span>
              <span class="arista-fecha">${fecha ? `${this.formatDate(fecha)} ${horaSalida}` : ''}</span>
              <span class="arista-duracion">${tiempo.minutos ? `${tiempo.minutos} min` : ''}</span>
            </div>
          </div>
          <span class="arista-card-toggle material-symbols-outlined">expand_more</span>
        </div>

        <div class="arista-card-expanded">
          ${this._renderTrayecto(origenNombre, destinoNombre)}
          ${this._renderTransporte(transporte)}
          ${this._renderTerminales(transporte)}
          ${this._renderCodigoReserva(transporte)}
          ${this._renderFechas(fecha, horaSalida, horaLlegada)}
          ${this._renderTiempo(tiempo)}
          ${this._renderHolgura(reglasHolgura)}
          ${this._renderCostos(costos)}
          ${this._renderDetalles(transporte)}
          ${this._renderNotas(notas)}
        </div>
      </div>
    `;
  }

  _renderTrayecto(origen, destino) {
    return `
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">route</span>
        <span><strong>Trayecto:</strong> ${origen} → ${destino}</span>
      </div>
    `;
  }

  _renderTransporte(transporte) {
    if (!transporte.compania && !transporte.tipo_vehiculo && !transporte.numero_vuelo && !transporte.linea) return '';
    return `
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">directions_car</span>
        <span>
          ${transporte.compania ? `${transporte.compania}` : ''}
          ${transporte.tipo_vehiculo ? ` · ${transporte.tipo_vehiculo}` : ''}
          ${transporte.numero_vuelo ? ` · ✈️ ${transporte.numero_vuelo}` : ''}
          ${transporte.linea ? ` · 🚆 ${transporte.linea}` : ''}
        </span>
      </div>
    `;
  }

  _renderTerminales(transporte) {
    if (!transporte.terminal_origen && !transporte.terminal_destino) return '';
    return `
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">terminal</span>
        <span>
          ${transporte.terminal_origen ? `Terminal origen: ${transporte.terminal_origen}` : ''}
          ${transporte.terminal_destino ? ` · Terminal destino: ${transporte.terminal_destino}` : ''}
        </span>
      </div>
    `;
  }

  _renderCodigoReserva(transporte) {
    if (!transporte.codigo_reserva_confirmacion) return '';
    return `
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">confirmation_number</span>
        <span><strong>Código de reserva:</strong> ${transporte.codigo_reserva_confirmacion}</span>
      </div>
    `;
  }

  _renderFechas(fecha, horaSalida, horaLlegada) {
    if (!fecha && !horaSalida && !horaLlegada) return '';
    return `
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">schedule</span>
        <span>
          ${fecha ? `<strong>Fecha:</strong> ${this.formatDate(fecha)}` : ''}
          ${horaSalida ? ` · <strong>Salida:</strong> ${horaSalida}` : ''}
          ${horaLlegada ? ` · <strong>Llegada:</strong> ${horaLlegada}` : ''}
        </span>
      </div>
    `;
  }

  _renderTiempo(tiempo) {
    if (!tiempo.minutos && !tiempo.rango) return '';
    return `
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">hourglass_bottom</span>
        <span>
          <strong>Tiempo estimado:</strong> 
          ${tiempo.minutos ? `${tiempo.minutos} min` : ''}
          ${tiempo.rango ? ` (${tiempo.rango})` : ''}
          ${tiempo.con_holgura ? ` · Con holgura: ${tiempo.con_holgura} min` : ''}
        </span>
      </div>
    `;
  }

  _renderHolgura(reglasHolgura) {
    if (!reglasHolgura) return '';
    return `
      <div class="arista-detail-row arista-detail-holgura">
        <span class="material-symbols-outlined">warning</span>
        <span>
          <strong>${reglasHolgura.tiempo_requerido || ''}</strong>
          ${reglasHolgura.motivo ? ` · ${reglasHolgura.motivo}` : ''}
        </span>
      </div>
    `;
  }

  _renderCostos(costos) {
    if (!costos.valor && !costos.moneda) return '';
    return `
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">payments</span>
        <span>
          <strong>Costo:</strong> ${costos.valor || ''} ${costos.moneda || ''}
          ${costos.pagado_por ? ` · Pagado por: ${costos.pagado_por}` : ''}
          ${costos.incluido_en ? ` · Incluido en: ${costos.incluido_en}` : ''}
        </span>
      </div>
    `;
  }

  _renderDetalles(transporte) {
    if (!transporte.detalles) return '';
    return `
      <div class="arista-detail-row">
        <span class="material-symbols-outlined">info</span>
        <span>${transporte.detalles}</span>
      </div>
    `;
  }

  _renderNotas(notas) {
    if (!notas) return '';
    return `
      <div class="arista-detail-row arista-detail-notas">
        <span class="material-symbols-outlined">note</span>
        <span><strong>Notas:</strong> ${notas}</span>
      </div>
    `;
  }
}