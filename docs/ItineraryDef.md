## 1. Nodos (Nodes) - v3.0

### Estructura de un Nodo

```json
{
  "id": "string",                    // Identificador único del nodo
  "tipo": "string",                  // Tipo de nodo (ver tabla de tipos)
  "nombre": "string",                // Nombre descriptivo del lugar/evento
  "oculto": boolean,                 // true: no se muestra en el itinerario, false: se muestra
  "direccion": {                     // Información de ubicación
    "calle": "string",               // Dirección completa (opcional)
    "ciudad": "string",              // Ciudad
    "codigo_postal": "string",       // Código postal (opcional)
    "pais": "string",                // País
    "coordenadas": {                 // Coordenadas GPS (opcional)
      "lat": number,
      "lng": number
    },
    "maps_link": "string"            // Enlace a Google Maps (opcional)
  },
  "contacto": {                      // Información de contacto (opcional)
    "telefono": "string",
    "email": "string",
    "web": "string"
  },
  "visitas": [                       // Arreglo de visitas al lugar
    {
      "entrada": "YYYY-MM-DD",       // Fecha de llegada
      "salida": "YYYY-MM-DD",        // Fecha de salida
      "clima": [                     // Arreglo de clima por día de estadía (opcional)
        {
          "fecha": "YYYY-MM-DD",     // Fecha específica
          "temperatura_promedio": "string",
          "condiciones": "string",
          "probabilidad_lluvia": "string",
          "recomendacion_vestimenta": "string"
        }
      ],
      "reserva": {                   // Reserva específica de esta visita (opcional)
        "codigo_reserva": "string",
        "confirmada": boolean,
        "nombre_titular": "string",
        "plataforma": "string",
        "costo": {
          "moneda": "string",
          "valor": number,
          "pagado_por": "string",
          "incluido_en": "string"
        }
      },
      "notas": "string"              // Notas específicas de esta visita (opcional)
    }
  ],
  "horarios": {                      // Horarios de operación (opcional)
    "check_in": "HH:MM",             // Para hoteles
    "check_out": "HH:MM",            // Para hoteles
    "horario_apertura": "HH:MM",     // Para atracciones
    "horario_cierre": "HH:MM",       // Para atracciones
    "atencion": "string"             // Horario de atención general
  },
  "actividades": [                   // Lista de actividades en el nodo (opcional)
    {
      "id": "string",
      "nombre": "string",
      "tipo": "string",
      "duracion_estimada": "string",
      "horario_recomendado": "string",
      "url_oficial": "string",
      "reserva": {
        "requiere_reserva": boolean,
        "fecha_reservada": "YYYY-MM-DD",
        "hora_reservada": "HH:MM",
        "costo": {
          "moneda": "string",
          "valor": number,
          "pagado_por": "string"
        },
        "notas": "string"
      },
      "notas": "string"
    }
  ],
  "equipaje_recomendado": [          // Lista de equipaje recomendado (opcional)
    "string"
  ],
  "idioma_principal": "string",      // Idioma principal (opcional)
  "moneda_local": {                  // Moneda local (opcional)
    "codigo": "string",
    "simbolo": "string",
    "tasa_referencia": "string"
  },
  "reglas_especiales": [             // Reglas especiales (opcional)
    "string"
  ],
  "imagenes": [                      // URLs de imágenes (opcional)
    "string"
  ],
  "tiempo_estimado_visita": "string" // Tiempo estimado de visita (opcional)
}
```

### Tipos de Nodos

| Tipo               | Descripción                      | ¿Puede ser oculto?          |
| ------------------ | -------------------------------- | --------------------------- |
| `aeropuerto`       | Aeropuerto                       | ✅ Sí                       |
| `hotel`            | Hotel/Alojamiento                | ✅ Sí                       |
| `casa`             | Casa propia                      | ✅ Sí                       |
| `casa_amigo`       | Casa de amigo                    | ✅ Sí                       |
| `casa_origen`      | **Nodo inicial del viaje**       | ❌ **No** (siempre visible) |
| `atraccion`        | Atracción turística              | ✅ Sí                       |
| `festival`         | Festival/Evento                  | ✅ Sí                       |
| `oficina_alquiler` | Oficina de alquiler de vehículos | ✅ Sí                       |

