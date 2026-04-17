# API de Servicios — Guía de consumo para el frontend

> Todos los endpoints están bajo el prefijo `/api/` y requieren el header de autenticación configurado en el middleware `validar_token`.

---

## Flujo completo del frontend (página de servicios)

```
1. GET  /api/categorias-por-sede/{sede_id}
         ↓ El usuario selecciona una categoría
2. POST /api/servicios-por-categoria
         ↓ El usuario selecciona un servicio
3. Renderizar detalle del servicio con la data de `web.secciones`
```

Solo se devuelven servicios con **`published = 1`** en su configuración web y **`estado = 1`** en el ERP.

---

## 1. `GET /api/categorias-por-sede/{sede_id}`

Devuelve las categorías de servicios disponibles en una sede, incluyendo únicamente las que tienen al menos un servicio **activo y publicado**.

### Parámetros de ruta

| Campo     | Tipo    | Requerido | Descripción              |
|-----------|---------|-----------|--------------------------|
| `sede_id` | integer | ✅        | ID de la sede            |

### Ejemplo de request

```
GET /api/categorias-por-sede/1
Authorization: Bearer {token}
```

### Ejemplo de respuesta

```json
{
  "success": true,
  "sede_id": 1,
  "total_categorias": 3,
  "data": [
    {
      "id": 2,
      "categoria": "Sistemas de Alisado / Antifrizz",
      "total_servicios": 4,
      "servicios": [
        {
          "id": 5,
          "nombre_comercial": "Sistema de Liso HD OLED",
          "descripcion": "...",
          "duracion": "6h",
          "tipo_servicio_id": 1,
          "web": {
            "slug": "sistema-liso-hd-oled",
            "titulo_publico": "SISTEMA DE LISO HD OLED",
            "subtitulo": null,
            "descripcion_corta": "Formulado con activos super premium...",
            "imagen_portada": "/storage/imagenes/servicios-web/abc.jpg",
            "mostrar_agenda": true
          },
          "atributos": [
            { "id": 1, "nombre": "Libre de formol",  "slug": "libre-formol",  "icono": "/storage/iconos/libre-formol.png" },
            { "id": 2, "nombre": "Vegano",            "slug": "vegano",        "icono": "/storage/iconos/vegano.png" },
            { "id": 4, "nombre": "Apto embarazadas",  "slug": "apto-embarazadas", "icono": null }
          ]
        }
      ]
    }
  ]
}
```

### Uso en frontend

- Renderizar el selector/dropdown de categorías con `data[].categoria`.
- Usar `data[].id` como `categoria_id` para el siguiente endpoint.
- Se puede mostrar un preview de cada servicio con `servicios[].web.imagen_portada` y `servicios[].web.titulo_publico`.

---

## 2. `POST /api/servicios-por-categoria`

Devuelve **todos los servicios publicados** de una categoría en una sede, con su configuración web completa (secciones, atributos, slug, etc.).

### Body (JSON o form-data)

| Campo        | Tipo    | Requerido | Descripción                    |
|--------------|---------|-----------|--------------------------------|
| `sede_id`    | integer | ✅        | ID de la sede                  |
| `categoria_id`| integer | ✅       | ID de la categoría seleccionada|

### Ejemplo de request

```http
POST /api/servicios-por-categoria
Content-Type: application/json
Authorization: Bearer {token}

{
  "sede_id": 1,
  "categoria_id": 2
}
```

### Estructura de la respuesta

