# Especificaciones — Aviso Final (Modal Pre-Checkout)

## Resumen

Se agrega el campo `aviso_final` al modelo `ServicioWeb`. Este campo contiene la configuración de un **modal obligatorio** que se muestra al cliente justo después de seleccionar un horario y **antes** de completar el checkout. Permite comunicar recomendaciones, condiciones o preparaciones previas al servicio.

---

## SQL — Script de migración

Ejecutar en la base de datos:

```sql
ALTER TABLE `servicio_web`
  ADD COLUMN `aviso_final` JSON NULL DEFAULT NULL
  COMMENT 'Modal pre-checkout: {"titulo":"...","parrafos":["..."],"texto_aceptacion":"..."}'
  AFTER `recargos_nocturnos`;
```

---

## Estructura del campo `aviso_final`

```json
{
  "titulo": "Antes de continuar, lee con atención",
  "parrafos": [
    "Este servicio requiere que tu cabello esté limpio y seco.",
    "No apliques aceites ni productos en las 24 horas previas.",
    "Si tienes alergias conocidas, infórmanos antes de tu cita."
  ],
  "texto_aceptacion": "He leído y acepto las recomendaciones y condiciones de este servicio."
}
```

| Campo              | Tipo            | Obligatorio | Descripción                                        |
|--------------------|-----------------|-------------|----------------------------------------------------|
| `titulo`           | `string\|null`  | No          | Título del modal. Máx 200 caracteres               |
| `parrafos`         | `string[]`      | No          | Lista de párrafos / recomendaciones. Máx 1000 c/u  |
| `texto_aceptacion` | `string\|null`  | No          | Texto del checkbox de confirmación. Máx 300 chars  |

Si `aviso_final` es `null` o `parrafos` está vacío, **no se muestra el modal**.

---

## Endpoints API actualizados

### `GET /api/servicio-web/{id}`

Ahora incluye `aviso_final` dentro del objeto `web`:

```json
{
  "success": true,
  "data": {
    "id": 12,
    "servicio": "Keratina Brasileña",
    "web": {
      "id": 5,
      "slug": "keratina-brasilena",
      "titulo_publico": "Keratina Brasileña",
      "mostrar_agenda": true,
      "published": true,
      "aviso_final": {
        "titulo": "Antes de continuar, lee con atención",
        "parrafos": [
          "Cabello limpio y seco.",
          "Sin aceites 24h antes."
        ],
        "texto_aceptacion": "He leído y acepto las recomendaciones."
      },
      "secciones": []
    },
    "atributos": []
  }
}
```

### `POST /api/servicios-por-categoria`

Misma estructura — `web.aviso_final` incluido en cada ítem del array `data`.

---

## Modelo TypeScript — Actualización

Agregar `aviso_final` al modelo existente `ServicioWebConfig`:

```typescript
export interface AvisoFinal {
  titulo?: string;
  parrafos: string[];
  texto_aceptacion?: string;
}

export interface ServicioWebConfig {
  id: number;
  slug: string;
  titulo_publico: string;
  subtitulo?: string;
  descripcion_corta?: string;
  imagen_portada?: string;
  texto_boton_agenda?: string;
  mostrar_agenda: boolean;
  published: boolean;
  duracion?: number;
  aviso_final: AvisoFinal | null;   // ← NUEVO
  secciones: SeccionWeb[];
}
```

---

## Comportamiento del modal en el frontend Angular

### Cuándo mostrar el modal

```typescript
function debesMostrarAvisoFinal(web: ServicioWebConfig): boolean {
  return (
    web.aviso_final !== null &&
    (web.aviso_final.parrafos?.length ?? 0) > 0
  );
}
```

### Flujo de interacción

1. Cliente selecciona un horario disponible en la agenda.
2. **Antes** de navegar al checkout, evalúa `debesMostrarAvisoFinal()`.
3. Si aplica → abrir modal. El modal **no se puede cerrar** sin aceptar (sin botón "×", sin click fuera).
4. Modal contiene:
   - Título (`aviso_final.titulo`)
   - Lista de párrafos (`aviso_final.parrafos`)
   - Checkbox + texto (`aviso_final.texto_aceptacion`)
   - Botón "Continuar" (deshabilitado hasta que el checkbox esté marcado)
5. Al marcar el checkbox y hacer clic en "Continuar" → navegar al checkout.
6. Si el usuario hace clic en "Cancelar" → cerrar modal sin navegar (ningún horario queda seleccionado).

### Ejemplo de componente Angular (template)

```html
<div class="modal-aviso" *ngIf="mostrarAviso">
  <div class="modal-aviso__dialog">
    <h4>{{ aviso.titulo }}</h4>
    <ul>
      <li *ngFor="let p of aviso.parrafos">{{ p }}</li>
    </ul>
    <div class="form-check mb-3">
      <input class="form-check-input" type="checkbox" id="chkAceptacion" [(ngModel)]="aceptado">
      <label class="form-check-label" for="chkAceptacion">
        {{ aviso.texto_aceptacion }}
      </label>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-secondary" (click)="cancelarAviso()">Cancelar</button>
      <button class="btn btn-primary" [disabled]="!aceptado" (click)="confirmarAviso()">Continuar</button>
    </div>
  </div>
</div>
```

```typescript
// En el componente de agenda / reserva
onSeleccionarSlot(slot: AgendaSlot): void {
  this.slotSeleccionado = slot;
  if (this.debesMostrarAvisoFinal()) {
    this.aceptado    = false;
    this.mostrarAviso = true;
  } else {
    this.irAlCheckout();
  }
}

cancelarAviso(): void {
  this.mostrarAviso      = false;
  this.slotSeleccionado  = null;
}

confirmarAviso(): void {
  this.mostrarAviso = false;
  this.irAlCheckout();
}
```

---

## Configuración CMS

El panel de configuración se encuentra en:
**Servicios → [Servicio] → Configuración Web → "Aviso final (modal pre-checkout)"**

Campos editables:
- **Título del modal** — texto corto visible como encabezado
- **Recomendaciones / Párrafos** — lista dinámica; cada párrafo es un ítem de la lista
- **Texto del checkbox de aceptación** — lo que el cliente debe leer y aceptar

Si se guarda sin párrafos, el campo queda con `parrafos: []` y el modal **no se mostrará**.