### Reglas de `visitas`

1. **Todo nodo debe tener al menos una visita**, excepto `casa_origen` (puede tener 0 si es solo punto de partida)
2. Cada visita tiene su propio rango de fechas (`entrada`/`salida`)
3. Las visitas **no deben solaparse** en fechas (para un mismo nodo)
4. El orden de las visitas en el arreglo **debe ser cronológico**
5. Los campos que antes estaban a nivel de nodo (`fechas_estadia`, `clima_esperado`, `reserva`, `notas_adicionales`) se mueven a cada visita
6. Los campos que aplican a todas las visitas (horarios, actividades, equipaje) se mantienen a nivel de nodo

### Reglas de `clima` como arreglo

El campo `clima` dentro de cada visita es ahora un arreglo que contiene información climática para cada día de estadía. Esto permite tener predicciones o datos climáticos específicos por fecha.

- Cada elemento del arreglo debe tener al menos el campo `fecha`
- Las fechas en el arreglo deben estar dentro del rango `entrada`-`salida` de la visita
- El orden de los elementos en el arreglo debe ser cronológico
- La UI puede mostrar solo el primer día como resumen, o permitir consultar día por día

**Ejemplo de clima como arreglo:**

```json
"clima": [
  {
    "fecha": "2026-07-28",
    "temperatura_promedio": "16°C - 22°C",
    "condiciones": "Parcialmente nublado",
    "probabilidad_lluvia": "40%",
    "recomendacion_vestimenta": "Ropa ligera, chaqueta impermeable"
  },
  {
    "fecha": "2026-07-29",
    "temperatura_promedio": "18°C - 24°C",
    "condiciones": "Soleado",
    "probabilidad_lluvia": "10%",
    "recomendacion_vestimenta": "Ropa ligera, gafas de sol"
  }
]
```

### Nodo Especial: Casa-Origen

El nodo de tipo `casa_origen` es el **nodo inicial del viaje**. Debe existir exactamente uno en el grafo.

**Características:**

- Es el punto de partida del viaje
- No tiene aristas entrantes
- Su primera visita marca el inicio del viaje
- No puede ser oculto (si tiene `oculto: true`, se ignora)

**Ejemplo de casa_origen:**

```json
{
  "id": "bog-casa-david",
  "tipo": "casa_origen",
  "nombre": "Casa",
  "oculto": false,
  "direccion": {
    "ciudad": "Bogotá",
    "pais": "Colombia"
  },
  "visitas": [
    {
      "entrada": "2026-07-17",
      "salida": "2026-07-17",
      "notas": "Salir con tiempo para evitar trancones"
    }
  ]
}
```

---

## 2. Aristas (Edges)

### Estructura de una Arista

