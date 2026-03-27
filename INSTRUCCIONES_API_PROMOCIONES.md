# Instrucciones para Consumir API de Promociones

## Endpoint: Obtener Promociones Vigentes

**Descripción**: Este endpoint retorna únicamente las promociones activas que están dentro del rango de fechas válido (fecha_inicio ≤ hoy ≤ fecha_fin) y con estado activo.

### Detalles de la Petición

- **URL**: `{BASE_URL}/api/promociones-vigentes`
- **Método**: `GET`
- **Autenticación**: Requerida mediante header `Authorization`
- **Headers necesarios**:
  ```
  Authorization: Bearer {TOKEN}
  Accept: application/json
  ```

### Ejemplo de Petición

```javascript
// JavaScript/Node.js con Axios
const response = await axios.get('https://tudominio.com/api/promociones-vigentes', {
  headers: {
    'Authorization': 'Bearer TU_TOKEN_AQUI',
    'Accept': 'application/json'
  }
});
```

```python
# Python con requests
import requests

headers = {
    'Authorization': 'Bearer TU_TOKEN_AQUI',
    'Accept': 'application/json'
}

response = requests.get('https://tudominio.com/api/promociones-vigentes', headers=headers)
data = response.json()
```

```bash
# cURL
curl -X GET "https://tudominio.com/api/promociones-vigentes" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Accept: application/json"
```

### Estructura de la Respuesta

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "servicio": "Corte de Cabello",
      "servicio_id": 5,
      "tipo_promocion": "descuento",
      "titulo": "Super Descuento Marzo",
      "subtitulo": "¡Aprovecha esta oferta especial!",
      "precio_promocion": null,
      "porcentaje_descuento": 25,
      "descripcion": "Descuento válido para cortes de lunes a viernes",
      "imagen_url": "https://tudominio.com/storage/promociones/imagen123.jpg",
      "boton_texto": "Agendar Ahora",
      "fecha_inicio": "2026-03-01",
      "fecha_fin": "2026-03-31",
      "orden": 1,
      "items": [
        {
          "contenido": "Incluye lavado gratis",
          "orden": 1
        },
        {
          "contenido": "Estilizado incluido",
          "orden": 2
        }
      ]
    }
  ],
  "total": 1
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Indica si la petición fue exitosa |
| `data` | array | Lista de promociones vigentes |
| `total` | integer | Cantidad total de promociones retornadas |

#### Objeto Promoción:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID único de la promoción |
| `servicio` | string/null | Nombre del servicio asociado |
| `servicio_id` | integer | ID del servicio |
| `tipo_promocion` | string | Tipo: `"descuento"`, `"precio_especial"` o `"combo"` |
| `titulo` | string | Título principal de la promoción |
| `subtitulo` | string/null | Subtítulo descriptivo |
| `precio_promocion` | float/null | Precio especial (solo si tipo es `precio_especial` o `combo`) |
| `porcentaje_descuento` | integer/null | Porcentaje de descuento (solo si tipo es `descuento` o `combo`) |
| `descripcion` | text/null | Descripción detallada |
| `imagen_url` | string/null | URL completa de la imagen promocional |
| `boton_texto` | string/null | Texto para el botón de acción |
| `fecha_inicio` | date | Fecha de inicio de vigencia (formato: YYYY-MM-DD) |
| `fecha_fin` | date | Fecha de fin de vigencia (formato: YYYY-MM-DD) |
| `orden` | integer | Orden de visualización |
| `items` | array | Lista de ítems/beneficios adicionales |

#### Objeto Item:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `contenido` | string | Descripción del ítem (beneficio, producto, servicio incluido) |
| `orden` | integer | Orden de visualización del ítem |

### Tipos de Promoción

1. **`descuento`**: Promoción con porcentaje de descuento
   - Usa el campo `porcentaje_descuento`
   - `precio_promocion` será `null`

2. **`precio_especial`**: Promoción con precio fijo especial
   - Usa el campo `precio_promocion`
   - `porcentaje_descuento` será `null`

3. **`combo`**: Paquete combinado con precio especial
   - Puede tener ambos campos: `precio_promocion` y `porcentaje_descuento`
   - Los `items` contienen los productos/servicios incluidos

### Filtrado Automático

El endpoint aplica automáticamente los siguientes filtros:

- **Estado**: Solo promociones con `estado = 1` (activas)
- **Fecha inicio**: `fecha_inicio <= fecha_actual`
- **Fecha fin**: `fecha_fin >= fecha_actual`
- **Ordenamiento**: Por campo `orden` ascendente, luego por `id` descendente

### Manejo de Errores

```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Códigos HTTP posibles**:
- `200`: Respuesta exitosa (puede retornar array vacío si no hay promociones vigentes)
- `401`: No autorizado (token inválido o faltante)
- `500`: Error interno del servidor

### Recomendaciones de Uso

1. **Cacheo**: Considera implementar caché de 5-15 minutos para reducir llamadas al servidor
2. **Gestión de imágenes**: Valida que `imagen_url` no sea `null` antes de mostrar imágenes
3. **Visualización de items**: Los items están ordenados por el campo `orden` - respeta este orden al mostrarlos
4. **Tipos condicionales**: Verifica el `tipo_promocion` para determinar qué campo usar (`precio_promocion` vs `porcentaje_descuento`)
5. **Validación de fechas**: Aunque el backend filtra por fecha, puedes mostrar "Válido hasta: {fecha_fin}" en tu UI

### Ejemplo de Implementación

```javascript
async function obtenerPromocionesVigentes() {
  try {
    const response = await fetch('https://tudominio.com/api/promociones-vigentes', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Accept': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`Se encontraron ${result.total} promociones vigentes`);
      
      result.data.forEach(promo => {
        console.log(`📢 ${promo.titulo} - ${promo.servicio}`);
        
        // Mostrar descuento o precio según el tipo
        if (promo.tipo_promocion === 'descuento') {
          console.log(`   💰 ${promo.porcentaje_descuento}% de descuento`);
        } else if (promo.tipo_promocion === 'precio_especial') {
          console.log(`   💰 Precio especial: $${promo.precio_promocion}`);
        }
        
        // Mostrar items incluidos
        if (promo.items.length > 0) {
          console.log('   Incluye:');
          promo.items.forEach(item => {
            console.log(`   ✓ ${item.contenido}`);
          });
        }
      });
    }
  } catch (error) {
    console.error('Error al obtener promociones:', error);
  }
}
```

---

**Nota**: Reemplaza `{BASE_URL}` con la URL base de tu aplicación y `{TOKEN}` con tu token de autenticación válido proporcionado por el sistema.
