# GET /api/servicio-web/{id} — Guía de consumo para el frontend Angular

> Endpoint para obtener **toda la configuración web de un servicio** dado su `id` del ERP.
> Requiere el header de autenticación configurado en el middleware `validar_token`.
> Solo devuelve servicios con `estado = 1` en el ERP **y** `published = true` en su configuración web.

---

## Endpoint

```
GET /api/servicio-web/{id}
```

| Parámetro | Tipo    | Requerido | Descripción                      |
|-----------|---------|-----------|----------------------------------|
| `id`      | integer | ✅        | ID del servicio en la tabla ERP  |

### Ejemplo de request

```http
GET /api/servicio-web/5
Authorization: Bearer {token}
```

---

## Respuesta exitosa (HTTP 200)

```json
{
  "success": true,
  "data": {
    "id": 5,
    "servicio": "LISO HD OLED",
    "nombre_comercial": "Sistema de Liso HD OLED",
    "duracion": "6h",
    "tipo_servicio_id": 1,
    "categoria_id": 2,

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
              "Su tecnología HD20R-FIBER sella la fibra capilar con precisión nanométrica."
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
              { "label": "Talla XL",  "precio": 400000, "precio_descuento": 340000 }
            ]
          },
          "orden": 1,
          "usa_acordeon": false
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
          "orden": 2,
          "usa_acordeon": true
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
          "orden": 3,
          "usa_acordeon": false
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
          "orden": 4,
          "usa_acordeon": false
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
          "orden": 5,
          "usa_acordeon": false
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
          "orden": 6,
          "usa_acordeon": false
        }
      ]
    },

    "atributos": [
      { "id": 1, "nombre": "Cabello",    "slug": "cabello",    "icono": "/imagenes/atributos/cabello.png",    "descripcion": null },
      { "id": 2, "nombre": "Embarazada", "slug": "embarazada", "icono": "/imagenes/atributos/embarazada.png", "descripcion": null },
      { "id": 3, "nombre": "Lactancia",  "slug": "lactancia",  "icono": "/imagenes/atributos/lactancia.png",  "descripcion": null }
    ]
  }
}
```

---

## Errores

| HTTP | `success` | `message`                                  | Causa                                          |
|------|-----------|--------------------------------------------|------------------------------------------------|
| 404  | `false`   | `Servicio no encontrado o no disponible.`  | ID no existe, `estado=0`, o `published=false`  |
| 401  | —         | Unauthorized                               | Token inválido o ausente                       |

> **Importante:** Un `id` válido que corresponda a un servicio no publicado (`published=false`) o desactivado (`estado=0`) devolverá HTTP **404**, no 200. El frontend no debe asumir que un ID existente siempre retorna datos.

---

## Filtros automáticos del servidor

| Condición                          | Campo evaluado                           |
|------------------------------------|------------------------------------------|
| Servicio activo en ERP             | `servicio.estado = 1`                    |
| Configuración web publicada        | `servicio_web.published = 1`             |
| Secciones visibles                 | `servicio_web_seccion.visible = 1`       |
| Secciones ordenadas                | `servicio_web_seccion.orden ASC`         |

> El frontend **nunca recibe secciones ocultas** (`visible=false`). No hace falta filtrar en el cliente.

---

## Catálogo de tipos de sección (`tipo_seccion`)

Cada sección del array `web.secciones` tiene un `tipo_seccion` que indica cómo renderizarla y cómo interpretar su `contenido_json`.