```json
{
  "id": "string",                    // Identificador único de la arista
  "origen_id": "string",             // ID del nodo de origen
  "destino_id": "string",            // ID del nodo de destino
  "modo": "string",                  // Modo de transporte (ver tabla de modos)
  "oculto": boolean,                 // true: no se muestra en el itinerario, false: se muestra
  "transporte": {                    // Detalles del transporte
    "compania": "string",            // Compañía de transporte (opcional)
    "tipo_vehiculo": "string",       // Tipo de vehículo (opcional)
    "numero_vuelo": "string",        // Número de vuelo (para aviones)
    "linea": "string",               // Línea de tren/metro/bus (opcional)
    "terminal_origen": "string",     // Terminal de origen (para aviones)
    "terminal_destino": "string",    // Terminal de destino (para aviones)
    "codigo_reserva_confirmacion": "string", // Código de reserva (opcional)
    "detalles": "string"             // Detalles adicionales
  },
  "tiempo_estimado": {
    "minutos": number,               // Minutos estimados
    "rango": "string",               // Rango estimado (ej: "20-25")
    "con_holgura": number            // Tiempo con holgura
  },
  "logistica_salida": {
    "fecha_salida": "YYYY-MM-DD",    // Fecha de salida (obligatorio)
    "hora_salida_origen": "HH:MM",   // Hora de salida del origen (obligatorio)
    "hora_llegada_destino": "HH:MM", // Hora de llegada al destino (obligatorio)
    "hora_salida_efectiva_transporte": "HH:MM" // Hora real de salida del transporte (opcional)
  },
  "reglas_holgura": {                // Reglas de holgura (opcional)
    "tiempo_requerido": "string",    // Tiempo requerido antes del transporte
    "motivo": "string"               // Motivo de la holgura
  },
  "costos": {
    "moneda": "string",              // Moneda del costo
    "valor": number,                 // Valor del costo
    "pagado_por": "string",          // Quién pagó (opcional)
    "incluido_en": "string"          // Si está incluido en otro gasto (opcional)
  },
  "notas": "string"                  // Notas adicionales
}
```

### Modos de Transporte

| Modo       | Descripción          | Ejemplos                   |
| ---------- | -------------------- | -------------------------- |
| `avion`    | Vuelo en avión       | Avianca, KLM, Iberia       |
| `tren`     | Tren                 | Trenitalia, SBB, NS, Renfe |
| `metro`    | Metro                | TMB, ATAC                  |
| `bus`      | Autobús              | Empresas locales           |
| `auto`     | Automóvil particular | Alquilado o propio         |
| `caminata` | A pie                | Trayectos cortos           |

### Reglas de Validación para Aristas

1. **Todas las aristas deben tener fecha y hora concreta** en `logistica_salida.fecha_salida`, `logistica_salida.hora_salida_origen` y `logistica_salida.hora_llegada_destino`. No se permiten valores vacíos o nulos.

2. **Las horas de las aristas no se pueden solapar entre ellas**. Para un mismo nodo origen, las aristas deben tener fechas y horas de salida que no se superpongan. Si dos aristas salen del mismo nodo en el mismo día, sus horas deben ser distintas y con suficiente separación temporal.

3. **La fecha y hora de llegada a un nodo destino no puede estar fuera de las fechas definidas en ese nodo**. Es decir:
   - La fecha de llegada (de la arista) debe estar dentro del rango `[entrada, salida]` de la visita correspondiente del nodo destino.
   - Si el nodo destino tiene múltiples visitas, se debe asociar a la visita que cubre esa fecha.

4. **La fecha y hora de salida de un nodo origen no puede estar fuera de las fechas definidas en ese nodo**. Es decir:
   - La fecha de salida (de la arista) debe estar dentro del rango `[entrada, salida]` de la visita correspondiente del nodo origen.
   - Si el nodo origen tiene múltiples visitas, se debe asociar a la visita que cubre esa fecha.

5. **Los enlaces de Google Maps para aeropuertos deben incluir la terminal específica** de la aerolínea en la URL o en la dirección, para facilitar la orientación del viajero. Ejemplo: `"maps_link": "https://www.google.com/maps?q=Terminal+1+Aeropuerto+El+Dorado+Bogota"`.

---

## 3. Reglas del Grafo

### Reglas Generales

1. **Todo nodo debe tener al menos una arista de entrada o una arista de salida**, excepto:
   - El nodo `casa_origen`: Solo tiene arista de salida (es el inicio del viaje).
   - El nodo final del viaje: Solo tiene arista de entrada (es el fin del viaje).

2. **Todo nodo debe tener al menos una visita**, excepto `casa_origen`.

3. **El nodo `casa_origen`** es obligatorio y único en el grafo.

### Propiedad `oculto`

La propiedad `oculto` permite ocultar nodos o aristas que no se quieren mostrar en el itinerario visual.

- **Nodos ocultos**: No aparecen en la lista de días del itinerario.
- **Aristas ocultas**: No se muestran como eventos de transporte entre nodos.

