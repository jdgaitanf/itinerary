// Funcionalidad de la pantalla de Ajustes
import { getViajeGraph, hasViajeGraph, setViajeGraph, setItineraryList } from '../lib/core/storage.js';
import { buildItinerary } from '../lib/core/itineraryBuilder.js';

(function () {
  const clearCacheBtn = document.getElementById('clear-cache-btn');
  const viajeVersionSpan = document.getElementById('viaje-version');
  const cacheStatusSpan = document.getElementById('cache-status');
  const nodosCountSpan = document.getElementById('nodos-count');
  const aristasCountSpan = document.getElementById('aristas-count');
  const graphFileInput = document.getElementById('graph-file-input');
  const loadGraphBtn = document.getElementById('load-graph-btn');
  const loadStatus = document.getElementById('load-status');
  const downloadDefBtn = document.getElementById('download-def-btn');
  const settingsAdvancedHeader = document.getElementById('settings-advanced-header');
  const settingsAdvancedContent = document.getElementById('settings-advanced-content');

  // Actualizar información de la caché y el grafo
  function updateSettingsInfo() {
    // Estado de la caché
    const hasCache = hasViajeGraph();
    if (hasCache) {
      cacheStatusSpan.textContent = 'Datos en caché';
    } else {
      cacheStatusSpan.textContent = 'Sin datos en caché';
    }

    // Información del grafo si existe
    const graph = getViajeGraph();
    if (graph) {
      viajeVersionSpan.textContent = graph.version || 'No definida';
      nodosCountSpan.textContent = graph.nodos ? graph.nodos.length : 0;
      aristasCountSpan.textContent = graph.aristas ? graph.aristas.length : 0;
    } else {
      viajeVersionSpan.textContent = 'No cargado';
      nodosCountSpan.textContent = '0';
      aristasCountSpan.textContent = '0';
    }
  }

  // Cargar grafo desde archivo JSON
  function loadGraphFromFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const graphData = JSON.parse(event.target.result);

        // Validar estructura mínima del grafo
        if (!graphData.nodos || !graphData.aristas) {
          loadStatus.textContent = 'Error: El archivo no contiene un grafo válido (faltan nodos o aristas)';
          loadStatus.style.color = 'red';
          return;
        }

        // Guardar en localStorage
        setViajeGraph(graphData);

        // Construir y guardar el itinerario
        try {
          const itinerary = buildItinerary(graphData);
          setItineraryList(itinerary);
        } catch (error) {
          console.error('Error al construir el itinerario:', error);
          loadStatus.textContent = 'Grafo guardado pero error al construir itinerario: ' + error.message;
          loadStatus.style.color = 'orange';
          updateSettingsInfo();
          return;
        }

        loadStatus.textContent = 'Grafo cargado y guardado correctamente. Recargando...';
        loadStatus.style.color = 'green';
        updateSettingsInfo();

        // Recargar después de 1.5 segundos para mostrar el mensaje
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        loadStatus.textContent = 'Error al leer el archivo JSON: ' + error.message;
        loadStatus.style.color = 'red';
        console.error('Error al cargar el archivo:', error);
      }
    };

    reader.onerror = function () {
      loadStatus.textContent = 'Error al leer el archivo';
      loadStatus.style.color = 'red';
    };

    reader.readAsText(file);
  }

  // Evento para cargar el grafo
  if (loadGraphBtn && graphFileInput) {
    loadGraphBtn.addEventListener('click', function () {
      const file = graphFileInput.files[0];
      if (!file) {
        loadStatus.textContent = 'Por favor selecciona un archivo JSON primero';
        loadStatus.style.color = 'orange';
        return;
      }
      loadStatus.textContent = 'Cargando...';
      loadStatus.style.color = 'blue';
      loadGraphFromFile(file);
    });

    // Limpiar mensaje al seleccionar otro archivo
    graphFileInput.addEventListener('change', function () {
      loadStatus.textContent = '';
    });
  }

  // Descargar definición del itinerario
  if (downloadDefBtn) {
    downloadDefBtn.addEventListener('click', function () {
      // Usar fetch para obtener el archivo desde la ruta relativa
      fetch('/itinerary/docs/ItineraryDef.md')
        .then(response => {
          if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
          }
          return response.text();
        })
        .then(content => {
          // Crear un blob con el contenido
          const blob = new Blob([content], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);

          // Crear un enlace temporal y simular clic para descargar
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ItineraryDef.md';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Liberar la URL
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 100);

          loadStatus.textContent = 'Definición descargada correctamente';
          loadStatus.style.color = 'green';
        })
        .catch(error => {
          console.error('Error al descargar el archivo:', error);
          loadStatus.textContent = 'Error al descargar la definición: ' + error.message;
          loadStatus.style.color = 'red';
        });
    });
  }

    // Toggle de Ajustes Avanzados
  if (settingsAdvancedHeader && settingsAdvancedContent) {
    settingsAdvancedHeader.addEventListener('click', function() {
      const isExpanded = settingsAdvancedContent.style.display !== 'none';
      if (isExpanded) {
        settingsAdvancedContent.style.display = 'none';
        settingsAdvancedHeader.classList.remove('expanded');
      } else {
        settingsAdvancedContent.style.display = 'block';
        settingsAdvancedHeader.classList.add('expanded');
      }
    });
  }

  // Actualizar al cargar la página
  updateSettingsInfo();

  // Botón para limpiar caché
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', function () {
      // Limpiar localStorage
      try {
        localStorage.clear();
        console.log('Caché eliminada correctamente');
      } catch (e) {
        console.error('Error al eliminar la caché:', e);
      }
      // Recargar la página para forzar la recarga de datos desde los archivos
      window.location.reload();
    });
  }
})();