| `tipo_seccion`              | Claves principales en `contenido_json`                                          | Render sugerido                              |
|-----------------------------|---------------------------------------------------------------------------------|----------------------------------------------|
| `descripcion`               | `parrafos[]`, `duracion?`, `resultado?`                                         | Párrafos + badge de duración                 |
| `recomendaciones`           | `items[]`, `momento` (`"antes"` / `"despues"`)                                  | Lista bullets con label de momento           |
| `beneficios`                | `items[]`                                                                       | Lista con checkmarks                         |
| `obsequios`                 | `items[]`                                                                       | Lista con icono de regalo                    |
| `advertencias`              | `items[]`                                                                       | Bloque de alerta rojo/naranja                |
| `consideraciones_tecnicas`  | `items[]`                                                                       | Lista de advertencias técnicas               |
| `promocion`                 | `titulo_destacado`, `descripcion`, `condiciones[]`, `vigencia?`                 | Bloque destacado con fondo de color          |
| `garantia`                  | `texto`, `dias?`, `condiciones[]`                                               | Badge con días + texto descriptivo           |
| `diagnostico`               | `texto`, `obligatorio` (bool), `instrucciones[]`                                | Alerta o badge de obligatorio                |
| `tribu_vip`                 | `descripcion`, `beneficios[]`                                                   | Sección comunitaria                         |
| `texto_libre`               | `html?` o `texto?`                                                              | HTML sanitizado o párrafo                    |
| `faq`                       | `items[]{pregunta, respuesta}`                                                  | Acordeón de preguntas                        |
| `precios_referencia`        | `moneda`, `descuento_pct?`, `items[]{label, precio, precio_descuento?}`         | Tabla Medida / Precio / Descuento            |
| `cta_secundario`            | `texto`, `url`                                                                  | Botón secundario con enlace                  |
| `video`                     | `url`, `titulo?`                                                                | Iframe o tarjeta de video                    |
| `galeria`                   | `imagenes[]`                                                                    | Carrusel o grid de imágenes                  |

---

## Campo `usa_acordeon`

Cada sección expone `usa_acordeon: boolean`. Es **independiente** del `tipo_seccion` — cualquier tipo puede ser acordeón o bloque fijo según lo configure el administrador.

```
usa_acordeon = true  → renderizar como panel expandible/colapsable
usa_acordeon = false → renderizar como bloque de contenido fijo
```

### Lógica de renderizado (pseudocódigo)

```ts
servicio.web.secciones.forEach(seccion => {
  if (seccion.usa_acordeon) {
    renderSeccionAcordeon(seccion)   // título en cabecera, contenido colapsable
  } else {
    renderSeccionBloque(seccion)     // título visible, contenido siempre visible
  }
})
```

---

## Modelos TypeScript

```ts
// ─── Tipos de sección permitidos ─────────────────────────────────────────────
export type TipoSeccion =
  | 'descripcion' | 'recomendaciones' | 'beneficios' | 'promocion'
  | 'garantia' | 'diagnostico' | 'tribu_vip' | 'consideraciones_tecnicas'
  | 'obsequios' | 'texto_libre' | 'faq' | 'cta_secundario'
  | 'video' | 'galeria' | 'advertencias' | 'precios_referencia';

// ─── Atributo / ícono del servicio ───────────────────────────────────────────
export interface AtributoServicio {
  id: number;
  nombre: string;
  slug: string;
  icono: string | null;       // ruta relativa: "/imagenes/atributos/cabello.png"
  descripcion: string | null;
}

// ─── Sección dinámica ────────────────────────────────────────────────────────
export interface SeccionWeb {
  id: number;
  tipo_seccion: TipoSeccion;
  titulo: string | null;
  subtitulo: string | null;
  contenido_json: Record<string, any>;  // estructura varía por tipo_seccion
  orden: number;
  usa_acordeon: boolean;  // true = acordeón, false = bloque fijo
}

// ─── Configuración web del servicio ─────────────────────────────────────────
export interface ServicioWebConfig {
  id: number;
  slug: string;
  titulo_publico: string;
  subtitulo: string | null;
  descripcion_corta: string | null;
  imagen_portada: string | null;
  texto_boton_agenda: string;
  mostrar_agenda: boolean;
  published: boolean;
  secciones: SeccionWeb[];            // ya ordenadas por `orden ASC`
}

// ─── Respuesta completa del endpoint ─────────────────────────────────────────
export interface ServicioDetalle {
  id: number;
  servicio: string;
  nombre_comercial: string;
  duracion: string;
  tipo_servicio_id: number;
  categoria_id: number;
  web: ServicioWebConfig;
  atributos: AtributoServicio[];
}

export interface ApiResponseServicio {
  success: boolean;
  data: ServicioDetalle;
}
```

---

## Servicio Angular — HttpClient

```ts
// servicio-web.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseServicio, ServicioDetalle } from './models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioWebService {

  private readonly API_URL = 'https://tudominio.com/api';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
  }

  getServicio(id: number): Observable<ServicioDetalle> {
    return this.http
      .get<ApiResponseServicio>(`${this.API_URL}/servicio-web/${id}`, { headers: this.headers })
      .pipe(map(res => res.data));
  }
}
```

