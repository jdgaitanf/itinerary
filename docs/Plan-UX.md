# Plan de UX - "Itinerary"
### Aplicación de Itinerario Personal (v1.0)

---

## 1. Filosofía de Diseño

La aplicación **"Itinerary"** está diseñada como una herramienta personal de consulta de itinerarios de viaje, optimizada para dispositivos móviles y alojada en GitHub Pages. Su filosofía se basa en la simplicidad, la claridad y la eficiencia, evitando cualquier complejidad innecesaria que pueda distraer al viajero de su objetivo principal: consultar su itinerario de manera rápida y comprensible.

**Principios rectores:**

La aplicación es minimalista y ligera, cargando solo el contenido necesario en cada momento. No se cargan recursos pesados ni bibliotecas innecesarias, priorizando el rendimiento en dispositivos móviles con conexiones variables.

El diseño es monocromático y elegante. Todos los íconos son monocromáticos y heredan el color del texto donde se colocan, manteniendo una apariencia limpia, profesional y coherente en todo momento. No se utilizan íconos coloridos que puedan saturar visualmente la interfaz.

La aplicación habla el lenguaje del viajero, no el lenguaje técnico del desarrollador. Los usuarios ven "días", "actividades", "desplazamientos" y "alojamientos". Nunca se mencionan términos como "nodos" o "aristas".

La aplicación está pensada para viajes en grupo de tres o más personas, con capacidad para distinguir quién pagó cada gasto y qué está pendiente. Esta distinción por persona es fundamental para la gestión financiera del viaje compartido.

La aplicación no incluye un mapa interactivo para evitar complejidad innecesaria. En su lugar, cada evento que tiene dirección física muestra un enlace que abre Google Maps en el navegador o en la aplicación nativa del dispositivo, proporcionando la funcionalidad de ubicación sin la sobrecarga de un mapa embebido.

---

## 2. Estructura de Navegación

La aplicación utiliza una barra de navegación inferior fija con tres pestañas principales. Esta barra permanece visible en todo momento mientras el usuario navega por la aplicación.

La primera pestaña, identificada con un ícono de calendario, muestra el itinerario completo. Es la vista principal y la que se carga por defecto al abrir la aplicación. Esta vista presenta todos los días del viaje en orden cronológico, permitiendo al usuario desplazarse verticalmente para explorar su viaje completo.

La segunda pestaña, identificada con un ícono de moneda, muestra un resumen financiero ejecutivo. Esta vista presenta de manera clara y concisa el estado de los gastos del viaje, con indicadores visuales que permiten entender rápidamente cuánto se ha gastado, cuánto queda disponible y cómo se distribuyen los gastos por categoría y por persona.

La tercera pestaña, identificada con un ícono de engranaje, muestra los ajustes y configuraciones de la aplicación. Aquí el usuario puede cambiar entre tema claro y oscuro, ver la moneda principal configurada, consultar información sobre los viajeros, revisar estadísticas de los datos cargados, obtener información sobre la aplicación y forzar la recarga de datos si es necesario.

La decisión de tener solo tres pestañas responde a la necesidad de simplificar la interfaz al máximo. El mapa interactivo fue descartado porque añade complejidad innecesaria: los enlaces directos a Google Maps cumplen la misma función de ubicación sin requerir una implementación compleja ni consumo adicional de recursos.

---

## 3. Sistema de Íconos

La aplicación utiliza la biblioteca **Material Symbols** de Google, servida desde un CDN, lo que elimina la necesidad de descargar y almacenar archivos de íconos en el proyecto. Esta biblioteca ofrece más de diez mil íconos monocromáticos que se cargan bajo demanda y se almacenan en caché del navegador.

Todos los íconos tienen un tamaño fijo de veinte píxeles y están alineados verticalmente al centro del texto que los acompaña. Su color es siempre el mismo que el color del texto donde se insertan, lo que garantiza consistencia visual tanto en modo claro como en modo oscuro sin necesidad de configuraciones adicionales.

