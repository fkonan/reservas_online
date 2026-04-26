# Especificaciones API — Flujo de Agendamiento y Pagos

**Base URL**: `https://<tu-dominio>/api`

---

## 1. Autenticación (HMAC)

Todas las peticiones bajo el grupo `validar_token` deben incluir el header:

```
X-APP-TOKEN: <hash>
```

El hash se calcula en Angular de la siguiente manera:

```typescript
import { HttpHeaders } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

function buildHmacToken(method: string, path: string, body: any, secret: string): string {
  const bodyStr = body ? JSON.stringify(body) : '';
  const message = method.toUpperCase() + path + bodyStr;
  return CryptoJS.HmacSHA256(message, secret).toString(CryptoJS.enc.Hex);
}

// Ejemplo de uso en un servicio Angular:
const path = '/api/categorias-por-sede/1';
const token = buildHmacToken('GET', path, null, environment.appToken);
const headers = new HttpHeaders({ 'X-APP-TOKEN': token });
```

> **Importante**: el `path` es la ruta completa incluyendo `/api`, sin el dominio.
> Para POST/PUT, el `body` debe ser el mismo objeto que se envía serializado.
> Para GET, el `body` es `null` (string vacío).

El endpoint `/api/payment/abandon/{link}` **no usa este header** — su autenticación es por query param (ver sección 9).

---

## 2. Flujo completo paso a paso

```
[1] GET /api/sedes/{id}                    → datos de la sede seleccionada
[2] GET /api/categorias-por-sede/{sede_id} → categorías y servicios disponibles
[3] POST /api/servicios-por-categoria      → servicios filtrados por categoría
[4] GET /api/servicio-web/{id}             → detalle del servicio seleccionado
[5] POST /api/agenda-web                   → horarios disponibles en la agenda
[6] GET /api/cliente/{documento}           → validar cliente (calificación, existencia)
[7] POST /api/payment/generate-link        → apartar agenda + generar link Bold
       ↓  Angular redirige al usuario a la URL de Bold
[8] Bold procesa el pago del usuario
       ↓  Bold notifica al webhook de Laravel
[9] GET /api/payment/validate/{link}       → Angular consulta estado (polling)
       ↓  status PAID → cita confirmada + correo enviado
          status REJECTED/EXPIRED/CANCELLED → mostrar error

   Si el usuario CIERRA el navegador antes de pagar:
   navigator.sendBeacon('/api/payment/abandon/{link}?token=...') → liberar agenda
```

---

## 3. Endpoints

### 3.1 `GET /api/sedes/{id}`
**Auth**: X-APP-TOKEN requerido

**Response 200:**
```json
{
  "success": true,
  "data": { "id": 1, "nombre": "Sede Principal", ... }
}
```

---

