Entendido. Te doy la definición formal del **grafo de viaje** que hemos construido. Esta definición será la base para generar el itinerario de forma estructurada y escalable.

---

## DEFINICIÓN DEL GRAFO DE VIAJE

### 1. Propósito
Representar un viaje como un **grafo dirigido acíclico** donde:
- **Nodos**: lugares físicos (ciudades, aeropuertos, hoteles, atracciones, oficinas, festivales, etc.).
- **Aristas**: desplazamientos entre nodos (vuelos, trenes, autos, caminatas, etc.).

El grafo permite generar automáticamente un itinerario cronológico, calculando horarios, costos, y recomendaciones logísticas.

---

### 2. Estructura del Grafo

#### Objeto Raíz
```json
{
  "version": "1.0",
  "nombre_viaje": "string",
  "fechas": {
    "inicio": "YYYY-MM-DD",
    "fin": "YYYY-MM-DD"
  },
  "nodos": [ /* array de objetos Nodo */ ],
  "aristas": [ /* array de objetos Arista */ ]
}
```

---

### 3. Definición de Nodo (Lugar)

Un nodo representa un lugar físico con todas sus propiedades relevantes para la planificación.

#### Campos obligatorios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único del nodo (ej. `bcn-hotel-upper-diagonal`) |
| `tipo` | string | Clasificación del lugar: `aeropuerto`, `hotel`, `atraccion`, `festival`, `oficina_alquiler`, `casa_amigo`, `casa` |
| `nombre` | string | Nombre legible del lugar |
| `direccion` | objeto | Dirección postal y coordenadas |
| `reserva` | objeto | Información de la reserva (si aplica) |
| `fechas_estadia` | objeto | Fechas de entrada y salida (si aplica) |

#### Campos opcionales
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `codigo_iata` | string | Código IATA (solo para aeropuertos) |
| `contacto` | objeto | Teléfono, email, web |
| `horarios` | objeto | Check-in, check-out, atención, apertura/cierre |
| `actividades` | array | Lista de actividades planificadas en el lugar |
| `clima_esperado` | objeto | Temperatura, condiciones, probabilidad de lluvia, recomendación de vestimenta |
| `equipaje_recomendado` | array | Lista de ítems específicos para ese lugar |
| `idioma_principal` | string | Idioma predominante |
| `moneda_local` | objeto | Código, símbolo, tasa de referencia |
| `reglas_especiales` | array | Normas específicas del lugar |
| `imagenes` | array | URLs de imágenes de referencia |
| `tiempo_estimado_visita` | string | Tiempo sugerido para permanecer en el lugar |
| `notas_adicionales` | string | Comentarios libres |

#### Estructura de `direccion`
```json
{
  "calle": "string (opcional)",
  "ciudad": "string",
  "codigo_postal": "string (opcional)",
  "pais": "string",
  "coordenadas": {
    "lat": number,
    "lng": number
  },
  "maps_link": "string (URL)"
}
```

#### Estructura de `reserva`
```json
{
  "codigo_reserva": "string (opcional)",
  "confirmada": boolean,
  "nombre_titular": "string",
  "plataforma": "string (opcional)"
}
```

#### Estructura de `actividades` (array)
```json
{
  "id": "string",
  "nombre": "string",
  "tipo": "string (tour, museo, estadio, gastronomia, etc.)",
  "duracion_estimada": "string",
  "horario_recomendado": "string (HH:MM)",
  "url_oficial": "string (opcional)",
  "reserva": {
    "codigo_reserva": "string (opcional)",
    "requiere_reserva": boolean,
    "fecha_reservada": "YYYY-MM-DD (opcional)",
    "hora_reservada": "HH:MM (opcional)"
  },
  "notas": "string (opcional)"
}
```

---

### 4. Definición de Arista (Desplazamiento)

Una arista representa el movimiento desde un nodo origen a un nodo destino.

