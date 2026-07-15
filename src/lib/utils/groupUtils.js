export function agruparPorDias(itinerario) {
  const dias = {};
  for (const item of itinerario) {
    const fecha = item.fecha;
    if (!fecha) continue; // Saltar items sin fecha
    if (!dias[fecha]) {
      dias[fecha] = [];
    }
    dias[fecha].push(item);
  }
  return dias;
}