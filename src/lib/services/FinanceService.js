// src/lib/services/FinanceService.js

const RATES = {
  COP: 1,
  EUR: 4088.58,   // 3716.89 + 10%
  USD: 3573.76,   // 3248.87 + 10%
  CHF: 4425.25,   // 4022.95 + 10%
};

const CATEGORY_MAP = {
  hotel: 'Alojamiento',
  casa: 'Alojamiento',
  casa_amigo: 'Alojamiento',
  aeropuerto: 'Transporte',
  oficina_alquiler: 'Transporte',
  atraccion: 'Entradas',
  festival: 'Eventos',
};

const EDGE_CATEGORY_MAP = {
  avion: 'Transporte',
  tren: 'Transporte',
  metro: 'Transporte',
  bus: 'Transporte',
  auto: 'Transporte',
  caminata: 'Transporte',
  taxi: 'Transporte',
  transbordador: 'Transporte',
};

function getSourceFromPath(obj, path) {
  if (!obj || !obj.sources) return 'ai';
  const parts = path.split('.');
  let current = obj.sources;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return 'ai';
    }
  }
  return (typeof current === 'string') ? current : 'ai';
}

function getNodoSource(nodo, fieldPath) {
  return getSourceFromPath(nodo, fieldPath);
}

function getAristaSource(arista, fieldPath) {
  return getSourceFromPath(arista, fieldPath);
}

export class FinanceService {
  calculate(graph, targetCurrency = 'COP') {
    const expenses = [];
    let totalPresupuesto = 0;
    let totalGastado = 0;

    // Procesar nodos
    for (const nodo of graph.nodos) {
      if (nodo.visitas) {
        for (let vi = 0; vi < nodo.visitas.length; vi++) {
          const visita = nodo.visitas[vi];
          if (visita.reserva && visita.reserva.costo) {
            const costo = visita.reserva.costo;
            const source = getNodoSource(nodo, `visitas[${vi}].reserva.costo`);
            const desc = `${nodo.nombre || nodo.id} - Reserva`;
            const cat = CATEGORY_MAP[nodo.tipo] || 'Otros';
            expenses.push({
              descripcion: desc,
              categoria: cat,
              monto: costo.valor,
              moneda: costo.moneda || 'COP',
              pagado_por: costo.pagado_por || '',
              source: source,
              nodoId: nodo.id,
              tipo: 'nodo',
            });
          }
          if (visita.reserva && visita.reserva.costo) {
            // Ya agregado, pero si hay más costos en actividades?
          }
          if (visita.actividades) {
            for (let ai = 0; ai < visita.actividades.length; ai++) {
              const act = visita.actividades[ai];
              if (act.reserva && act.reserva.costo) {
                const costo = act.reserva.costo;
                const source = getNodoSource(nodo, `visitas[${vi}].actividades[${ai}].reserva.costo`);
                const desc = `${nodo.nombre || nodo.id} - ${act.nombre || 'Actividad'}`;
                const cat = CATEGORY_MAP[nodo.tipo] || 'Otros';
                expenses.push({
                  descripcion: desc,
                  categoria: cat,
                  monto: costo.valor,
                  moneda: costo.moneda || 'COP',
                  pagado_por: costo.pagado_por || '',
                  source: source,
                  nodoId: nodo.id,
                  tipo: 'actividad',
                });
              }
            }
          }
        }
      }
    }

    // Procesar aristas
    for (const arista of graph.aristas) {
      if (arista.costos && arista.costos.valor) {
        const costo = arista.costos;
        const source = getAristaSource(arista, 'costos');
        const nodoOrigen = graph.nodos.find(n => n.id === arista.origen_id);
        const nodoDestino = graph.nodos.find(n => n.id === arista.destino_id);
        const desc = `Traslado: ${nodoOrigen?.nombre || arista.origen_id} → ${nodoDestino?.nombre || arista.destino_id}`;
        const cat = EDGE_CATEGORY_MAP[arista.modo] || 'Transporte';
        expenses.push({
          descripcion: desc,
          categoria: cat,
          monto: costo.valor,
          moneda: costo.moneda || 'COP',
          pagado_por: costo.pagado_por || '',
          source: source,
          aristaId: arista.id,
          tipo: 'arista',
        });
      }
    }

    // Convertir todos los montos a la moneda objetivo y sumar
    const convertedExpenses = expenses.map(exp => {
      const rate = RATES[exp.moneda] || 1;
      const targetRate = RATES[targetCurrency] || 1;
      const converted = (exp.monto / rate) / targetRate;
      return { ...exp, montoConvertido: converted, monedaOriginal: exp.moneda };
    });

    // Calcular totales
    for (const exp of convertedExpenses) {
      totalPresupuesto += exp.montoConvertido;
      if (exp.pagado_por && exp.pagado_por.trim() !== '') {
        totalGastado += exp.montoConvertido;
      }
    }

    // Desglose por categoría
    const porCategoria = {};
    for (const exp of convertedExpenses) {
      const cat = exp.categoria;
      if (!porCategoria[cat]) porCategoria[cat] = 0;
      porCategoria[cat] += exp.montoConvertido;
    }

    // Desglose por persona (suma de lo pagado)
    const porPersona = {};
    for (const exp of convertedExpenses) {
      if (exp.pagado_por && exp.pagado_por.trim() !== '') {
        const persona = exp.pagado_por;
        if (!porPersona[persona]) porPersona[persona] = 0;
        porPersona[persona] += exp.montoConvertido;
      }
    }

    // Saldo
    const saldo = totalPresupuesto - totalGastado;

    return {
      totalPresupuesto,
      totalGastado,
      saldo,
      porCategoria,
      porPersona,
      gastos: convertedExpenses,
      moneda: targetCurrency,
    };
  }
}

export const financeService = new FinanceService();