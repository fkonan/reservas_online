# GET /api/categorias-por-sede/{sede_id} — Guía de consumo para el frontend Angular

> Endpoint que devuelve todas las categorías de servicios con sus servicios publicados,
> ordenadas según el orden definido por el administrador del ERP.
> Requiere el header de autenticación configurado en el middleware `validar_token`.

---

## Endpoint

```
GET /api/categorias-por-sede/{sede_id}
Authorization: Bearer {token}
```

| Parámetro  | Tipo    | Requerido | Descripción        |
|------------|---------|-----------|--------------------|
| `sede_id`  | integer | ✅        | ID de la sede      |

### Ejemplo de request

```http
GET /api/categorias-por-sede/3
Authorization: Bearer {token}
```

---

## Cambios respecto a la versión anterior

| Campo                     | Antes                       | Ahora                                            |
|---------------------------|-----------------------------|--------------------------------------------------|
| Orden de categorías       | Alfabético por `categoria`  | Por `orden ASC`, fallback alfabético             |
| Orden de servicios        | Alfabético por `nombre_comercial` | Por `servicio_web.orden ASC`, fallback alfabético |
| `slug` en cada servicio   | ❌ No incluido              | ✅ Incluido — usar para routing al detalle       |
| `orden` en categoría      | ❌ No incluido              | ✅ Incluido                                      |
| `orden` en servicio       | ❌ No incluido              | ✅ Incluido                                      |

> ⚠️ **Importante**: El servidor garantiza el orden. El frontend **NO debe** re-ordenar
> con `.sort()` en el cliente. Renderizar los arrays en el orden exacto en que llegan.

---

## Respuesta exitosa (HTTP 200)

```json
{
  "success": true,
  "total_categorias": 2,
  "data": [
    {
      "id": 1,
      "categoria": "ALISADOS",
      "orden": 1,
      "servicios": [
        {
          "id": 5,
          "nombre_comercial": "Sistema Liso HD OLED",
          "slug": "sistema-liso-hd-oled",
          "orden": 1,
          "duracion": "6h",
          "descripcion": "Descripción del servicio",
          "imagen": "/imagenes/servicios/liso-hd.jpg",
          "tipo_servicio_id": 1,
          "iconos": null,
          "obsequio": null,
          "recomendaciones": null
        },
        {
          "id": 8,
          "nombre_comercial": "Liso Nanoplastia",
          "slug": "liso-nanoplastia",
          "orden": 2,
          "duracion": "4h",
          "descripcion": null,
          "imagen": null,
          "tipo_servicio_id": 1,
          "iconos": null,
          "obsequio": null,
          "recomendaciones": null
        }
      ]
    },
    {
      "id": 3,
      "categoria": "COLORIMETRÍA",
      "orden": 2,
      "servicios": [...]
    }
  ]
}
```

---

## Errores

| HTTP | `success` | Causa                                   |
|------|-----------|-----------------------------------------|
| 401  | —         | Token inválido o ausente                |
| 404  | `false`   | Sede no existe                          |

---

## Filtros automáticos del servidor

| Condición                         | Campo evaluado                  |
|-----------------------------------|---------------------------------|
| Servicio asignado a la sede       | `servicios_sede.sede_id`        |
| Servicio publicado en web         | `servicio_web.published = 1`    |
| Orden de categorías               | `categoria_servicio.orden ASC`  |
| Orden de servicios (dentro de c.) | `servicio_web.orden ASC`        |

---

## Modelos TypeScript actualizados

```ts
// ─── Servicio dentro de una categoría ────────────────────────────────────────
export interface ServicioCard {
  id: number;
  nombre_comercial: string;
  slug: string;               // usar para routing al detalle del servicio
  orden: number;
  duracion: string | null;
  descripcion: string | null;
  imagen: string | null;
  tipo_servicio_id: number;
  iconos: string | null;
  obsequio: string | null;
  recomendaciones: string | null;
}

// ─── Categoría con sus servicios ─────────────────────────────────────────────
export interface CategoriaConServicios {
  id: number;
  categoria: string;
  orden: number;
  servicios: ServicioCard[];
}

// ─── Respuesta completa del endpoint ─────────────────────────────────────────
export interface ApiResponseCategorias {
  success: boolean;
  total_categorias: number;
  data: CategoriaConServicios[];
}
```