```json
{
  "success": true,
  "sede_id": 1,
  "categoria_id": 2,
  "total": 4,
  "data": [
    {
      "id": 5,
      "servicio": "LISO HD OLED",
      "nombre_comercial": "Sistema de Liso HD OLED",
      "duracion": "6h",
      "tipo_servicio_id": 1,
      "categoria_id": 2,
      "sede_id": 1,

      "web": {
        "id": 3,
        "slug": "sistema-liso-hd-oled",
        "titulo_publico": "SISTEMA DE LISO HD OLED",
        "subtitulo": null,
        "descripcion_corta": "Formulado con activos super premium y libre de formol...",
        "imagen_portada": "/storage/imagenes/servicios-web/abc.jpg",
        "texto_boton_agenda": "AGENDA AQUI",
        "mostrar_agenda": true,
        "published": true,
        "secciones": [
          {
            "id": 10,
            "tipo_seccion": "descripcion",
            "titulo": null,
            "subtitulo": null,
            "contenido_json": {
              "parrafos": [
                "El Sistema Liso HD OLED es un alisante profesional de nueva generación...",
                "Su tecnología HD20R-FIBER sella la fibra..."
              ],
              "duracion": "6h",
              "resultado": "Liso con brillo espejo"
            },
            "orden": 0,
            "usa_acordeon": false
          },
          {
            "id": 11,
            "tipo_seccion": "precios_referencia",
            "titulo": "Nuestras Medidas",
            "subtitulo": null,
            "contenido_json": {
              "moneda": "COP",
              "descuento_pct": 20,
              "items": [
                { "label": "Talla S",   "precio": 305000, "precio_descuento": 259250 },
                { "label": "Talla M",   "precio": 335000, "precio_descuento": 284750 },
                { "label": "Talla L",   "precio": 370000, "precio_descuento": 314500 },
                { "label": "Talla XL",  "precio": 400000, "precio_descuento": 340000 },
                { "label": "Talla XXL", "precio": 440000, "precio_descuento": 374000 }
              ]
            },
            "orden": 1
          },
          {
            "id": 12,
            "tipo_seccion": "obsequios",
            "titulo": "Obsequios",
            "subtitulo": null,
            "contenido_json": {
              "items": [
                "Alisado fotónico",
                "Relleno protéico MSC",
                "Sesión de crioterapia",
                "Despunte con máquina",
                "Mascarilla HD Infinity de 300gr"
              ]
            },
            "orden": 2
          },
          {
            "id": 13,
            "tipo_seccion": "recomendaciones",
            "titulo": "Recomendaciones previas antes de agendar el procedimiento",
            "subtitulo": null,
            "contenido_json": {
              "momento": "antes",
              "items": [
                "El día del procedimiento no aplicar crema de peinar...",
                "No haber estado expuesto a piscina o mar durante los últimos 15 días."
              ]
            },
            "orden": 3
          },
          {
            "id": 14,
            "tipo_seccion": "promocion",
            "titulo": "Promoción vigente",
            "subtitulo": null,
            "contenido_json": {
              "titulo_destacado": "PROMO AMIGA -20%",
              "descripcion": "La promoción se activa cuando dos personas apartan su cita con abono el mismo día.",
              "condiciones": [
                "Cada una puede asistir en días y horarios diferentes.",
                "Al cumplir con estas condiciones, se aplica el descuento a cada una."
              ],
              "vigencia": "Promoción vigente el mes de Octubre"
            },
            "orden": 4
          },
          {
            "id": 15,
            "tipo_seccion": "garantia",
            "titulo": "Garantía",
            "subtitulo": null,
            "contenido_json": {
              "dias": 20,
              "texto": "Nuestros sistemas de alisado cuentan con una garantía de 20 días.",
              "condiciones": []
            },
            "orden": 5
          },
          {
            "id": 16,
            "tipo_seccion": "tribu_vip",
            "titulo": "Tribu VIP",
            "subtitulo": null,
            "contenido_json": {
              "descripcion": "No olvides presentar tu insignia SOY TRIBU SOS para acumular descuentos.",
              "beneficios": []
            },
            "orden": 6
          },
          {
            "id": 17,
            "tipo_seccion": "diagnostico",
            "titulo": "Diagnóstico profesional obligatorio",
            "subtitulo": null,
            "contenido_json": {
              "obligatorio": true,
              "texto": "Todos nuestros sistemas requieren diagnóstico de un profesional capacitado.",
              "instrucciones": []
            },
            "orden": 7
          }
        ]
      },

      "atributos": [
        { "id": 1, "nombre": "Libre de formol",   "slug": "libre-formol",   "icono": null, "descripcion": "Sin formaldehído" },
        { "id": 2, "nombre": "Vegano",             "slug": "vegano",         "icono": null, "descripcion": "100% vegano" },
        { "id": 4, "nombre": "Apto embarazadas",   "slug": "apto-embarazadas", "icono": null, "descripcion": "Seguro durante el embarazo" }
      ]
    }
  ]
}
```