Cada tipo de evento en el itinerario tiene un ícono específico que lo identifica visualmente. Los vuelos utilizan el ícono de un avión. Los hoteles utilizan el ícono de una cama. Las actividades turísticas utilizan el ícono de una máscara de teatro. Los festivales y conciertos utilizan el ícono de una nota musical. El transporte terrestre en automóvil utiliza el ícono de un coche. El tren utiliza el ícono de un tren. El metro utiliza el ícono de un vagón de metro. El autobús utiliza el ícono de un autobús. Las caminatas utilizan el ícono de una persona caminando. El taxi utiliza el ícono de un taxi. Las casas de amigos utilizan el ícono de una casa. Las oficinas de alquiler utilizan el ícono de un edificio corporativo. Los restaurantes utilizan el ícono de cubiertos. Los monumentos y lugares de interés utilizan el ícono de un edificio con columnas.

Esta asignación de íconos permite al usuario identificar rápidamente el tipo de evento sin necesidad de leer el texto completo, mejorando la escaneabilidad visual del itinerario.

---

## 4. Vista Principal: Itinerario

### Estructura General

La vista principal presenta el itinerario como una línea de tiempo vertical. Cada día del viaje se muestra como una tarjeta independiente que contiene todos los eventos programados para esa fecha. Las tarjetas se apilan verticalmente en orden cronológico, permitiendo al usuario desplazarse hacia abajo para ver días futuros y hacia arriba para regresar a días pasados.

La implementación utiliza carga progresiva. Al abrir la aplicación por primera vez, solo se cargan los primeros tres o cuatro días, que son los que caben en la pantalla del dispositivo. A medida que el usuario se desplaza hacia abajo y se acerca al final de los días ya cargados, la aplicación carga automáticamente los días siguientes sin interrumpir la experiencia del usuario. Este comportamiento asegura que la aplicación se sienta rápida y receptiva incluso en conexiones lentas.

### Tarjeta de Día

Cada tarjeta de día comienza con una cabecera que muestra la fecha en formato legible, por ejemplo "Día 1 · 17 de julio", y en el extremo derecho, un indicador visual que permite expandir o colapsar el contenido de la tarjeta. La cabecera también incluye un resumen del clima esperado para ese día, mostrando la temperatura en grados Celsius y una breve descripción de las condiciones climáticas, como "Soleado" o "Parcialmente nublado", junto con el nombre de la ciudad principal donde se encuentra el viajero ese día.

Por defecto, todas las tarjetas se muestran expandidas, revelando todos los eventos del día. Sin embargo, el usuario puede tocar la cabecera de cualquier día para colapsar su contenido, mostrando solo un resumen de los primeros tres eventos. Esta funcionalidad permite al usuario tener una visión general rápida del viaje y concentrarse en los días que le interesan.

### Eventos dentro de la Tarjeta

Dentro de cada tarjeta de día, los eventos se muestran en orden cronológico, según la hora de inicio de cada actividad o desplazamiento. Cada evento ocupa una línea separada y presenta la siguiente información en formato horizontal.

Primero, el ícono que identifica el tipo de evento. Inmediatamente después, el nombre del evento, que puede ser el nombre de un vuelo, un hotel, una atracción turística, etc. A continuación, la hora de inicio del evento, mostrada en formato de veinticuatro horas o de doce horas con AM/PM, según la configuración regional del navegador.

Si el evento requiere una nota especial, como un tiempo de holgura antes de un vuelo, esta nota aparece en una línea adicional con un formato visual que la distingue del texto principal, utilizando un color de advertencia y un ícono de alerta que llama la atención del usuario. Por ejemplo, para un vuelo a las ocho de la mañana que requiere llegar al aeropuerto tres horas antes, la tarjeta mostraría "⚠️ Salir del hotel a las 04:20" justo debajo del vuelo.

