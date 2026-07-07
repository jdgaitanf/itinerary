export async function loadViajeData() {
  try {
    // Cargar el archivo raíz
    const rootResponse = await fetch('/data/viaje-raiz.json');
    if (!rootResponse.ok) {
      throw new Error('No se pudo cargar viaje-raiz.json');
    }
    const rootData = await rootResponse.json();

    // Cargar todos los nodos
    const nodos = await Promise.all(
      rootData.referencias.nodos.map(async (path) => {
        const response = await fetch(`/data/${path}`);
        if (!response.ok) {
          console.warn(`No se pudo cargar el nodo: ${path}`);
          return null;
        }
        return response.json();
      })
    );

    // Cargar todas las aristas
    const aristas = await Promise.all(
      rootData.referencias.aristas.map(async (path) => {
        const response = await fetch(`/data/${path}`);
        if (!response.ok) {
          console.warn(`No se pudo cargar la arista: ${path}`);
          return null;
        }
        return response.json();
      })
    );

    // Filtrar elementos nulos (por si algún archivo no se cargó)
    const nodosValidos = nodos.filter(n => n !== null);
    const aristasValidas = aristas.filter(a => a !== null);

    return {
      version: rootData.version,
      nombre_viaje: rootData.nombre_viaje,
      fechas: rootData.fechas,
      nodos: nodosValidos,
      aristas: aristasValidas
    };
  } catch (error) {
    console.error('Error cargando datos del viaje:', error);
    return null;
  }
}