**Casos de uso comunes:**

- Un nodo de atracción que no se visita (reservado pero cancelado).
- Una arista de prueba o de respaldo.
- Conexiones entre nodos que no son relevantes para el viajero (ej: nodos de transferencia técnica).

**Reglas especiales de `oculto`:**

- El nodo `casa_origen` **nunca** puede ser oculto. Si tiene `oculto: true`, se ignora.
- Las aristas que tienen `reglas_holgura` **deben** ser visibles (se ignorará `oculto: true`).

### Ciclos y Bifurcaciones

El grafo puede contener:

- **Ciclos**: Un nodo que se repite (ej: regreso al mismo hotel).
  - El nodo se muestra una sola vez en el itinerario
  - Las aristas de entrada y salida se muestran como eventos separados
  - La información de "regreso" se maneja con visitas múltiples (cada visita tiene su propio rango de fechas)

- **Bifurcaciones**: Múltiples nodos saliendo del mismo origen (ej: dos actividades en el mismo día). El orden se define por:
  1. El algoritmo de orden de visita (ver sección 7)
  2. Orden por hora de inicio (cuando está disponible)
  3. Orden de aparición en el JSON (fallback)

---

## 4. Archivo Raíz (`viaje-raiz.json`)

El archivo raíz es el punto de entrada del grafo. Contiene las referencias a todos los nodos y aristas.

```json
{
  "version": "string", // Versión del grafo (ej: "3.0")
  "nombre_viaje": "string", // Nombre del viaje
  "fechas": {
    "inicio": "YYYY-MM-DD", // Fecha de inicio del viaje
    "fin": "YYYY-MM-DD" // Fecha de fin del viaje
  },
  "referencias": {
    "nodos": [
      // Lista de rutas de archivos de nodos
      "nodos/nodo-id.json"
    ],
    "aristas": [
      // Lista de rutas de archivos de aristas
      "aristas/arista-id.json"
    ]
  }
}
```

---

## 5. Ejemplo de Grafo Completo (v3.0)

```
Nodo Inicial: casa_origen (casa-david)
  ↓ [arista: casa-to-aeropuerto]
Nodo: aeropuerto-bog (visita 1: 2026-07-17)
  ↓ [arista: bog-to-bcn]
Nodo: aeropuerto-bcn (visita 1: 2026-07-18)
  ↓ [arista: bcn-airport-to-hotel]
Nodo: hotel-bcn (visita 1: 2026-07-18 → 2026-07-19)
  ↓ [arista: bcn-hotel-to-airport]
Nodo: aeropuerto-bcn (visita 2: 2026-07-19)  ← Mismo nodo, visita diferente
  ↓ [arista: bcn-to-roma]
Nodo: aeropuerto-fco (visita 1: 2026-07-19)
  ↓ [arista: fco-to-hotel]
Nodo: hotel-roma (visita 1: 2026-07-19 → 2026-07-21)
  ↓ [arista: hotel-to-coliseo]
Nodo: coliseo (visita 1: 2026-07-20)
  ↓ [arista: coliseo-to-hotel]
Nodo: hotel-roma (visita 1: 2026-07-19 → 2026-07-21)  ← Mismo nodo, misma visita (ciclo)
  ↓ [arista: hotel-to-aeropuerto]
Nodo: aeropuerto-fco (visita 2: 2026-07-21)  ← Mismo nodo, visita diferente
  ↓ [arista: fco-to-zrh]
Nodo: aeropuerto-zrh (visita 1: 2026-07-21)
  ↓ [arista: zrh-to-amiga]
Nodo: casa-amiga-zrh (visita 1: 2026-07-21 → 2026-07-25)
  ↓ [arista: amiga-to-airport]
Nodo: aeropuerto-zrh (visita 2: 2026-07-25)  ← Mismo nodo, visita diferente
  ↓ [arista: zrh-to-ams]
Nodo: aeropuerto-ams (visita 1: 2026-07-25)
  ↓ [arista: ams-to-hotel]
Nodo: hotel-ams (visita 1: 2026-07-25 → 2026-07-27)
  ↓ [arista: hotel-to-airport]
Nodo: aeropuerto-ams (visita 2: 2026-07-27)  ← Mismo nodo, visita diferente
  ↓ [arista: ams-to-ham]
Nodo: aeropuerto-ham (visita 1: 2026-07-27)
  ↓ [arista: ham-to-hotel]
Nodo: hotel-ham (visita 1: 2026-07-27 → 2026-07-28)
  ↓ [arista: hotel-to-sixt]
Nodo: sixt-ham (visita 1: 2026-07-28)
  ↓ [arista: sixt-to-wacken]
Nodo: wacken-festival (visita 1: 2026-07-28 → 2026-08-02)
  ↓ [arista: wacken-to-sixt]
Nodo: sixt-ham (visita 2: 2026-08-02)  ← Mismo nodo, visita diferente
  ↓ [arista: sixt-to-ham-airport]
Nodo: aeropuerto-ham (visita 2: 2026-08-02)  ← Mismo nodo, visita diferente
  ↓ [arista: ham-to-mad]
Nodo: aeropuerto-mad (visita 1: 2026-08-02)
  ↓ [arista: mad-to-hotel]
Nodo: hotel-mad (visita 1: 2026-08-02 → 2026-08-03)
  ↓ [arista: hotel-to-airport]
Nodo: aeropuerto-mad (visita 2: 2026-08-03)  ← Mismo nodo, visita diferente
  ↓ [arista: mad-to-bog]
Nodo: aeropuerto-bog (visita 2: 2026-08-03)  ← Mismo nodo, visita diferente (fin del viaje)
```

