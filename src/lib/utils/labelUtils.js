const NODE_LABEL_MAP = {
  'aeropuerto': 'Aeropuerto',
  'hotel': 'Hotel',
  'casa_origen': 'Inicio',
  'casa_amigo': 'Casa de amigo',
  'atraccion': 'Atracción',
  'festival': 'Festival',
  'oficina_alquiler': 'Alquiler de auto'
};

const EDGE_LABEL_MAP = {
  'avion': 'Avión',
  'tren': 'Tren',
  'metro': 'Metro',
  'bus': 'Bus',
  'auto': 'Auto',
  'caminata': 'Caminata',
  'taxi': 'Taxi',
  'transbordador': 'Transbordador'
};

export function getNodeLabel(tipo) {
  return NODE_LABEL_MAP[tipo] || tipo;
}

export function getEdgeLabel(modo) {
  return EDGE_LABEL_MAP[modo] || 'Desplazamiento';
}