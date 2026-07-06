## Definición del Grafo de Viaje (v2.0)

### Estructura General

El grafo está compuesto por **Nodos** y **Aristas** que representan el itinerario completo de un viaje. Cada nodo representa un lugar o evento, y cada arista representa el movimiento entre nodos.

---

## 1. Nodos (Nodes)

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
  "reserva": {                       // Información de reserva (opcional)
    "codigo_reserva": "string",
    "confirmada": boolean,
    "nombre_titular": "string",
    "plataforma": "string",
    "costo": {                       // Costo de la reserva
      "moneda": "string",
      "valor": number,
      "pagado_por": "string",        // Nombre de quien pagó (opcional)
      "incluido_en": "string"        // Si está incluido en otro gasto (opcional)
    }
  },
  "fechas_estadia": {                // Fechas de estadía (requerido para todos los nodos)
    "entrada": "YYYY-MM-DD",         // Fecha de llegada
    "salida": "YYYY-MM-DD"           // Fecha de salida
  },
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
  "clima_esperado": {                // Información climática (opcional)
    "temperatura_promedio": "string",
    "condiciones": "string",
    "probabilidad_lluvia": "string",
    "recomendacion_vestimenta": "string"
  },
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
  "tiempo_estimado_visita": "string", // Tiempo estimado de visita (opcional)
  "notas_adicionales": "string"      // Notas adicionales (opcional)
}
```

### Tipos de Nodos

| Tipo | Descripción | Uso de `oculto` |
|------|-------------|-----------------|
| `aeropuerto` | Aeropuerto | Generalmente `false` |
| `hotel` | Hotel/Alojamiento | Generalmente `false` |
| `casa` | Casa propia | Generalmente `false` |
| `casa_amigo` | Casa de amigo | Generalmente `false` |
| `atraccion` | Atracción turística | Puede ser `true` si no se visita |
| `festival` | Festival/Evento | Generalmente `false` |
| `oficina_alquiler` | Oficina de alquiler de vehículos | Generalmente `false` |
| `casa-origen` | **Nodo inicial del viaje** | Siempre `false` |

### Nodo Especial: Casa-Origen

El nodo de tipo `casa-origen` es el **nodo inicial del viaje**. Debe existir exactamente uno en el grafo.

**Características:**
- Es el punto de partida del viaje
- No tiene aristas entrantes
- Su `fechas_estadia.entrada` marca el inicio del viaje
- Su `fechas_estadia.salida` es la fecha de salida del origen

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

| Modo | Descripción | Ejemplos |
|------|-------------|----------|
| `avion` | Vuelo en avión | Avianca, KLM, Iberia |
| `tren` | Tren | Trenitalia, SBB, NS, Renfe |
| `metro` | Metro | TMB, ATAC |
| `bus` | Autobús | Empresas locales |
| `auto` | Automóvil particular | Alquilado o propio |
| `caminata` | A pie | Trayectos cortos |

---

## 3. Reglas del Grafo

### Reglas Generales

1. **Todo nodo debe tener al menos una arista de entrada o una arista de salida**, excepto:
   - El nodo `casa-origen`: Solo tiene arista de salida (es el inicio del viaje).
   - El nodo final del viaje: Solo tiene arista de entrada (es el fin del viaje).

2. **Todo nodo debe tener `fechas_estadia`** con `entrada` y `salida`.
   - Para atracciones: La fecha de entrada y salida deben ser el mismo día (visita de un día).

3. **El nodo `casa-origen`** es obligatorio y único en el grafo.

### Propiedad `oculto`

La propiedad `oculto` permite ocultar nodos o aristas que no se quieren mostrar en el itinerario visual.

- **Nodos ocultos**: No aparecen en la lista de días del itinerario.
- **Aristas ocultas**: No se muestran como eventos de transporte entre nodos.

**Casos de uso comunes:**
- Un nodo de atracción que no se visita (reservado pero cancelado).
- Una arista de prueba o de respaldo.
- Conexiones entre nodos que no son relevantes para el viajero (ej: nodos de transferencia técnica).

### Ciclos y Bifurcaciones

El grafo puede contener:
- **Ciclos**: Un nodo que se repite (ej: regreso al mismo hotel). En el itinerario, el nodo se muestra una sola vez y la información de "regreso" se maneja con check-in/check-out.
- **Bifurcaciones**: Múltiples nodos saliendo del mismo origen (ej: dos actividades en el mismo día). El orden se define por:
  1. Orden por tipo de nodo: aeropuerto → hotel/casa → actividades
  2. Orden por aristas (topológico)
  3. Orden de aparición en el JSON (fallback)

---

## 4. Archivo Raíz (`viaje-raiz.json`)

El archivo raíz es el punto de entrada del grafo. Contiene las referencias a todos los nodos y aristas.

```json
{
  "version": "string",               // Versión del grafo (ej: "2.0")
  "nombre_viaje": "string",          // Nombre del viaje
  "fechas": {
    "inicio": "YYYY-MM-DD",          // Fecha de inicio del viaje
    "fin": "YYYY-MM-DD"              // Fecha de fin del viaje
  },
  "referencias": {
    "nodos": [                       // Lista de rutas de archivos de nodos
      "nodos/nodo-id.json"
    ],
    "aristas": [                     // Lista de rutas de archivos de aristas
      "aristas/arista-id.json"
    ]
  }
}
```

---

## 5. Ejemplo de Grafo Completo

```
Nodo Inicial: casa-origen (casa-david)
  ↓ [arista: casa-to-aeropuerto]
