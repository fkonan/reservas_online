# Especificación: Recargos Nocturnos en el Selector de Agenda (Frontend Público)

## 1. Contexto

Algunos servicios aplican un costo adicional a ciertos horarios del `full_time` definidos en `config/global.php` (ej. `5:30pm`, `6:00pm`). Estos recargos se configuran por servicio desde el CMS del ERP y se exponen al frontend público a través del endpoint `/api/agenda-web`.

---

## 2. Endpoint actualizado: `POST /api/agenda-web`

### Parámetros (body JSON o form-data)

| Campo              | Tipo     | Requerido | Descripción |
|--------------------|----------|-----------|-------------|
| `sede_id`          | integer  | ✓         | ID de la sede |
| `fecha`            | date     | ✓         | Fecha en formato `YYYY-MM-DD` |
| `tipo_servicio_id` | integer  | ✓         | Tipo de servicio a consultar |
| `servicio_id`      | integer  | ✗         | **Nuevo (opcional)** – Si se envía, enriquece la respuesta con datos de recargo nocturno |

> **Retrocompatibilidad**: si `servicio_id` no se envía, la respuesta es idéntica a la versión anterior. No hay breaking changes.

### Respuesta con `servicio_id` (ejemplo)

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "sede_id": 1,
      "fecha": "2026-04-25",
      "hora": "5:30pm",
      "estado": "DISPONIBLE",
      "tipo_servicio_id": 3,
      "tiene_recargo": true,
      "recargo": 15000
    },
    {
      "id": 43,
      "sede_id": 1,
      "fecha": "2026-04-25",
      "hora": "4:00pm",
      "estado": "DISPONIBLE",
      "tipo_servicio_id": 3,
      "tiene_recargo": false,
      "recargo": null
    }
  ]
}
```

### Campos nuevos por slot

| Campo           | Tipo         | Descripción |
|-----------------|--------------|-------------|
| `tiene_recargo` | boolean      | `true` si el horario tiene recargo nocturno configurado |
| `recargo`       | integer\|null | Monto del recargo en pesos COP; `null` si no aplica |

---

## 3. Archivo JS para el frontend: `agenda_recargo.js`

**Ruta:** `public/js/agenda_recargo.js`

Carga el script en la página donde se muestra el selector de horarios:

```html
<script src="/js/agenda_recargo.js"></script>
```

### API pública: `window.AgendaRecargo`

#### `AgendaRecargo.renderSlots(slots, container, onSelect)`

Renderiza los botones de horario dentro de `container`.

- Slots con `tiene_recargo: true` reciben la clase `slot-recargo` y un badge amarillo con el monto.
- Al hacer clic en un slot, se marca como activo y se llama `onSelect(slot)`.

**Parámetros:**

| Parámetro  | Tipo       | Descripción |
|------------|------------|-------------|
| `slots`    | `Array`    | Array devuelto por `/api/agenda-web` |
| `container`| `Element`  | Elemento DOM donde renderizar |
| `onSelect` | `Function` | Callback `fn(slot)` – recibe el objeto completo del slot |

**Ejemplo de uso:**

```js
fetch('/api/agenda-web', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Token': token },
  body: JSON.stringify({ sede_id: 1, fecha: '2026-04-25', tipo_servicio_id: 3, servicio_id: 12 })
})
.then(r => r.json())
.then(d => {
  if (!d.success) return;

  const container    = document.getElementById('slotsContainer');
  const alertWrapper = document.getElementById('recargoAlert');

  AgendaRecargo.renderSlots(d.data, container, function (slot) {
    // Mostrar aviso si tiene recargo
    AgendaRecargo.mostrarAlertaRecargo(slot, alertWrapper);
    // Guardar selección en tu estado
    miEstado.slotSeleccionado = slot;
  });
});
```

---

#### `AgendaRecargo.mostrarAlertaRecargo(slot, alertContainer)`

Inserta (o actualiza) un `<div class="agenda-recargo-alert alert alert-warning">` en `alertContainer` indicando el monto del recargo. Si el slot no tiene recargo, limpia el aviso existente.

**HTML esperado en la página:**

```html
<div id="slotsContainer" class="d-flex flex-wrap gap-1"></div>
<div id="recargoAlert"></div>
```

---

#### `AgendaRecargo.formatRecargo(valor)`

Formatea un entero como moneda COP con prefijo "+".

```js
AgendaRecargo.formatRecargo(15000);  // → "+$15.000"
```

---

## 4. Estilos sugeridos

El archivo inyecta estilos mínimos de fallback. Para producción, agrega en tu CSS principal:

```css
/* Slot con recargo nocturno */
.slot-recargo {
  border-color: #ffc107 !important;
}
.slot-recargo:hover {
  background: #fff3cd !important;
}
/* Slot con recargo seleccionado */
.slot-horario.active.btn-primary.slot-recargo {
  background:   #ffc107 !important;
  border-color: #ffc107 !important;
  color: #000 !important;
}
/* Alerta de recargo */
.agenda-recargo-alert {
  font-size: .85rem;
  border-radius: 6px;
}
```

---

## 5. Configuración desde el CMS (ERP)

Los recargos se administran en la vista **Configuración Web** del servicio (`/servicio/{id}/web`), panel **"Recargos nocturnos"**.

- Aparece uno checkbox por cada horario del `full_time` configurado en `config/global.php`.
- Al marcar un horario se habilita el input de monto (en pesos COP, step de $500).
- El botón "Guardar recargos" llama a `POST /servicio/{id}/web/recargos` y **solo** actualiza el campo `recargos_nocturnos` sin tocar la cabecera web.

### Endpoint del CMS

`POST /servicio/{id}/web/recargos`

```json
{
  "recargos_nocturnos": [
    { "hora": "5:30pm", "recargo": 10000 },
    { "hora": "6:00pm", "recargo": 15000 }
  ]
}
```

---

## 6. Decisiones de diseño

| Decisión | Razón |
|---|---|
| Campo JSON en `servicio_web` sin tabla nueva | Los recargos son configuración editorial del servicio; no hay consultas complejas que justifiquen normalización |
| `servicio_id` opcional en el endpoint | Retrocompatibilidad total con integraciones existentes |
| `trim()` en el matching de hora | El valor `"6:00pm "` en `global.php` tiene trailing space; `trim()` garantiza coincidencia robusta |
| Formulario `#formRecargos` separado del `#formCabecera` | Evita reenviar imagen/portada y todos los campos al solo cambiar recargos |
| `agenda_recargo.js` como IIFE sin módulo ES | Compatible con el stack actual sin bundler en las páginas públicas |
