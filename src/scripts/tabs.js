// Gestión de pestañas (Home / Finanzas / Ajustes)
(function() {
  const homeContent = document.getElementById('home-content');
  const financeContent = document.getElementById('finance-content');
  const settingsContent = document.getElementById('settings-content');
  const tabButtons = document.querySelectorAll('[data-tab]');

  // Función para cargar finanzas solo la primera vez
  let financeLoaded = false;

  function loadFinanceTab() {
    if (!financeLoaded) {
      // Importar dinámicamente la función loadFinance desde finance.js
      import('./finance.js').then(module => {
        if (module.loadFinance) {
          module.loadFinance();
          financeLoaded = true;
        }
      }).catch(err => {
        console.error('Error al cargar el módulo de finanzas:', err);
      });
    }
  }

  function showTab(tab) {
    // Ocultar/mostrar contenido
    homeContent.style.display = 'none';
    financeContent.style.display = 'none';
    settingsContent.style.display = 'none';

    if (tab === 'home') {
      homeContent.style.display = 'block';
    } else if (tab === 'finance') {
      financeContent.style.display = 'block';
      // Cargar finanzas al mostrar la pestaña
      loadFinanceTab();
    } else if (tab === 'settings') {
      settingsContent.style.display = 'block';
    } else {
      return;
    }
    
    // Actualizar clases activas en los botones
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Guardar preferencia
    try {
      localStorage.setItem('activeTab', tab);
    } catch (e) {
      // Ignorar errores de localStorage
    }
  }

  // Restaurar pestaña guardada
  let savedTab = null;
  try {
    savedTab = localStorage.getItem('activeTab');
  } catch (e) {
    // Ignorar
  }
  if (savedTab && (savedTab === 'home' || savedTab === 'finance' || savedTab === 'settings')) {
    showTab(savedTab);
  } else {
    showTab('home'); // por defecto
  }

  // Escuchar clics en los botones
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const tab = this.dataset.tab;
      if (tab) {
        showTab(tab);
      }
    });
  });
})();