Para eventos que tienen una dirección física, como hoteles, aeropuertos o atracciones, la tarjeta muestra la ciudad y un enlace abreviado con el texto "📍 Ver en Google Maps". Al tocar este enlace, el dispositivo abre la aplicación de Google Maps si está instalada o el navegador web con la ubicación exacta del lugar, permitiendo al usuario obtener indicaciones de navegación sin salir completamente del contexto del itinerario.

La separación entre eventos dentro del mismo día es sutil, generalmente un espacio vertical pequeño y una línea divisoria muy tenue. La separación entre días es más pronunciada, creando una clara jerarquía visual que permite al usuario distinguir fácilmente dónde termina un día y comienza el siguiente.

---

## 5. Expansión de Detalle de Evento

### Principio Fundamental: Sin Modales

La aplicación **no utiliza modales ni ventanas emergentes** para mostrar detalles de eventos. En lugar de eso, cada evento puede expandirse en su lugar dentro del itinerario, mostrando información detallada directamente debajo de la fila del evento. Este enfoque preserva el contexto del usuario, evita interrupciones en la navegación y mantiene al usuario siempre dentro del flujo de scroll del itinerario.

### Comportamiento al Tocar un Evento

Cuando el usuario toca cualquier evento dentro de la tarjeta de día, el evento se **expande hacia abajo** mostrando información detallada en el mismo lugar. La expansión es suave y animada, con el contenido adicional deslizándose desde la parte inferior del evento.

Durante la expansión, ocurren varios cambios visuales:

El evento original cambia ligeramente de color de fondo para indicar que está activo, proporcionando una señal visual clara de qué evento está expandido. Se muestra un botón o ícono de "cerrar" en la parte superior derecha del contenido expandido, permitiendo al usuario contraer el evento cuando ya no necesite ver los detalles.

El contenido expandido empuja hacia abajo los eventos posteriores del mismo día. Si hay eventos después del evento expandido, estos se desplazan hacia abajo para acomodar el contenido adicional. El scroll del usuario permanece en la misma posición relativa, permitiendo ver tanto los detalles como el contexto circundante.

El usuario puede seguir desplazándose mientras la expansión está abierta, pudiendo revisar el contenido detallado mientras mantiene visibilidad del resto del itinerario.

### Contenido de la Expansión

La expansión muestra toda la información detallada del evento, organizada en secciones claras y legibles.

En la parte superior del contenido expandido, se muestra el ícono del evento junto a su nombre completo en un tamaño de fuente más grande que el resto del texto para destacarlo. Inmediatamente debajo, se muestra la fecha y hora del evento con total claridad, incluyendo tanto la hora de salida como la hora de llegada cuando se trata de desplazamientos.

La sección de información principal varía según el tipo de evento. Para vuelos, muestra la aerolínea, el número de vuelo, el tipo de aeronave, la terminal de origen y destino, y el código de reserva. Para hoteles, muestra el horario de check-in y check-out, el nombre del titular de la reserva y la plataforma donde se realizó. Para festivales, muestra el horario de apertura y cierre del recinto.

La dirección completa del lugar se muestra claramente, seguida de un enlace prominente con el texto "Ver en Google Maps". Este enlace es visualmente destacado para animar al usuario a obtener indicaciones de navegación cuando sea necesario. Al tocar este enlace, se abre Google Maps en el navegador o en la aplicación nativa.

La sección de costos muestra el costo del evento en la moneda local del lugar, seguido de su equivalente en COP, con indicación clara de quién pagó o si está pendiente de pago. Si el costo está incluido en otro concepto, como un vuelo de ida y vuelta, esto se indica claramente.

Finalmente, cualquier nota adicional que se haya registrado para el evento se muestra en una sección de "Notas", con un estilo visual que la distingue de la información estructurada del evento.

### Comportamiento al Cerrar la Expansión

Cuando el usuario toca el botón "Cerrar" ubicado en la parte superior derecha del contenido expandido, o toca fuera del área de expansión, la expansión se contrae suavemente. El evento vuelve a su estado original mostrando solo la información resumida. El contenido debajo del evento vuelve a su posición original, y el usuario permanece en el mismo punto del itinerario.

