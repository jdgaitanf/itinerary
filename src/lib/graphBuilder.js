export async function buildGraph(rootData) {
  const nodos = [];
  const aristas = [];

  // Cargar todos los nodos
  for (const nodoPath of rootData.referencias.nodos) {
    try {
      const response = await fetch(`/data/${nodoPath}`);
      if (!response.ok) {
        console.error(`Error loading node: ${nodoPath}`);
        continue;
      }
      const nodo = await response.json();
      nodos.push(nodo);
    } catch (error) {
      console.error(`Error loading node ${nodoPath}:`, error);
    }
  }

  // Cargar todas las aristas
  for (const aristaPath of rootData.referencias.aristas) {
    try {
      const response = await fetch(`/data/${aristaPath}`);
      if (!response.ok) {
        console.error(`Error loading edge: ${aristaPath}`);
        continue;
      }
      const arista = await response.json();
      aristas.push(arista);
    } catch (error) {
      console.error(`Error loading edge ${aristaPath}:`, error);
    }
  }

  return {
    version: rootData.version,
    nombre_viaje: rootData.nombre_viaje,
    fechas: rootData.fechas,
    nodos: nodos,
    aristas: aristas
  };
}