---

## Servicio Angular — HttpClient

```ts
// categorias.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseCategorias, CategoriaConServicios } from './models/categorias.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {

  private readonly API_URL = 'https://tudominio.com/api';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
  }

  getCategoriasSede(sedeId: number): Observable<CategoriaConServicios[]> {
    return this.http
      .get<ApiResponseCategorias>(`${this.API_URL}/categorias-por-sede/${sedeId}`, { headers: this.headers })
      .pipe(map(res => res.data));
      // ← NO aplicar .sort() aquí — el orden viene garantizado del servidor
  }
}
```

---

## Routing al detalle del servicio

Con el campo `slug` ya disponible en cada servicio, la navegación al detalle es:

```ts
// En el template
<a [routerLink]="['/servicios', servicio.slug]">{{ servicio.nombre_comercial }}</a>

// O programático
this.router.navigate(['/servicios', servicio.slug]);
```

El detalle completo del servicio se obtiene con el endpoint:
```
GET /api/servicio-web/{id}
```
> Ver `especificaciones-api-servicio-por-id.md` para la documentación completa de ese endpoint.

---

## Cambios necesarios en Angular

### 1. Actualizar interfaces/modelos

Agregar a `ServicioCard`:
- `slug: string`
- `orden: number`

Agregar a `CategoriaConServicios`:
- `orden: number`

### 2. Eliminar cualquier `.sort()` del lado cliente

Si el servicio o componente tiene código como:
```ts
// ❌ ELIMINAR estas líneas
categorias.sort((a, b) => a.categoria.localeCompare(b.categoria));
servicios.sort((a, b) => a.nombre_comercial.localeCompare(b.nombre_comercial));
```
El servidor ya entrega los datos en el orden correcto.

### 3. Usar `slug` para navegación al detalle

```ts
// ✅ CORRECTO — usar slug
<a [routerLink]="['/servicios', servicio.slug]">{{ servicio.nombre_comercial }}</a>

// ❌ ANTERIOR — evitar usar ID en la URL
<a [routerLink]="['/servicios', servicio.id]">{{ servicio.nombre_comercial }}</a>
```

### 4. Template recomendado para listar categorías/servicios

```html
<!-- categorias-lista.component.html -->
<ng-container *ngFor="let categoria of categorias">
  <section class="categoria-seccion">
    <h2 class="categoria-titulo">{{ categoria.categoria }}</h2>

    <div class="servicios-grid">
      <!-- Los servicios ya llegan en el orden correcto — no reordenar -->
      <div class="servicio-card" *ngFor="let servicio of categoria.servicios">
        <a [routerLink]="['/servicios', servicio.slug]">
          <img *ngIf="servicio.imagen" [src]="servicio.imagen" [alt]="servicio.nombre_comercial">
          <h3>{{ servicio.nombre_comercial }}</h3>
          <span *ngIf="servicio.duracion" class="duracion-badge">{{ servicio.duracion }}</span>
        </a>
      </div>
    </div>
  </section>
</ng-container>
```

---

## Cómo funciona el ordenamiento (para referencia del equipo)

El orden de visualización lo controla el equipo de administración desde el panel ERP.
Los cambios se reflejan automáticamente en la próxima llamada al endpoint, sin cambios en el cliente Angular.

| Quién controla el orden | Dónde se edita en el admin             | Efecto en el frontend           |
|-------------------------|----------------------------------------|---------------------------------|
| Admin — categorías      | Parametrización → Categorías → campo **Posición** | Orden en que aparecen las categorías |
| Admin — servicios       | Servicio → Configuración Web → campo **Posición** | Orden dentro de su categoría   |

> Si dos elementos tienen el mismo número de posición, el fallback es orden alfabético.

---

## Flujo completo

```
Angular                                     Laravel API
──────                                      ───────────
getCategoriasSede(sedeId)
  → GET /api/categorias-por-sede/{sedeId}
  ← 200 { success:true, total_categorias:N, data:[...] }
        │
        └─ data[] (categorías ya ordenadas por orden ASC)
              └─ categoria.servicios[] (servicios ya ordenados por orden ASC)
                    └─ servicio.slug → [routerLink]="/servicios/sistema-liso-hd-oled"
                             → GET /api/servicio-web/{id}
```