### 3.2 `GET /api/categorias-por-sede/{sede_id}`
**Auth**: X-APP-TOKEN requerido

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoria": "Facial",
      "servicios": [ { "id": 5, "servicio": "Limpieza Profunda", ... } ]
    }
  ]
}
```

---

### 3.3 `POST /api/servicios-por-categoria`
**Auth**: X-APP-TOKEN requerido

**Request body:**
```json
{
  "categoria_id": 1,
  "sede_id": 1
}
```

---

### 3.4 `GET /api/servicio-web/{id}`
**Auth**: X-APP-TOKEN requerido | `{id}` debe ser numérico

---

### 3.5 `POST /api/agenda-web`
**Auth**: X-APP-TOKEN requerido

**Request body:**
```json
{
  "fecha": "2026-05-10",
  "tipo_servicio": 2,
  "sede": 1
}
```

---

### 3.6 `GET /api/cliente/{documento}`
**Auth**: X-APP-TOKEN requerido

**Parámetro de ruta**: `documento` — solo dígitos, entre 5 y 20 caracteres.

---

#### Posibles respuestas y cómo manejarlas en Angular

**CASO 1 — Cliente encontrado y habilitado para agendar**
```json
HTTP 200
{
  "success": true,
  "message": "Cliente Encontrado",
  "data": {
    "id": 10,
    "nombres": "María",
    "apellidos": "Pérez",
    "documento": "1234567890",
    "telefono": "3001234567",
    "correo": "maria@example.com",
    "fecha_nacimiento": "1995-03-15",
    "whatsapp": "3001234567",
    "instagram": "@mariaperez",
    "ciudad": "Bogotá",
    "direccion": "Calle 123 #45-67"
  }
}
```
✅ Continuar al formulario. Puedes **precargar los campos** con `data` para que el cliente no tenga que escribirlos de nuevo.

---

**CASO 2 — Cliente bloqueado (calificación mala o muy mala)**
```json
HTTP 200
{
  "success": false,
  "noAgendar": true,
  "message": "No es posible realizar una reserva en este momento, por favor comunícate con nosotros.",
  "data": []
}
```
🚫 **Bloquear completamente el flujo.** Mostrar el `message`. La clave diferenciadora es `noAgendar === true`:
```typescript
if (res.noAgendar === true) {
  this.mostrarError(res.message);
  this.puedeAgendar = false;
  return;
}
```

---

**CASO 3 — Cliente no encontrado (documento nuevo)**
```json
HTTP 200
{
  "success": false,
  "message": "No se encontró un cliente con estos datos.",
  "data": []
}
```
✅ Cliente **nuevo** — continuar con formulario vacío. Se crea automáticamente cuando el pago se confirma.

Verificar: `success === false` **y** `noAgendar` ausente o `undefined`.

---

**CASO 4 — Documento con formato inválido**
```json
HTTP 422
{
  "success": false,
  "message": "Ocurrio un error al validar los datos del cliente",
  "errors": { "documento": ["El campo documento debe ser numérico.", "..."] }
}
```
⚠️ Validar en Angular antes de llamar al endpoint: solo dígitos, mínimo 5 y máximo 20 caracteres.

---

**CASO 5 — Error interno del servidor**
```json
HTTP 500
{
  "success": false,
  "message": "Ocurrió un error al procesar la solicitud."
}
```
⚠️ Mostrar mensaje genérico al usuario y permitir reintentar.

---

#### Lógica de decisión completa en Angular

```typescript
getCliente(documento: string): void {
  this.apiService.getClienteByDocumento(documento).subscribe({
    next: (res) => {
      if (res.noAgendar === true) {
        // CASO 2: bloqueado — detener flujo completamente
        this.mostrarError(res.message);
        this.puedeAgendar = false;
        return;
      }
      if (res.success === true) {
        // CASO 1: cliente habilitado — precargar formulario
        this.precargarFormulario(res.data);
        this.puedeAgendar = true;
        return;
      }
      // CASO 3: cliente nuevo — formulario vacío
      this.puedeAgendar = true;
    },
    error: (err) => {
      if (err.status === 422) {
        // CASO 4: documento inválido
        this.mostrarError('El documento ingresado no es válido.');
      } else {
        // CASO 5: error servidor
        this.mostrarError('Ocurrió un error, por favor intenta de nuevo.');
      }
    }
  });
}
```

> **Resumen de flags a verificar** (en orden de prioridad):
> 1. `noAgendar === true` → bloquear flujo
> 2. `success === true` → cliente existente, precargar campos
> 3. `success === false` sin `noAgendar` → cliente nuevo, continuar

---

### 3.7 `POST /api/payment/generate-link`
**Auth**: X-APP-TOKEN requerido

**Request body (todos los campos del cliente):**
```json
{
  "tipo_servicio": 2,
  "servicio": 5,
  "sede": 1,
  "fecha": "2026-05-10",
  "hora": "09:00:00",
  "documento": "1234567890",
  "nombres": "María",
  "apellidos": "Pérez",
  "telefono": "3001234567",
  "whatsapp": "3001234567",
  "instagram": "@mariaperez",
  "correo": "maria@example.com",
  "fecha_nacimiento": "1995-03-15",
  "ciudad": "Bogotá",
  "direccion": "Calle 123 #45-67",
  "valor_abono": 50000
}
```

**Campos opcionales**: `telefono`, `whatsapp`, `instagram`, `ciudad`, `direccion`

**Response 200:**
```json
{
  "success": true,
  "message": "Link Generado Exitosamente!",
  "data": {
    "url": "https://checkout.bold.co/LNK_XXXXX",
    "transaction_id": 42
  }
}
```
> Angular debe guardar `data.url` y `data.transaction_id` en la sesión, luego redirigir al usuario a `data.url`.

**Response 422 — agenda no disponible:**
```json
{
  "success": false,
  "message": "La agenda seleccionada no se encuentra disponible",
  "errors": []
}
```

**Response 422 — transacción en curso:**
```json
{
  "success": false,
  "message": "El cliente con identificación 1234567890 tiene una transacción en curso",
  "errors": []
}
```

---

### 3.8 `GET /api/payment/validate/{link}`
**Auth**: X-APP-TOKEN requerido | `{link}` = valor de `LNK_XXXXX` retornado por Bold

**Estrategia de polling desde Angular:**
```typescript
// Consultar cada 5 segundos, máximo 2 minutos
const MAX_POLLS = 24; // 24 × 5s = 120s
let pollCount = 0;