---

## 6. Validaciones de Fechas

### Reglas de validación para `visitas`:

1. **Para nodos de tipo `atraccion`**:
   - `entrada` y `salida` deben ser el mismo día (visita de un día)

2. **Para `hotel`, `casa`, `casa_amigo`**:
   - `salida` debe ser posterior a `entrada`

3. **Para `aeropuerto`**:
   - `entrada` y `salida` suelen ser el mismo día (escala)

4. **Para `festival`**:
   - `entrada` y `salida` pueden abarcar varios días

5. **Regla general**:
   - Las visitas de un mismo nodo **no deben solaparse**

---

## 7. Algoritmo de Recorrido y Dibujo

El algoritmo actual implementado en el código construye el itinerario mediante un recorrido DFS (Depth-First Search) con pila, que garantiza que cada nodo se agregue una sola vez al resultado, mientras que las aristas se dibujan en el orden cronológico de salida.

### Estructura del Itinerario

El itinerario es un arreglo de elementos, donde cada elemento puede ser:

```javascript
{ tipo: 'nodo', id: string, visitaIndex: number, fecha: string }
{ tipo: 'arista', id: string, fecha: string }
```

- `tipo`: Indica si el elemento es un nodo o una arista.
- `id`: Identificador del nodo o arista.
- `visitaIndex`: (Solo para nodos) Índice de la visita que corresponde a esta aparición del nodo.
- `fecha`: Fecha en formato YYYY-MM-DD calculada para este elemento.

### Algoritmo de Recorrido

1. **Identificar el nodo inicial**: Se busca el nodo de tipo `casa_origen` en el grafo.

2. **Inicializar estructuras**:
   - `pendingEdgeIds`: Conjunto de todas las aristas pendientes de procesar.
   - `visitedNodeIds`: Conjunto de nodos ya visitados (marcados).
   - `nodeVisitIndexMap`: Mapa que rastrea el índice de visita actual de cada nodo.
   - `stack`: Pila LIFO para almacenar aristas pendientes de procesar.
   - `result`: Arreglo que contendrá el itinerario ordenado.

3. **Agregar el nodo inicial**: Se agrega al resultado con `visitaIndex: 0` y su fecha correspondiente.