---

## Estructura de componentes recomendada

```
servicios/
  servicio-detalle/
    servicio-detalle.component.ts       ← llama getServicio(id), recibe ServicioDetalle
    servicio-detalle.component.html
    atributos-iconos/
      atributos-iconos.component.ts     ← @Input() atributos: AtributoServicio[]
    seccion-renderer/
      seccion-renderer.component.ts     ← @Input() seccion: SeccionWeb
      secciones/
        sec-descripcion.component.ts
        sec-items.component.ts          ← recomendaciones / beneficios / obsequios / advertencias
        sec-promocion.component.ts
        sec-garantia.component.ts
        sec-diagnostico.component.ts
        sec-tribu-vip.component.ts
        sec-precios.component.ts
        sec-faq.component.ts
        sec-cta-secundario.component.ts
        sec-video.component.ts
        sec-galeria.component.ts
        sec-texto-libre.component.ts
        sec-consideraciones.component.ts
```

---

## Componente `seccion-renderer` — template completo

```ts
// seccion-renderer.component.ts
import { Component, Input } from '@angular/core';
import { SeccionWeb } from '../models/servicio.model';

@Component({
  selector: 'app-seccion-renderer',
  template: `
    <!-- ── Wrapper: acordeón vs bloque fijo ──────────────────────── -->
    <ng-container *ngIf="seccion.usa_acordeon; else bloqueDirecto">
      <mat-expansion-panel class="seccion-acordeon mb-3">
        <mat-expansion-panel-header>
          <mat-panel-title>{{ seccion.titulo }}</mat-panel-title>
          <mat-panel-description *ngIf="seccion.subtitulo">
            {{ seccion.subtitulo }}
          </mat-panel-description>
        </mat-expansion-panel-header>
        <ng-container *ngTemplateOutlet="contenido"></ng-container>
      </mat-expansion-panel>
    </ng-container>

    <ng-template #bloqueDirecto>
      <div class="seccion-bloque mb-4">
        <h3 *ngIf="seccion.titulo" class="seccion-titulo">{{ seccion.titulo }}</h3>
        <p  *ngIf="seccion.subtitulo" class="seccion-subtitulo text-muted">{{ seccion.subtitulo }}</p>
        <ng-container *ngTemplateOutlet="contenido"></ng-container>
      </div>
    </ng-template>

    <!-- ── Dispatch por tipo_seccion ─────────────────────────────── -->
    <ng-template #contenido>
      <ng-container [ngSwitch]="seccion.tipo_seccion">

        <app-sec-descripcion
          *ngSwitchCase="'descripcion'"
          [data]="seccion.contenido_json">
        </app-sec-descripcion>

        <!-- Tipos con estructura items[] comparten componente -->
        <app-sec-items
          *ngSwitchCase="'recomendaciones'"
          [data]="seccion.contenido_json"
          etiqueta="Antes del procedimiento">
        </app-sec-items>
        <app-sec-items *ngSwitchCase="'beneficios'"           [data]="seccion.contenido_json"></app-sec-items>
        <app-sec-items *ngSwitchCase="'obsequios'"            [data]="seccion.contenido_json" icono="card_giftcard"></app-sec-items>
        <app-sec-items *ngSwitchCase="'advertencias'"         [data]="seccion.contenido_json" estilo="warning"></app-sec-items>
        <app-sec-items *ngSwitchCase="'consideraciones_tecnicas'" [data]="seccion.contenido_json"></app-sec-items>

        <app-sec-promocion   *ngSwitchCase="'promocion'"          [data]="seccion.contenido_json"></app-sec-promocion>
        <app-sec-garantia    *ngSwitchCase="'garantia'"           [data]="seccion.contenido_json"></app-sec-garantia>
        <app-sec-diagnostico *ngSwitchCase="'diagnostico'"        [data]="seccion.contenido_json"></app-sec-diagnostico>
        <app-sec-tribu-vip   *ngSwitchCase="'tribu_vip'"          [data]="seccion.contenido_json"></app-sec-tribu-vip>
        <app-sec-texto-libre *ngSwitchCase="'texto_libre'"        [data]="seccion.contenido_json"></app-sec-texto-libre>
        <app-sec-faq         *ngSwitchCase="'faq'"                [data]="seccion.contenido_json"></app-sec-faq>
        <app-sec-precios     *ngSwitchCase="'precios_referencia'" [data]="seccion.contenido_json"></app-sec-precios>
        <app-sec-cta         *ngSwitchCase="'cta_secundario'"     [data]="seccion.contenido_json"></app-sec-cta>
        <app-sec-video       *ngSwitchCase="'video'"              [data]="seccion.contenido_json"></app-sec-video>
        <app-sec-galeria     *ngSwitchCase="'galeria'"            [data]="seccion.contenido_json"></app-sec-galeria>

      </ng-container>
    </ng-template>
  `
})
export class SeccionRendererComponent {
  @Input() seccion!: SeccionWeb;
}
```