Nodo: aeropuerto-bog
  ↓ [arista: bog-to-bcn]
Nodo: aeropuerto-bcn
  ↓ [arista: bcn-airport-to-hotel]
Nodo: hotel-bcn
  ↓ [arista: bcn-hotel-to-airport]
Nodo: aeropuerto-bcn
  ↓ [arista: bcn-to-roma]
Nodo: aeropuerto-fco
  ↓ [arista: fco-to-hotel]
Nodo: hotel-roma
  ↓ [arista: hotel-to-coliseo]     ← Nueva arista
Nodo: coliseo (atracción)
  ↓ [arista: coliseo-to-hotel?]    ← Arista de retorno (NO necesaria)
  ↓ [arista: hotel-to-aeropuerto]   ← Desde el hotel al aeropuerto
Nodo: aeropuerto-fco
  ↓ [arista: fco-to-zrh]
Nodo: aeropuerto-zrh
  ↓ [arista: zrh-to-amiga]
Nodo: casa-amiga-zrh
  ↓ [arista: amiga-to-airport]
Nodo: aeropuerto-zrh
  ↓ [arista: zrh-to-ams]
Nodo: aeropuerto-ams
  ↓ [arista: ams-to-hotel]
Nodo: hotel-ams
  ↓ [arista: hotel-to-airport]
Nodo: aeropuerto-ams
  ↓ [arista: ams-to-ham]
Nodo: aeropuerto-ham
  ↓ [arista: ham-to-hotel]
Nodo: hotel-ham
  ↓ [arista: hotel-to-sixt]
Nodo: sixt-ham
  ↓ [arista: sixt-to-wacken]
Nodo: wacken-festival
  ↓ [arista: wacken-to-sixt]
Nodo: sixt-ham
  ↓ [arista: sixt-to-ham-airport]
Nodo: aeropuerto-ham
  ↓ [arista: ham-to-mad]
Nodo: aeropuerto-mad
  ↓ [arista: mad-to-hotel]
Nodo: hotel-mad
  ↓ [arista: hotel-to-airport]
Nodo: aeropuerto-mad
  ↓ [arista: mad-to-bog]
Nodo: aeropuerto-bog (fin del viaje)
```

---

## 6. Notas Importantes

1. **Nodos sin fecha**: Todos los nodos deben tener `fechas_estadia`. Para atracciones, `entrada` y `salida` deben ser el mismo día.

2. **Ciclos**: Si un nodo se repite (ej: regreso al mismo hotel), se mantiene una sola instancia del nodo con una sola arista de entrada y una de salida. La información de "regreso" se maneja con check-in/check-out.

3. **Nodos ocultos**: Se pueden usar para representar conexiones técnicas que no son relevantes para el viajero.

4. **Aristas ocultas**: Se pueden usar para representar movimientos que no son relevantes para el viajero (ej: traslados dentro de un aeropuerto).