4. **Bucle principal** (mientras haya aristas pendientes o elementos en la pila):
   - a. Obtener las aristas salientes del nodo actual que aún no han sido procesadas y añadirlas a la pila.
   - b. Sacar la siguiente arista de la pila (LIFO - Last In, First Out).
   - c. Agregar la arista al resultado con su fecha correspondiente.
   - d. Moverse al nodo destino.
   - e. Determinar el índice de visita para el nodo destino:
     - Si el nodo ya ha sido visitado con el mismo índice, se incrementa el contador.
     - Si es la primera vez que se ve este nodo o el índice no está usado, se mantiene.
   - f. Calcular la fecha del nodo:
     - Se usa la fecha de la arista que llega al nodo (`logistica_salida.fecha_salida`).
     - Si no está disponible, se usa la fecha de la visita correspondiente como fallback.
   - g. Agregar el nodo al resultado con el índice de visita calculado y su fecha.

5. **Fin del recorrido**: Se retorna el arreglo `result` con el itinerario completo.

### Características del Algoritmo

- **Recorrido DFS con pila LIFO**: Esto asegura que las aristas se procesen en el orden cronológico inverso (la más temprana primero, debido al ordenamiento descendente en `getEdgesFromNode`).
- **Manejo de ciclos**: Al usar `visitedNodeIds`, se evitan ciclos infinitos, pero se permite que un nodo aparezca múltiples veces con diferentes índices de visita.
- **Cálculo de fechas**: Cada elemento del itinerario tiene su propia fecha, calculada a partir de la arista que llega al nodo o de la visita correspondiente.
- **Límite de seguridad**: Se implementa un límite de `MAX_TRAVERSAL_ITERATIONS` (500) para evitar bucles infinitos en grafos mal formados.
- **Manejo de grafos desconectados**: Si quedan aristas pendientes sin procesar, se emite una advertencia en la consola.

### Ejemplo de Funcionamiento

Para un grafo con las aristas:
- `casa → hotel` (fecha: 2026-07-17)
- `hotel → aeropuerto` (fecha: 2026-07-18)
- `hotel → atraccion` (fecha: 2026-07-17)

El algoritmo produce:
```
1. Nodo: casa (visitaIndex: 0, fecha: 2026-07-17)
2. Arista: casa → hotel (fecha: 2026-07-17)
3. Nodo: hotel (visitaIndex: 0, fecha: 2026-07-17)
4. Arista: hotel → atraccion (fecha: 2026-07-17)  ← LIFO, la más temprana primero
5. Nodo: atraccion (visitaIndex: 0, fecha: 2026-07-17)
6. Arista: hotel → aeropuerto (fecha: 2026-07-18)  ← Luego la más tardía
7. Nodo: aeropuerto (visitaIndex: 0, fecha: 2026-07-18)
```

---

## 8. Distinción UI: Nodos vs Aristas

En la interfaz de usuario, los elementos del itinerario se distinguen visualmente:

| Elemento   | Tipo           | Estilo en UI                                          |
| ---------- | -------------- | ----------------------------------------------------- |
| **Nodo**   | Lugar/evento   | Borde lateral de color, fondo con sombra              |
| **Arista** | Desplazamiento | Sin borde lateral, ícono de flecha, estilo más ligero |

**Ejemplo visual:**

```
📍 [Hotel Roma] → 10:00    ← Nodo (con borde azul)
   ➜ [Auto: Hotel → Coliseo] → 10:30    ← Arista (sin borde, con flecha)
📍 [Coliseo Romano] → 11:00    ← Nodo (con borde naranja)
   ➜ [Caminata: Coliseo → Hotel] → 13:00    ← Arista (sin borde, con flecha)
```

---

## 9. Numeración en la UI

Cada evento en el itinerario muestra un número de orden (ej: `#1`, `#2`, ...) que indica su posición en el flujo del viaje. Este número se calcula automáticamente por el algoritmo de dibujo y **no** debe ser almacenado en los datos.

**Ejemplo de numeración:**