### Comportamiento de Scroll con Expansiones

La aplicación guarda la posición de desplazamiento cuando el usuario expande un evento y luego lo contrae. Si el usuario se desplazó durante la expansión para ver detalles adicionales, y luego cierra la expansión, el scroll permanece donde está, no donde estaba antes de expandir. Esta decisión permite al usuario mantener el contexto de lo que estaba revisando.

De manera similar, cuando el usuario cambia entre las pestañas de Itinerario, Finanzas y Ajustes, la aplicación recuerda la posición de scroll en cada pestaña, restaurándola al volver. Esto incluye recordar qué eventos estaban expandidos, para que el usuario no pierda su estado al cambiar de vista.

---

## 6. Módulo Financiero

### Vista de Resumen Ejecutivo

La pestaña de Finanzas presenta un resumen ejecutivo de la situación financiera del viaje, diseñado para dar al usuario una visión clara y rápida de su estado financiero sin requerir análisis detallado.

La parte superior de la vista muestra tres números grandes y claros: el presupuesto total del viaje, el gasto acumulado hasta el momento y el saldo restante. Estos números se muestran en COP como moneda principal, con un tamaño de fuente prominente que permite leerlos de un vistazo.

Inmediatamente debajo de estos números, un indicador visual tipo barra de progreso muestra el porcentaje de presupuesto gastado. Esta barra se llena progresivamente a medida que se registran más gastos y cambia de color gradualmente: verde cuando el gasto está por debajo del setenta por ciento, amarillo entre el setenta y el noventa por ciento, y rojo cuando supera el noventa por ciento, proporcionando una señal visual inmediata del estado financiero.

### Selector de Moneda

Justo debajo del resumen ejecutivo, la aplicación muestra un selector de moneda que permite al usuario cambiar la moneda en la que se visualizan todos los montos. Por defecto, todos los montos se muestran en COP, pero el usuario puede seleccionar cualquier moneda local del viaje, como EUR, USD, CHF, o mantener COP.

Cuando el usuario selecciona una moneda diferente, todos los montos se convierten automáticamente utilizando tasas de cambio fijas almacenadas en los datos del viaje. La moneda seleccionada se indica claramente con su código y símbolo junto a cada monto, para que el usuario siempre sepa en qué moneda está viendo los valores.

### Desglose por Categoría

La siguiente sección muestra un desglose de gastos por categoría. Las categorías principales son Transporte, Alojamiento, Festival o Entretenimiento, Comida y Otros. Cada categoría muestra su nombre, el ícono correspondiente, el monto total gastado y una barra de progreso visual que indica qué porcentaje del presupuesto total de la categoría representa ese gasto.

El orden de las categorías es dinámico, mostrando primero la categoría con mayor gasto acumulado, para que el usuario vea rápidamente dónde se está concentrando la mayor parte del presupuesto.

### Desglose por Persona

Para viajes en grupo, la aplicación muestra un desglose por persona que indica cuánto ha pagado cada viajero y qué gastos están pendientes de pago. Esta sección identifica a cada viajero por su nombre y un color de avatar que lo representa consistentemente en toda la aplicación.

Cada persona muestra el monto total que ha pagado hasta el momento. Un indicador de estado, pagado o pendiente, acompaña a cada gasto individual, pero en el resumen solo se muestra el total acumulado por persona y el total pendiente.

La sección también muestra un total combinado de todos los gastos, junto con el monto pendiente total que aún no ha sido pagado por nadie, para que el grupo pueda planificar cómo cubrir estos gastos.

### Lista Detallada de Gastos

Al tocar el botón "Ver todos los gastos", ubicado al final de la vista de resumen, la aplicación navega a una vista de lista detallada que muestra todos los gastos individuales del viaje. Esta navegación ocurre dentro de la misma pestaña de Finanzas, sin modales ni ventanas emergentes.

