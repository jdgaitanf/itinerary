// Gestión de pestañas (Home / Ajustes)
(function() {
  const homeContent = document.getElementById('home-content');
  const settingsContent = document.getElementById('settings-content');
  const tabButtons = document.querySelectorAll('[data-tab]');

  function showTab(tab) {
    if (tab === 'home') {
      homeContent.style.display = 'block';
      settingsContent.style.display = 'none';
    } else if (tab === 'settings') {
      homeContent.style.display = 'none';
      settingsContent.style.display = 'block';
    } else {
      return;
    }
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
  if (savedTab && (savedTab === 'home' || savedTab === 'settings')) {
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