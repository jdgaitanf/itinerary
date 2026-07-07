// Esta versión usa una estrategia diferente: intenta importar directamente los JSON
// y si falla, usa fetch
export async function loadViajeData() {
  try {
    // Intentar importar directamente el JSON raíz
    let rootData;
    try {
      // Usar fetch con URL absoluta en el servidor
      const response = await fetch('http://localhost:3000/data/viaje-raiz.json');
      if (!response.ok) throw new Error('Fetch failed');
      rootData = await response.json();
    } catch {
      // Si fetch falla, intentar importar directamente
      const module = await import('../data/viaje-raiz.json');
      rootData = module.default;
    }

    // Cargar todos los nodos usando el mismo método
    const nodos = await Promise.all(
      rootData.referencias.nodos.map(async (path) => {
        try {
          const response = await fetch(`http://localhost:3000/data/${path}`);
          if (!response.ok) throw new Error('Fetch failed');
          return response.json();
        } catch {
          const module = await import(`../data/${path}`);
          return module.default;
        }
      })
    );

    // Cargar todas las aristas
    const aristas = await Promise.all(
      rootData.referencias.aristas.map(async (path) => {
        try {
          const response = await fetch(`http://localhost:3000/data/${path}`);
          if (!response.ok) throw new Error('Fetch failed');
          return response.json();
        } catch {
          const module = await import(`../data/${path}`);
          return module.default;
        }
      })
    );

    // Filtrar elementos nulos
    const nodosValidos = nodos.filter(n => n !== null && n !== undefined);
    const aristasValidas = aristas.filter(a => a !== null && a !== undefined);

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