---

## Catálogo de tipos de sección (`tipo_seccion`)

El frontend debe saber cómo renderizar cada tipo según su `contenido_json`.

### Campo `usa_acordeon`

Cada sección incluye el campo `usa_acordeon: boolean`. Si es `true`, el frontend debe renderizar esa sección como un **panel acordeón expandible/colapsable**. Si es `false`, renderizarla como bloque de contenido fijo (párrafo, lista, etc.).

```json
{
  "id": 11,
  "tipo_seccion": "recomendaciones",
  "titulo": "Recomendaciones antes del procedimiento",
  "subtitulo": null,
  "contenido_json": { "momento": "antes", "items": ["..."] },
  "orden": 3,
  "usa_acordeon": true
}
```

#### Lógica de renderizado recomendada (Angular)

```ts
// En la plantilla del componente de sección
<ng-container *ngIf="seccion.usa_acordeon; else bloqueNormal">
  <mat-expansion-panel> <!-- o tu componente acordeón -->
    <mat-expansion-panel-header>
      <mat-panel-title>{{ seccion.titulo }}</mat-panel-title>
    </mat-expansion-panel-header>
    <app-seccion-content [tipo]="seccion.tipo_seccion" [data]="seccion.contenido_json"/>
  </mat-expansion-panel>
</ng-container>
<ng-template #bloqueNormal>
  <app-seccion-content [tipo]="seccion.tipo_seccion" [titulo]="seccion.titulo" [data]="seccion.contenido_json"/>
</ng-template>
```

### Tipos y su `contenido_json`

| `tipo_seccion`             | Clave principal           | Render sugerido                                  |
|----------------------------|---------------------------|--------------------------------------------------|
| `descripcion`              | `parrafos[]`, `duracion`  | Párrafos + badge de duración                     |
| `precios_referencia`       | `items[]{label, precio, precio_descuento}` | Tabla con columnas Medida / Valor / Descuento |
| `obsequios`                | `items[]`                 | Lista con icono de regalo                        |
| `recomendaciones`          | `items[]`, `momento`      | Lista bullets; etiquetar si `momento = "antes"`  |
| `beneficios`               | `items[]`                 | Lista con checkmarks                             |
| `promocion`                | `titulo_destacado`, `descripcion`, `condiciones[]`, `vigencia` | Bloque destacado con fondo de color |
| `garantia`                 | `texto`, `dias`           | Badge con días + texto                           |
| `tribu_vip`                | `descripcion`, `beneficios[]` | Sección comunitaria                          |
| `diagnostico`              | `texto`, `obligatorio`    | Alerta o badge de obligatorio                    |
| `consideraciones_tecnicas` | `items[]`                 | Lista de advertencias                            |
| `advertencias`             | `items[]`                 | Bloque de alerta                                 |
| `faq`                      | `items[]{pregunta, respuesta}` | Acordeón                                   |
| `cta_secundario`           | `texto`, `url`            | Botón secundario                                 |
| `video`                    | `url`, `titulo`           | Iframe / tarjeta de video                        |
| `galeria`                  | `imagenes[]`              | Carrusel o grid                                  |
| `galeria_con_texto`        | `columnas_imagen`, `items[]{imagenes[], texto}` | Grid de imágenes con texto descriptivo al costado |
| `texto_libre`              | `html` o `texto`          | Render HTML sanitizado o párrafo                 |

### Regla de renderizado de secciones

```js
// Ordenar por `orden` ASC (ya vienen ordenadas del servidor)
servicio.web.secciones.forEach(seccion => {
  if (seccion.usa_acordeon) {
    renderSeccionAcordeon(seccion.tipo_seccion, seccion.titulo, seccion.contenido_json)
  } else {
    renderSeccion(seccion.tipo_seccion, seccion.titulo, seccion.contenido_json)
  }
})
```