Esta lista presenta cada gasto en una línea separada, mostrando la fecha del gasto, el ícono del tipo de gasto, una breve descripción, el monto en la moneda seleccionada, y el nombre de la persona que pagó o un indicador de "Pendiente" si aún no ha sido asignado.

La lista está ordenada cronológicamente y tiene un encabezado fijo en la parte superior que muestra el total acumulado y el total pendiente. El usuario puede tocar cualquier gasto para ver más detalles, como el código de reserva asociado o notas adicionales. Al tocar un gasto, este se expande en su lugar mostrando los detalles adicionales, siguiendo el mismo principio de expansión en línea utilizado en el itinerario, sin modales.

---

## 7. Modo Oscuro y Claro

La aplicación ofrece dos temas visuales: claro y oscuro. El usuario puede cambiar entre ellos manualmente desde la pestaña de Ajustes mediante un interruptor de palanca. La selección del tema se almacena en el almacenamiento local del navegador y persiste entre sesiones, por lo que el usuario siempre encuentra la aplicación en su tema preferido.

**En el tema claro**, el fondo general es blanco puro, proporcionando el máximo contraste para la legibilidad en condiciones de luz brillante. Las tarjetas y elementos de la interfaz tienen un fondo ligeramente grisáceo que los distingue del fondo general sin crear un contraste excesivo. El texto principal es de un color gris oscuro casi negro, mientras que el texto secundario es de un gris medio. Los bordes y líneas divisorias son sutiles y de un gris claro.

**En el tema oscuro**, el fondo general es de un gris muy oscuro, casi negro, que reduce la fatiga visual en condiciones de poca luz. Las tarjetas y elementos de la interfaz tienen un fondo gris ligeramente más claro que el fondo general, creando una jerarquía visual sutil pero efectiva. El texto principal es de un blanco suave, mientras que el texto secundario es de un gris claro. Los bordes y líneas divisorias son sutiles, utilizando grises con diferentes niveles de opacidad.

En ambos temas, los colores de acento para diferentes tipos de eventos, como azul para vuelos, verde para hoteles, naranja para actividades, etc., se mantienen consistentes, pero con intensidades ajustadas para garantizar legibilidad y accesibilidad. La transición entre temas es instantánea, sin animaciones, para garantizar que la interfaz responda inmediatamente a las preferencias del usuario.

---

## 8. Flujo de Usuario

Cuando un usuario abre la aplicación por primera vez, ve la vista de Itinerario con el día actual o el primer día del viaje visible en la parte superior de la pantalla. La aplicación ha cargado los primeros tres o cuatro días del viaje, mostrando todas las actividades, desplazamientos y alojamientos planificados.

El usuario puede desplazarse hacia abajo para ver los días siguientes. Mientras se desplaza, la aplicación carga automáticamente más días, manteniendo una experiencia fluida sin tiempos de carga perceptibles. La aplicación nunca muestra indicadores de carga intrusivos; en su lugar, muestra un pequeño mensaje sutil en la parte inferior de la pantalla que dice "Cargando más días..." sin interrumpir el desplazamiento.

Si el usuario necesita más información sobre un evento específico, toca cualquier actividad, desplazamiento o alojamiento. El evento se expande en su lugar mostrando toda la información detallada. El usuario puede leer la información, tocar el enlace "Ver en Google Maps" para obtener indicaciones de navegación, y luego contraer el evento tocando el botón "Cerrar" o tocando fuera del área expandida. Durante todo este proceso, el usuario permanece en el contexto del itinerario sin interrupciones.

Para revisar el estado financiero, el usuario toca la pestaña de Finanzas en la barra inferior. La aplicación muestra inmediatamente el resumen ejecutivo con todos los indicadores financieros actualizados. Si el usuario necesita ver todos los gastos en detalle, toca el botón correspondiente y la vista cambia para mostrar la lista detallada, siempre dentro de la misma pestaña de Finanzas.

