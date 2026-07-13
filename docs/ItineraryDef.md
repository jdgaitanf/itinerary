# Definición del Grafo de Viaje (v3.0)

## Estructura General

El grafo está compuesto por **Nodos** y **Aristas** que representan el itinerario completo de un viaje. Cada nodo representa un lugar o evento, y cada arista representa el movimiento entre nodos.

---

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
      "clima": {                     // Clima específico de esta visita (opcional)
        "temperatura_promedio": "string",
        "condiciones": "string",
        "probabilidad_lluvia": "string",
        "recomendacion_vestimenta": "string"
      },
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
    "fecha_salida": "YYYY-MM-DD",    // Fecha de salida
    "hora_salida_origen": "HH:MM",   // Hora de salida del origen
    "hora_llegada_destino": "HH:MM", // Hora de llegada al destino
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

## 7. Algoritmo de Orden de Visita

El orden de visita se construye en dos fases:

### Fase 1 - BFS inicial:

- Se recorre el grafo desde el nodo `casa_origen` en anchura (BFS)
- Se asignan índices secuenciales a nodos y aristas
- Se generan las aristas en orden de: fecha_salida → hora_salida_origen → ID

### Fase 2 - Reordenamiento (Algoritmo de Dibujo):

El algoritmo permite que un nodo aparezca **una sola vez** en el itinerario, mientras que las aristas se dibujan en el orden en que se "descubren" durante el recorrido.

**Pasos del algoritmo:**

1. **Dibujar el primer nodo** (casa_origen): Se agrega al nuevo orden

2. **Mientras haya nodos pendientes:**
   - Sea N el nodo actual, y PN el siguiente nodo en la lista original
   - **Si existe arista directa N → PN**: Dibujar la arista, luego dibujar PN (PN pasa a ser N)
   - **Si N tiene aristas disponibles**: Tomar la primera (A0), dibujar A0, luego dibujar su destino (ND)
   - **Si ND es PN**: Volver al paso 2 (PN ya está dibujado)
   - **Si ND no es PN**: Continuar desde ND (paso 3)

3. **Si N no tiene aristas disponibles**: Saltar al siguiente nodo pendiente

**Ejemplo de reordenamiento:**

```
Orden original (BFS):  casa → hotel → aeropuerto → atracción
                        ↓         ↓          ↓          ↓
Aristas disponibles:   casa→hotel, hotel→aeropuerto, hotel→atracción

Nuevo orden (dibujo):
casa → [arista casa→hotel] → hotel → [arista hotel→atracción] → atracción → [arista hotel→aeropuerto] → aeropuerto
```

Esto permite representar viajes que regresan a lugares ya visitados (ej: hotel → atracción → hotel → aeropuerto).

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

---

## 11. Versiones

| Versión | Cambios principales                                                                                                                                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | Estructura inicial con nodos y aristas                                                                                                                                                                                                                   |
| v2.0    | Añadidos campos detallados (clima, reservas, actividades)                                                                                                                                                                                                |
| v3.0    | **Migración de `fechas_estadia` a `visitas` (arreglo)**<br>Documentación del algoritmo de orden de visita<br>Estandarización de tipos (`casa_origen`)<br>Reglas de `oculto` para `casa_origen`<br>Validaciones de fechas<br>Documentación de ciclos y UI |