```
#1  📍 Casa (Bogotá) → 12:00
#2  ➜ Auto: Casa → Aeropuerto → 13:00
#3  📍 Aeropuerto El Dorado → 15:35
#4  ➜ Avión: BOG → BCN → 08:45 (día siguiente)
#5  📍 Aeropuerto Barcelona → 09:00
...
```

---

## 10. Notas Importantes

1. **Visitas múltiples**: Un nodo puede tener múltiples visitas con diferentes fechas. Cada visita tiene su propio clima, reserva y notas.

2. **Ciclos**: Si un nodo se repite (ej: regreso al mismo hotel), se mantiene una sola instancia del nodo con múltiples visitas. Las aristas de entrada y salida se asignan a la visita correspondiente según la fecha.

3. **Nodos ocultos**: Se pueden usar para representar conexiones técnicas que no son relevantes para el viajero.

4. **Aristas ocultas**: Se pueden usar para representar movimientos que no son relevantes para el viajero (ej: traslados dentro de un aeropuerto).

5. **Migración desde v2.0**: Los nodos existentes con `fechas_estadia` se migran automáticamente a una única visita durante la carga.

6. **Orden de visitas**: El orden de las visitas en el arreglo debe ser cronológico. El algoritmo de dibujo utiliza este orden para asignar las aristas a la visita correcta.

7. **Clima como arreglo**: El clima ahora es un arreglo que permite tener información por día de estadía. La UI puede mostrar solo el primer día como resumen o permitir consultar día por día.

8. **Fechas y horas en aristas**: Todas las aristas deben tener fecha y hora concreta. No se permiten valores vacíos. Las fechas/horas de las aristas no deben solaparse entre sí para un mismo nodo origen.

9. **Validación de fechas**: Las fechas de llegada y salida de las aristas deben estar dentro del rango de fechas de la visita correspondiente del nodo destino y origen respectivamente.

10. **Maps de aeropuertos**: Los enlaces de Google Maps para aeropuertos deben incluir la terminal específica de la aerolínea.

---

## 11. Versiones

| Versión | Cambios principales                                                                                                                                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | Estructura inicial con nodos y aristas                                                                                                                                                                                                                   |
| v2.0    | Añadidos campos detallados (clima, reservas, actividades)                                                                                                                                                                                                |
| v3.0    | **Migración de `fechas_estadia` a `visitas` (arreglo)**<br>Documentación del algoritmo de orden de visita<br>Estandarización de tipos (`casa_origen`)<br>Reglas de `oculto` para `casa_origen`<br>Validaciones de fechas<br>Documentación de ciclos y UI |

---

## 12. Metadatos de Fuentes (Sources)

Para permitir que la interfaz de usuario distinga entre información introducida por el usuario y la generada por inteligencia artificial, se define un **objeto paralelo de metadatos de fuentes** que acompaña a los datos del grafo.

### Propósito

- Marcar visualmente (ej. con un asterisco) los campos que han sido editados o proporcionados por el usuario.
- Asumir que todos los campos no marcados tienen origen `"ai"` (inteligencia artificial).
- Facilitar la auditoría y la edición colaborativa.

### Estructura

Cada archivo de nodo o arista **puede** incluir una propiedad `sources` en el mismo objeto JSON. Esta propiedad replica la estructura del nodo/arista, pero los valores son cadenas que indican la procedencia:

- `"user"`: El campo ha sido proporcionado o modificado por el usuario.
- `"ai"`: El campo ha sido generado automáticamente (por defecto, si no aparece en `sources`).

**Ejemplo de nodo con sources:**

```json
{
  "id": "bog-casa-david",
  "tipo": "casa_origen",
  "nombre": "Casa",
  "direccion": {
    "ciudad": "Bogotá",
    "pais": "Colombia"
  },
  "visitas": [
    {
      "entrada": "2026-07-17",
      "salida": "2026-07-17",
      "notas": "Salir con tiempo para evitar trancones"
    }
  ],
  "sources": {
    "nombre": "user",
    "direccion": {
      "ciudad": "user"
    },
    "visitas": [
      {
        "notas": "user"
      }
    ]
  }
}
```