> **Regla general:** `usa_acordeon` es independiente del `tipo_seccion`. Cualquier tipo puede ser acordeón o bloque fijo según lo configure el administrador.

### Botón de agenda

```js
if (servicio.web.mostrar_agenda) {
  renderBotonAgenda(servicio.web.texto_boton_agenda) // "AGENDA AQUI"
}
```

---

## Filtros que aplica el servidor automáticamente

| Condición                         | Campo evaluado                          |
|------------------------------------|-----------------------------------------|
| Servicio activo en ERP             | `servicio.estado = 1`                   |
| Configuración web publicada        | `servicio_web.published = 1`            |
| Servicio disponible en esa sede    | `servicios_sede.sede_id = {sede_id}`    |
| Secciones visibles                 | `servicio_web_seccion.visible = 1`      |
| Secciones ordenadas                | `servicio_web_seccion.orden ASC`        |
| Secciones como acordeón            | `servicio_web_seccion.usa_acordeon`     |

> **El frontend nunca debe recibir servicios no publicados** a través de estos endpoints. No es necesario hacer validaciones adicionales de `published` en el cliente.

---

## Guía de integración Angular

### Estructura de componentes recomendada

```
servicios/
  servicios.component.ts         ← orquestador principal
  categoria-selector/
    categoria-selector.component  ← llama GET /categorias-por-sede/{id}
  servicio-lista/
    servicio-lista.component      ← llama POST /servicios-por-categoria
  servicio-detalle/
    servicio-detalle.component    ← recibe un servicio completo como @Input
    seccion-renderer/
      seccion-renderer.component  ← recibe tipo_seccion + contenido_json + usa_acordeon
    atributos-iconos/
      atributos-iconos.component  ← recibe atributos[]
```

### Modelos TypeScript

```ts
export interface AtributoServicio {
  id: number;
  nombre: string;
  slug: string;
  icono: string | null;
  descripcion: string | null;
}

export interface SeccionWeb {
  id: number;
  tipo_seccion: TipoSeccion;
  titulo: string | null;
  subtitulo: string | null;
  contenido_json: Record<string, any>;
  orden: number;
  usa_acordeon: boolean;  // ← controla si renderiza como acordeón o bloque fijo
}

export interface ServicioWebConfig {
  id: number;
  slug: string;
  titulo_publico: string;
  subtitulo: string | null;
  descripcion_corta: string | null;
  imagen_portada: string | null;
  texto_boton_agenda: string | null;
  mostrar_agenda: boolean;
  published: boolean;
  secciones: SeccionWeb[];
}

export interface ServicioPublico {
  id: number;
  servicio: string;
  nombre_comercial: string;
  duracion: string;
  tipo_servicio_id: number;
  categoria_id: number;
  sede_id: number;
  web: ServicioWebConfig;
  atributos: AtributoServicio[];
}

export interface CategoriaConServicios {
  id: number;
  categoria: string;
  total_servicios: number;
  servicios: Partial<ServicioPublico>[];
}

export interface GaleriaConTextoItem {
  imagenes: string[];
  texto: string;
}

export type TipoSeccion =
  | 'descripcion' | 'recomendaciones' | 'beneficios' | 'promocion'
  | 'garantia' | 'diagnostico' | 'tribu_vip' | 'consideraciones_tecnicas'
  | 'obsequios' | 'texto_libre' | 'faq' | 'cta_secundario'
  | 'video' | 'galeria' | 'galeria_con_texto' | 'advertencias' | 'precios_referencia';
```

### Componente `seccion-renderer` (patrón recomendado)

