// Gestión del tema oscuro/claro
(function() {
  const toggleCheckbox = document.getElementById('theme-toggle-checkbox');
  const htmlElement = document.documentElement;

  // Función para aplicar el tema
  function setTheme(isDark) {
    if (isDark) {
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
    }
    // Guardar preferencia
    try {
      localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    } catch (e) {
      // Ignorar errores de localStorage
    }
    // Actualizar el checkbox
    if (toggleCheckbox) {
      toggleCheckbox.checked = isDark;
    }
  }

  // Cargar preferencia guardada
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('darkMode');
  } catch (e) {
    // Ignorar
  }
  if (savedTheme !== null) {
    setTheme(savedTheme === 'true');
  } else {
    // Opcional: detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark);
  }

  // Evento de cambio del toggle
  if (toggleCheckbox) {
    toggleCheckbox.addEventListener('change', function() {
      setTheme(this.checked);
    });
  }
})();