En este ejemplo:
- `nombre` y `direccion.ciudad` fueron proporcionados por el usuario.
- `pais` no aparece en `sources`, por lo que se asume `"ai"`.
- La nota de la primera visita es `"user"`.

### Reglas para `sources`

1. **Solo se incluyen en `sources` los campos que tienen origen `"user"`**. Los campos `"ai"` se omiten para reducir el tamaño.
2. Si un campo es un objeto o un array, su `sources` debe reflejar la misma estructura anidada.
3. Para arrays, se puede usar el índice numérico (0, 1, ...) para referirse a un elemento específico, o bien, cada elemento puede tener un `_id` único y usar ese `_id` como clave en `sources`. Se recomienda el uso de índices para simplicidad.
4. Si un array tiene múltiples elementos y solo algunos tienen origen `"user"`, se especifica solo el índice correspondiente.
5. La UI, al renderizar, debe consultar `sources[campo]` (o `sources[indice]` para arrays) para determinar el origen y aplicar el marcado correspondiente.

### Consumo en la UI

La interfaz recibe tanto el objeto `data` como el objeto `sources` (si existe). Para cada campo mostrado:

```javascript
const source = data.sources?.nombre || "ai";
if (source === "user") {
  // Mostrar con un asterisco o distintivo
}
```

### Ventajas

- No modifica la estructura principal de datos, manteniéndola limpia.
- Fácil de serializar y transmitir.
- Permite una evolución gradual: los nodos antiguos sin `sources` se tratan como totalmente `"ai"`.
- Escalable a cualquier nivel de anidación.

### Consideraciones adicionales

- Para nodos y aristas generados enteramente por IA, se puede omitir la propiedad `sources` por completo.
- Al editar un campo, la aplicación debe actualizar `sources` para ese campo específico.
- En el archivo raíz (`viaje-raiz.json`), si se desea, se puede incluir un `sources` a nivel de viaje (para `nombre_viaje`, `fechas`, etc.) siguiendo el mismo patrón.


## 13. Regla de Consistencia Temporal de Rutas

Para garantizar que el itinerario sea físicamente realizable y no contenga actividades inalcanzables, se añade la siguiente regla de validación:

**Regla de Secuencia y Alcanzabilidad:**

Para un mismo nodo origen, en un mismo día calendario:

1. Las aristas salientes deben estar ordenadas cronológicamente de menor a mayor hora de salida.
2. Si una de esas aristas tiene como destino un nodo de tipo `aeropuerto` y dicho aeropuerto implica un cambio de ciudad, país o un vuelo internacional (es decir, el viajero abandona la ciudad/región), **esta arista debe ser la última arista saliente de ese nodo en ese día**.
3. Cualquier arista saliente del mismo nodo en el mismo día que tenga una hora posterior a la arista de salida hacia el aeropuerto se considera **inalcanzable** y el grafo será rechazado por el validador.

**Justificación:** Esta regla evita que se programen actividades locales después de que el viajero ya haya partido hacia el aeropuerto para tomar un vuelo, garantizando que el orden de los eventos refleje la ubicación real del viajero en todo momento.

**Ejemplo de error:** Nodo `Hotel-Roma` con dos aristas el 21 de julio:
- `Hotel-Roma → Aeropuerto-FCO` a las 06:30 (vuelo a Zúrich).
- `Hotel-Roma → Estadio-Olímpico` a las 09:00 (tour).

El grafo será rechazado porque la arista al estadio es posterior a la arista al aeropuerto, y el viajero ya no está en el hotel a las 09:00.

**Solución sugerida:** Reubicar la actividad local (Estadio Olímpico) en un día anterior, asegurando que todas las aristas de salida del nodo queden antes de la arista de salida definitiva hacia el aeropuerto. Si no es posible acomodar las actividades, el usuario debe escoger solo una.