---

## Componente `servicio-detalle` — uso completo

```html
<!-- servicio-detalle.component.html -->

<!-- Portada -->
<div class="portada" *ngIf="servicio.web.imagen_portada">
  <img [src]="servicio.web.imagen_portada" [alt]="servicio.web.titulo_publico">
</div>

<h1 class="titulo-servicio">{{ servicio.web.titulo_publico }}</h1>
<p  class="subtitulo"   *ngIf="servicio.web.subtitulo">{{ servicio.web.subtitulo }}</p>
<p  class="descripcion" *ngIf="servicio.web.descripcion_corta">{{ servicio.web.descripcion_corta }}</p>

<!-- Atributos / íconos PNG -->
<div class="atributos-iconos" *ngIf="servicio.atributos.length">
  <app-atributos-iconos [atributos]="servicio.atributos"></app-atributos-iconos>
</div>

<!-- Secciones dinámicas (ya vienen ordenadas del servidor) -->
<div class="secciones">
  <app-seccion-renderer
    *ngFor="let seccion of servicio.web.secciones"
    [seccion]="seccion">
  </app-seccion-renderer>
</div>

<!-- Botón de agenda (condicional) -->
<div class="cta-agenda" *ngIf="servicio.web.mostrar_agenda">
  <button class="btn-agenda" (click)="abrirAgenda()">
    {{ servicio.web.texto_boton_agenda }}
  </button>
</div>
```

```ts
// servicio-detalle.component.ts
@Component({ selector: 'app-servicio-detalle', templateUrl: './servicio-detalle.component.html' })
export class ServicioDetalleComponent implements OnInit {

  @Input() servicioId!: number;   // recibido por ruta o @Input
  servicio!: ServicioDetalle;

  constructor(
    private servicioWebService: ServicioWebService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.servicioId ?? +this.route.snapshot.params['id'];
    this.servicioWebService.getServicio(id).subscribe({
      next: data  => this.servicio = data,
      error: err  => {
        if (err.status === 404) {
          // Servicio no existe o no está publicado
          // redirigir o mostrar mensaje
        }
      }
    });
  }

  abrirAgenda(): void {
    // lógica para abrir el flujo de agenda
  }
}
```

---

## Componente `atributos-iconos`

```ts
// atributos-iconos.component.ts
@Component({
  selector: 'app-atributos-iconos',
  template: `
    <div class="atributos-grid">
      <div class="atributo-chip" *ngFor="let attr of atributos">
        <img *ngIf="attr.icono" [src]="attr.icono" [alt]="attr.nombre" class="atributo-icono">
        <span class="atributo-nombre">{{ attr.nombre }}</span>
      </div>
    </div>
  `
})
export class AtributosIconosComponent {
  @Input() atributos: AtributoServicio[] = [];
}
```

---

## Resumen del flujo completo

```
Angular                                     Laravel API
──────                                      ───────────
getServicio(id)
  → GET /api/servicio-web/{id}
  ← 200 { success:true, data:{...} }
        │
        ├─ data.web.secciones[] → *ngFor → <app-seccion-renderer>
        │      ├─ usa_acordeon=true  → <mat-expansion-panel>
        │      └─ usa_acordeon=false → <div class="seccion-bloque">
        │             └─ [ngSwitch] tipo_seccion → componente específico
        │
        └─ data.atributos[] → <app-atributos-iconos>
               └─ attr.icono → <img src="..."> (PNG)
```