const interval = setInterval(() => {
  pollCount++;
  this.validatePayment(link).subscribe(res => {
    if (res.data?.status !== 'ACTIVE' && res.data?.status !== 'PROCESSING') {
      clearInterval(interval);
      this.handlePaymentResult(res);
    }
  });
  if (pollCount >= MAX_POLLS) {
    clearInterval(interval);
    this.handleTimeout();
  }
}, 5000);
```

**Response 200 — pago exitoso:**
```json
{
  "success": true,
  "message": "El pago se ha procesado correctamente, tu agenda está programada para el día: 2026-05-10 hora: 09:00:00.",
  "data": {
    "status": "PAID",
    "transaction_id": "txn_abc123",
    "agenda": { "id": 7, "fecha": "2026-05-10", "hora": "09:00:00", ... },
    "cliente": "María Pérez",
    "documento": "1234567890"
  }
}
```

**Posibles valores de `data.status`:**
| Estado | Descripción | Acción en Angular |
|---|---|---|
| `ACTIVE` | Esperando pago | Seguir polling |
| `PROCESSING` | Pago en curso | Seguir polling |
| `PAID` | Pago exitoso ✅ | Mostrar confirmación |
| `REJECTED` | Pago rechazado | Mostrar error, ofrecer reintentar |
| `CANCELLED` | Cancelado por usuario | Mostrar mensaje, regresar al formulario |
| `EXPIRED` | Link vencido | Mostrar mensaje, regresar al formulario |
| `ABANDONED` | Liberado manualmente | (interno, no llega al frontend) |

---

### 3.9 `GET /api/payment/abandon/{link}?token={APP_TOKEN}` *(sin middleware HMAC)*

Se debe llamar usando `navigator.sendBeacon` cuando el usuario cierra el navegador antes de completar el pago. Libera el espacio en la agenda inmediatamente.

```typescript
// En el componente de redirección de pago (Angular)
@HostListener('window:beforeunload')
onBeforeUnload(): void {
  const link = this.currentPaymentLink; // guardado al llamar generate-link
  if (link) {
    const url = `${environment.apiUrl}/payment/abandon/${link}?token=${environment.appToken}`;
    navigator.sendBeacon(url);
  }
}
```

> **Nota de seguridad**: `APP_TOKEN` en query param es aceptable aquí porque el endpoint solo realiza una operación de liberación (no destructiva) y el Job `ValidarTransaction` garantiza la limpieza como respaldo.

**Response 200:**
```json
{ "success": true, "message": "Reserva liberada" }
```

---

## 4. Manejo de errores global

```typescript
// Interceptor Angular sugerido
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400) {
        // Token inválido
        console.error('Error de autenticación con la API');
      }
      if (error.status === 422) {
        // Errores de validación — mostrar error.error.message o error.error.errors[]
      }
      if (error.status === 500) {
        // Error interno — mostrar mensaje genérico
      }
      return throwError(() => error);
    })
  );
}
```

---

## 5. Variables de entorno Angular (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://<tu-dominio>/api',
  appToken: '<APP_TOKEN_del_archivo_.env_de_Laravel>',
};
```

> El `appToken` es el valor de `APP_TOKEN` del `.env` de Laravel. **Nunca** commitear este valor — usar variables de entorno del pipeline de CI/CD.
