const NODE_ICON_MAP = {
  'aeropuerto': 'flight_takeoff',
  'hotel': 'bed',
  'casa_origen': 'home',
  'casa_amigo': 'diversity_2',
  'atraccion': 'theater_comedy',
  'festival': 'music_note',
  'oficina_alquiler': 'business_center'
};

const EDGE_ICON_MAP = {
  'avion': 'flight',
  'tren': 'train',
  'metro': 'subway',
  'bus': 'directions_bus',
  'auto': 'directions_car',
  'caminata': 'directions_walk',
  'taxi': 'taxi',
  'transbordador': 'ferry'
};

export function getNodeIcon(tipo) {
  return NODE_ICON_MAP[tipo] || 'location_on';
}

export function getEdgeIcon(modo) {
  return EDGE_ICON_MAP[modo] || 'arrow_forward';
}