```ts
// seccion-renderer.component.ts
@Component({
  selector: 'app-seccion-renderer',
  template: `
    <ng-container *ngIf="seccion.usa_acordeon; else bloqueDirecto">
      <mat-expansion-panel class="seccion-acordeon mb-2">
        <mat-expansion-panel-header>
          <mat-panel-title>{{ seccion.titulo }}</mat-panel-title>
          <mat-panel-description *ngIf="seccion.subtitulo">{{ seccion.subtitulo }}</mat-panel-description>
        </mat-expansion-panel-header>
        <ng-container *ngTemplateOutlet="contenidoTmpl"></ng-container>
      </mat-expansion-panel>
    </ng-container>

    <ng-template #bloqueDirecto>
      <div class="seccion-bloque mb-4">
        <h4 *ngIf="seccion.titulo" class="seccion-titulo">{{ seccion.titulo }}</h4>
        <p *ngIf="seccion.subtitulo" class="seccion-subtitulo">{{ seccion.subtitulo }}</p>
        <ng-container *ngTemplateOutlet="contenidoTmpl"></ng-container>
      </div>
    </ng-template>

    <ng-template #contenidoTmpl>
      <ng-container [ngSwitch]="seccion.tipo_seccion">
        <app-sec-descripcion          *ngSwitchCase="'descripcion'"          [data]="seccion.contenido_json"/>
        <app-sec-items                *ngSwitchCase="'recomendaciones'"      [data]="seccion.contenido_json"/>
        <app-sec-items                *ngSwitchCase="'beneficios'"           [data]="seccion.contenido_json"/>
        <app-sec-items                *ngSwitchCase="'obsequios'"            [data]="seccion.contenido_json"/>
        <app-sec-items                *ngSwitchCase="'advertencias'"         [data]="seccion.contenido_json"/>
        <app-sec-items                *ngSwitchCase="'consideraciones_tecnicas'" [data]="seccion.contenido_json"/>
        <app-sec-promocion            *ngSwitchCase="'promocion'"            [data]="seccion.contenido_json"/>
        <app-sec-garantia             *ngSwitchCase="'garantia'"             [data]="seccion.contenido_json"/>
        <app-sec-diagnostico          *ngSwitchCase="'diagnostico'"          [data]="seccion.contenido_json"/>
        <app-sec-tribu-vip            *ngSwitchCase="'tribu_vip'"            [data]="seccion.contenido_json"/>
        <app-sec-texto-libre          *ngSwitchCase="'texto_libre'"          [data]="seccion.contenido_json"/>
        <app-sec-faq                  *ngSwitchCase="'faq'"                  [data]="seccion.contenido_json"/>
        <app-sec-precios              *ngSwitchCase="'precios_referencia'"   [data]="seccion.contenido_json"/>
        <app-sec-cta-secundario       *ngSwitchCase="'cta_secundario'"       [data]="seccion.contenido_json"/>
        <app-sec-video                *ngSwitchCase="'video'"                [data]="seccion.contenido_json"/>
        <app-sec-galeria              *ngSwitchCase="'galeria'"              [data]="seccion.contenido_json"/>
      </ng-container>
    </ng-template>
  `
})
export class SeccionRendererComponent {
  @Input() seccion!: SeccionWeb;
}
```

### Uso en la página del servicio

```ts
// servicio-detalle.component.html
<div class="atributos" *ngIf="servicio.atributos.length">
  <app-atributos-iconos [atributos]="servicio.atributos"/>
</div>

<div class="secciones">
  <app-seccion-renderer
    *ngFor="let seccion of servicio.web.secciones"
    [seccion]="seccion"
  />
</div>

<div class="cta-agenda" *ngIf="servicio.web.mostrar_agenda">
  <button (click)="abrirAgenda(servicio)">{{ servicio.web.texto_boton_agenda }}</button>
</div>
```

---

## Errores comunes

| HTTP | `message`                             | Causa                                            |
|------|---------------------------------------|--------------------------------------------------|
| 422  | `sede_id field is required`           | No se envió `sede_id`                            |
| 422  | `categoria_id field is required`      | No se envió `categoria_id`                       |
| 422  | `The selected sede_id is invalid`     | La sede no existe en BD                          |
| 422  | `The selected categoria_id is invalid`| La categoría no existe en BD                    |
| 200  | `total: 0`, `data: []`               | No hay servicios publicados para esa combinación |
