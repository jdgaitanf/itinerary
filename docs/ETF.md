El **propósito** del proyecto es una aplicación web de consulta de itinerarios de viaje, diseñada para ser usada por grupos de viajeros en dispositivos móviles. Actúa como un "asistente personal" que organiza y presenta de forma clara y cronológica todas las actividades, desplazamientos y alojamientos de un viaje, permitiendo a los usuarios consultar su plan de manera rápida y comprensible, incluso sin conexión a internet.

---

### Comportamiento Detallado de la Aplicación

La aplicación se concibe como una herramienta **mobile-first** que funciona como una guía de viaje personal. Su interfaz se organiza en tres pestañas principales, accesibles desde una barra de navegación inferior fija.

#### 1. Pestaña de Itinerario (Vista Principal)

Esta es la vista por defecto. El usuario ve su viaje representado como una **línea de tiempo vertical**, donde cada día del viaje es una tarjeta desplegable que contiene todos los eventos programados para esa fecha.

- **Estructura de un Día:** Cada tarjeta de día muestra la fecha, la ciudad principal y un resumen del clima. El usuario puede tocar el encabezado de la tarjeta para expandir o colapsar su contenido.
- **Eventos:** Dentro de una tarjeta de día, los eventos (visitas a hoteles, aeropuertos, festivales, desplazamientos, etc.) se muestran en orden cronológico. Cada evento se identifica visualmente con un **ícono** y un **número de orden** que indica su posición en el viaje completo.
- **Expansión de Eventos:** Al tocar cualquier evento, este se **expande en su lugar** dentro de la tarjeta del día, mostrando toda la información detallada (horarios, direcciones, códigos de reserva, costos) sin usar ventanas modales que interrumpan la navegación. El evento se puede contraer fácilmente.
- **Navegación y Carga Progresiva:** La aplicación utiliza **carga progresiva** (scroll infinito). Solo se cargan los primeros días al abrir la app; a medida que el usuario se desplaza hacia abajo, se cargan más días de forma automática y fluida, lo que garantiza un rendimiento rápido incluso en itinerarios largos.
- **Mapas:** Cada evento con dirección física muestra un enlace que abre **Google Maps** en el navegador o en la aplicación nativa, evitando la complejidad de un mapa integrado.

#### 2. Pestaña de Finanzas

Esta sección proporciona un **resumen ejecutivo** de la situación financiera del viaje, esencial para viajes en grupo.

- **Resumen Visual:** Muestra de forma clara el presupuesto total, el gasto acumulado y el saldo restante. Una barra de progreso indica el porcentaje del presupuesto gastado, cambiando de color (verde a rojo) como advertencia visual.
- **Selector de Moneda:** Un selector permite al usuario cambiar la moneda en la que se visualizan todos los montos (COP, EUR, USD, CHF), con conversión automática.
- **Desglose:** La vista ofrece un desglose de gastos **por categoría** (Transporte, Alojamiento, etc.) y, crucialmente, **por persona**, mostrando cuánto ha pagado cada viajero y qué gastos están pendientes. Esta funcionalidad está diseñada específicamente para la gestión de gastos compartidos.
- **Lista Detallada:** Un botón permite desplegar una lista detallada de todos los gastos individuales, donde cada gasto también se puede expandir para ver más detalles.

#### 3. Pestaña de Ajustes

Esta sección centraliza la configuración y la información del viaje.

- **Tema Oscuro/Claro:** Permite al usuario alternar entre ambos temas visuales, y la preferencia se guarda.
- **Información y Control:** Muestra la información del viaje (nombre, fechas, versión), el estado de la caché de datos y estadísticas generales (número de días, eventos, gastos).
- **Acciones:** Ofrece acciones para recargar los datos, reiniciar el estado de la interfaz (ej. colapsar todas las expansiones) o forzar una recarga completa desde los archivos fuente.

---

### Comportamiento General y "Poderes" de la App

- **Experiencia de Usuario Sin Fricción:** La aplicación evita modales y ventanas emergentes para mantener al usuario siempre en el contexto de su itinerario. Las acciones principales (expandir/colapsar) son suaves y animadas, y la posición de scroll en cada pestaña se **guarda automáticamente**.
- **Persistencia de Estado:** La app **recuerda** el tema elegido, la moneda seleccionada, la posición de scroll en cada vista y qué eventos están expandidos, utilizando el almacenamiento local del navegador. Esto permite al usuario cerrar y volver a abrir la aplicación sin perder su lugar.
- **Datos Estáticos y Offline:** La aplicación está diseñada para ser completamente **estática y funcional sin conexión a internet**. Todos los datos del viaje se cargan desde archivos JSON locales y se gestionan mediante una **caché en el navegador** (localStorage). Esto asegura que el itinerario esté siempre disponible, incluso en zonas sin cobertura.
- **Optimizado para Móviles:** La interfaz está pensada para ser usada con una sola mano. Los elementos son grandes y fáciles de tocar, la barra de navegación es fija, y el diseño se adapta a la pantalla.

### Aspectos Técnicos Clave

- **Arquitectura:** Es una **Single Page Application (SPA)** construida con **Astro** como framework de generación de sitios estáticos, pero con un alto nivel de interactividad en el cliente.
- **Interactividad:** La lógica de la interfaz, el estado y la persistencia se manejan con **Alpine.js** y sus plugins (`persist`, `collapse`). Esto permite una reactividad ligera y fácil de implementar.
- **Estrategia Offline:** Los datos se cargan desde archivos **JSON** y se almacenan en **localStorage**. La aplicación está diseñada para funcionar completamente en el lado del cliente.
- **Carga Progresiva:** La carga de días en el itinerario se gestiona mediante un **IntersectionObserver** en JavaScript, que detecta cuándo el usuario se acerca al final de la lista y activa la carga de más datos.
- **Rendimiento:** La aplicación es minimalista, utiliza la librería **Material Symbols** desde un CDN para los íconos y no carga bibliotecas pesadas. Su arquitectura está optimizada para conexiones variables y dispositivos con recursos limitados.