En cualquier momento, el usuario puede ajustar la configuración de la aplicación tocando la pestaña de Ajustes. Aquí puede cambiar el tema, ver la configuración del viaje, o recargar los datos si ha habido actualizaciones.

El cambio entre pestañas es instantáneo, con la nueva vista cargada y lista para interactuar inmediatamente. La pestaña activa se resalta visualmente en la barra de navegación inferior, proporcionando retroalimentación clara al usuario.

---

## 9. Comportamientos y Transiciones

**Carga progresiva**: La aplicación carga los datos del viaje desde los archivos JSON segmentados de manera progresiva. El archivo raíz se carga primero, seguido de los nodos y aristas necesarios para los primeros días. A medida que el usuario se desplaza, se cargan más días. Esta estrategia asegura que la aplicación sea rápida incluso con itinerarios largos de quince a treinta días.

**Expansión de eventos**: La expansión de eventos en el itinerario utiliza una animación suave de deslizamiento desde la parte inferior del evento. El contenido adicional aparece gradualmente mientras los eventos posteriores se desplazan hacia abajo para acomodarlo. La contracción sigue el proceso inverso, con el contenido deslizándose hacia arriba y los eventos posteriores volviendo a su posición original.

**Cambio de pestañas**: El cambio entre pestañas es instantáneo, sin animaciones de transición, para garantizar una respuesta inmediata a la interacción del usuario. La pestaña activa se resalta visualmente en la barra de navegación inferior mediante un cambio de color o subrayado.

**Persistencia de datos**: La aplicación carga los datos del viaje desde los archivos JSON segmentados en cada carga de página. La estructura de datos separada permite recargar solo los datos actualizados sin afectar el estado de la interfaz, preparando el terreno para futuras funcionalidades de edición.

---

## 10. Implementación Técnica

La aplicación está diseñada para ejecutarse completamente en el lado del cliente, alojada en GitHub Pages. No requiere servidor ni backend, ya que todos los datos del viaje están contenidos en archivos JSON estáticos que se cargan bajo demanda.

**Arquitectura de datos**: La aplicación carga primero el archivo de definición del viaje, que contiene los metadatos del viaje y las referencias a todos los archivos de nodos y aristas. A partir de estas referencias, la aplicación construye la estructura completa del viaje por días, organizando eventos, desplazamientos y alojamientos en el orden cronológico correcto.

**Lógica de carga**: Para la carga progresiva, la aplicación utiliza la API IntersectionObserver del navegador para detectar cuándo el usuario ha llegado cerca del final de los días cargados. En ese momento, carga los próximos días de la estructura de datos y los añade al DOM de manera incremental.

**Persistencia de estado**: La aplicación utiliza el almacenamiento local del navegador para guardar la posición de scroll en cada vista, el tema seleccionado, los eventos expandidos y la última vez que el usuario interactuó con la aplicación. Esta información permite restaurar el estado completo de la aplicación entre sesiones.

**Rendimiento**: La aplicación está optimizada para dispositivos móviles con recursos limitados. El uso de Material Symbols desde CDN reduce el tamaño de los archivos a cargar, la carga progresiva evita que el navegador tenga que procesar todo el itinerario de una vez, y la ausencia de modales simplifica la gestión del DOM.

---

## 11. Resumen de Decisiones de UX

La experiencia de usuario de Itinerary se basa en decisiones de diseño deliberadas que priorizan la claridad, la eficiencia y la facilidad de uso en el contexto de viajes en grupo.

La **barra de navegación inferior** con tres pestañas proporciona acceso rápido a las secciones principales sin sobrecargar la interfaz. La vista de **itinerario como línea de tiempo vertical** facilita la comprensión del viaje de manera cronológica, y la **carga progresiva** asegura que la aplicación sea rápida incluso con itinerarios largos.

La **expansión en línea de eventos** en lugar de modales mantiene al usuario siempre en contexto, evitando interrupciones en la navegación y preservando la continuidad del scroll. Este enfoque es más natural para dispositivos móviles y más sencillo de implementar que los modales.

