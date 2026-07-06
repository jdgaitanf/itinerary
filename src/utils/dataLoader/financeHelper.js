/**
 * Helper financiero para el DataLoader
 * Extrae y procesa información de costos
 */

export class FinanceHelper {
  /**
   * Determina el tipo de evento para categorización
   */
  static determinarTipoEvento(nodo) {
    const tipoMap = {
      'aeropuerto': 'vuelo',
      'hotel': 'hotel',
      'atraccion': 'actividad',
      'festival': 'festival',
      'oficina_alquiler': 'transporte',
      'casa_amigo': 'casa',
      'casa': 'casa',
      'casa-origen': 'casa',
    };
    return tipoMap[nodo.tipo] || 'actividad';
  }

  /**
   * Categoriza un gasto según el tipo de nodo
   */
  static categorizarGasto(nodo) {
    const mapa = {
      'aeropuerto': 'Transporte',
      'hotel': 'Alojamiento',
      'atraccion': 'Entretenimiento',
      'festival': 'Festival',
      'oficina_alquiler': 'Transporte',
      'casa_amigo': 'Alojamiento',
      'casa': 'Alojamiento',
      'casa-origen': 'Alojamiento',
    };
    return mapa[nodo.tipo] || 'Otros';
  }

  /**
   * Agrupa gastos por categoría
   */
  static agruparPorCategoria(gastos) {
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

  /**
   * Agrupa gastos por persona
   */
  static agruparPorPersona(gastos) {
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

  /**
   * Obtiene información financiera del viaje
   */
  static obtenerFinanzas(nodos, aristas, determinarTipoEventoFn) {
    const gastos = [];
    let totalPresupuesto = 0;
    let totalGastado = 0;
    let gastosPendientes = 0;

    nodos.forEach(nodo => {
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
            tipo: determinarTipoEventoFn(nodo),
            nombre: nodo.nombre,
            fecha: nodo.fechas_estadia?.entrada || 'N/A',
            monto: costo.valor,
            moneda: costo.moneda || 'COP',
            pagadoPor: costo.pagado_por || null,
            incluidoEn: costo.incluido_en || null,
            categoria: this.categorizarGasto(nodo),
          });
        }
      }

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
                categoria: this.categorizarGasto(nodo),
              });
            }
          }
        });
      }
    });

    aristas.forEach(arista => {
      if (arista.costos && arista.costos.valor) {
        const costo = arista.costos;
        totalPresupuesto += costo.valor;
        if (costo.pagado_por) {
          totalGastado += costo.valor;
        } else {
          gastosPendientes += costo.valor;
        }
        const nodoOrigen = nodos.get(arista.origen_id);
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
      gastosPorCategoria: this.agruparPorCategoria(gastos),
      gastosPorPersona: this.agruparPorPersona(gastos),
    };
  }
}