#### Campos obligatorios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único de la arista |
| `origen_id` | string | ID del nodo origen |
| `destino_id` | string | ID del nodo destino |
| `modo` | string | `avion`, `tren`, `bus`, `metro`, `auto`, `caminata`, `taxi`, `transbordador` |
| `transporte` | objeto | Detalles del medio de transporte |
| `tiempo_estimado` | objeto | Tiempo de viaje en minutos, rango y con holgura |
| `logistica_salida` | objeto | Fechas y horas de salida/llegada |

#### Campos opcionales
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `reglas_holgura` | objeto | Tiempo requerido antes de un vuelo, etc. |
| `costos` | objeto | Moneda, valor, si está incluido en otro ítem |
| `notas` | string | Comentarios adicionales |

#### Estructura de `transporte`
```json
{
  "compania": "string (opcional)",
  "tipo_vehiculo": "string (opcional)",
  "linea": "string (opcional)",
  "numero_vuelo": "string (opcional)",
  "terminal_origen": "string (opcional)",
  "terminal_destino": "string (opcional)",
  "puerta_embarque": "string (opcional)",
  "codigo_reserva_confirmacion": "string (opcional)",
  "asiento_confirmado": "string (opcional)",
  "detalles": "string (opcional)"
}
```

#### Estructura de `tiempo_estimado`
```json
{
  "minutos": number,
  "rango": "string (ej. '40-45')",
  "con_holgura": number (minutos adicionales sugeridos)
}
```

#### Estructura de `logistica_salida`
```json
{
  "fecha_salida": "YYYY-MM-DD",
  "hora_salida_origen": "HH:MM",
  "hora_llegada_destino": "HH:MM",
  "hora_salida_efectiva_transporte": "HH:MM (opcional)"
}
```

#### Estructura de `costos`
```json
{
  "moneda": "string (COP, EUR, USD, etc.)",
  "valor": number,
  "incluido_en": "string (opcional)",
  "pagado_por": "string (opcional, ej. David, Steven, Ambos)"
}
```

---

### 5. Reglas para generar el itinerario

1. **Orden cronológico**:
   - Se ordenan los nodos según la secuencia de aristas, comenzando desde un nodo inicial (ej. `bog-casa-david`).
   - Para cada arista, se calcula la hora de salida del nodo origen y la hora de llegada al nodo destino.
   - Si la arista es un vuelo, se aplica la regla de holgura para sugerir la hora de salida del hotel/casa.

2. **Agrupación por día**:
   - Cada nodo y arista se asigna a un día según su fecha.
   - Si hay actividades dentro de un nodo, se muestran en el día correspondiente.

3. **Mostrar información relevante**:
   - Para cada nodo: nombre, dirección, horarios (check-in/out, apertura/cierre), actividades, reservas.
   - Para cada arista: modo, transporte, tiempo estimado, costo (si se proporciona).

4. **Cálculo de holgura**:
   - Si una arista tiene `reglas_holgura.tiempo_requerido`, se resta del tiempo de llegada al aeropuerto para obtener la hora de salida del nodo origen.
   - Ejemplo: vuelo a las 08:00, holgura 3h, tiempo de viaje 40min → salida del hotel a las 04:20.

5. **Inclusión de campos opcionales**:
   - Solo se muestran los campos que tienen valor (no se incluyen strings vacíos o arrays vacíos).

---

### 6. Consideraciones adicionales

- **Terminales y puertas**: En aeropuertos, la dirección debe incluir la terminal específica (ej. "Terminal 1 (T1)") y, si se conoce, la puerta de embarque. Esto evita pérdidas de tiempo.
- **Clima**: Se puede usar para recomendar equipaje, pero no es obligatorio.
- **Costos**: Se registran cuando se conocen; si no, se omiten.
- **Actividades**: Se pueden asociar a un nodo o a un día específico dentro del nodo.

---

Esta definición del grafo es la base para construir cualquier itinerario de viaje de manera estructurada y escalable. Las reglas de generación aseguran que el resultado sea claro, preciso y útil para la planificación.