Los **enlaces a Google Maps** en lugar de un mapa interactivo simplifican la implementación manteniendo la funcionalidad de ubicación. El **sistema de íconos monocromáticos** proporciona identificación visual consistente sin añadir complejidad visual.

El **módulo financiero** ofrece un resumen claro del estado económico del viaje, con conversión de monedas y distinción por persona, esencial para viajes en grupo. El **switch de tema oscuro o claro** permite al usuario adaptar la aplicación a sus condiciones de luz.

El **guardado de posición de scroll** y la **persistencia del tema** demuestran atención al detalle en la experiencia del usuario, haciendo que la aplicación se sienta pulida y profesional.

La **ausencia de modales** y la **expansión en línea** son las características distintivas de esta experiencia de usuario, eliminando interrupciones y manteniendo al usuario siempre dentro del flujo de scroll de su itinerario.

La **ausencia de funcionalidades de edición o interacción avanzada**, como marcar actividades como completadas o añadir notas, mantiene la aplicación enfocada en su propósito principal de consulta, con posibilidad de extensión futura mediante la arquitectura preparada para ello.

---

## 12. Información para Implementación

**Tecnologías requeridas**:
- HTML5 para la estructura de la interfaz
- CSS3 con variables CSS para el cambio entre temas
- JavaScript Vanilla en combinación con Alpine.js para interactividad
- Material Symbols desde CDN para los íconos
- JSON para el almacenamiento de datos

**Framework principal**: Astro, que proporciona generación de sitios estáticos con arquitectura de islas para renderizado eficiente y carga progresiva.

**Interactividad**: Alpine.js con el plugin Persist para manejo de estado y persistencia en localStorage, proporcionando la interactividad necesaria para expansiones de eventos, cambio de pestañas, selector de moneda y cambio de tema.

**Estructura de directorios**:
La aplicación carga los datos desde la estructura de archivos JSON segmentados previamente definida. El archivo raíz se encuentra en la raíz del proyecto, mientras que los archivos de nodos y aristas se organizan en carpetas separadas dentro del directorio de datos.

**Requisitos de rendimiento**:
El tiempo de carga inicial debe ser menor a un segundo en conexiones 3G. El tiempo de carga de días adicionales debe ser menor a cien milisegundos. El uso de memoria RAM debe ser menor a cincuenta megabytes. El almacenamiento en el dispositivo debe ser menor a un megabyte para los datos de la aplicación.

**Accesibilidad**:
Todos los íconos deben tener texto alternativo mediante aria-label. El contraste de color debe cumplir con el nivel AA de WCAG. La navegación por teclado debe ser funcional. El tamaño de fuente debe ser ajustable mediante el zoom del navegador sin romper el diseño.

---

## 13. Comportamiento Específico de Scroll

La aplicación implementa un comportamiento de scroll inteligente que mejora significativamente la experiencia de usuario:

**Guardado de posición**: La aplicación guarda la posición de desplazamiento en cada vista cuando el usuario cambia entre pestañas, expande o contrae eventos, o cierra la aplicación. Al regresar a una vista, el scroll se restaura exactamente donde estaba.

**Eventos expandidos persistentes**: Cuando el usuario expande un evento para ver sus detalles, esa expansión se mantiene incluso si el usuario cambia de pestaña y regresa. Esto permite al usuario mantener el contexto de su consulta sin tener que reencontrar la información.

**Excepción de tiempo**: Si han pasado más de treinta minutos desde la última interacción del usuario, la posición de scroll en la vista de itinerario se restablece al inicio del día actual. Esta decisión asume que el usuario ha retomado la aplicación después de un tiempo y probablemente quiere ver el día en curso, no el día que estaba viendo hace media hora.

**Scroll durante expansiones**: El usuario puede desplazarse libremente mientras un evento está expandido. Si se desplaza hacia abajo y luego cierra el evento, el scroll permanece en la nueva posición, permitiendo al usuario continuar su exploración desde donde quedó.