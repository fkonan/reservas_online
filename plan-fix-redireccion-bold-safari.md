# Plan: Fix de redirección a Bold compatible con Safari y otros navegadores

## Context

En [src/app/public/pages/detalle-pago/detalle-pago.component.ts:217-232](src/app/public/pages/detalle-pago/detalle-pago.component.ts#L217-L232), después de un `POST` a `api/payment/generate-link`, el componente abre la pasarela de Bold con `window.open(boldUrl, '_blank')` **dentro del callback `next` del Observable**, es decir, después de un gap asíncrono respecto al click del usuario.

Safari (macOS e iOS), y en menor medida Firefox, exigen que `window.open` se ejecute **sincrónicamente** dentro del handler del evento de usuario para considerarlo un popup permitido. Como en este flujo la apertura ocurre tras la respuesta HTTP, el "user activation token" del click ya se consumió y Safari bloquea silenciosamente la pestaña. El usuario queda en `/validar-pago` haciendo polling sin haber visto la pasarela.

Objetivo: que la pestaña de Bold se abra de forma confiable en todos los navegadores modernos, manteniendo el flujo actual de polling y de callback hacia el backend.

## Compatibilidad por navegador

El patrón propuesto (`window.open('about:blank', '_blank')` síncrono al click + asignar `popup.location.href = boldUrl` al recibir la respuesta) tiene este comportamiento:

| Navegador | Comportamiento actual | Con el fix |
|---|---|---|
| Chrome / Edge desktop | Funciona (a veces) | Funciona |
| Firefox desktop | Bloqueado intermitente | Funciona |
| Safari macOS | Bloqueado casi siempre | Funciona |
| Safari iOS | Bloqueado casi siempre | Funciona |
| Chrome / Firefox Android | Funciona | Funciona |
| WebView in-app (Instagram, Facebook, TikTok, iOS WKWebView) | Bloqueado | **Bloqueado** — requiere fallback |

Para WebViews in-app, ningún truco con `window.open` funciona — esos navegadores no permiten abrir una segunda pestaña. Se cubre con un fallback de redirect en la misma pestaña usando `window.location.href = boldUrl`. La página `/validar-pago` ya soporta este caso porque lee `bold-order-id` desde `queryParamMap` ([validar-pago.component.ts:54-65](src/app/public/pages/validar-pago/validar-pago.component.ts#L54-L65)) — el callback del backend que ya redirige a `/#/validar-pago?bold-order-id=...` aterriza correctamente y el polling arranca igual.

## Cambios en el backend

**Ninguno.** La ruta actual de Laravel:

```php
Route::get('/bold-callback', function (Request $request) {
    return redirect('https://soscentrocapilar.com/#/validar-pago?bold-order-id=' . $request->query('bold-order-id') . '&bold-tx-status=' . $request->query('bold-tx-status'));
});
```

es un redirect 302 server-side, que **no está sujeto a las restricciones de popup blocker** del navegador — no importa si el usuario viene en pestaña popup o en la misma pestaña. Funciona idéntico para los dos caminos del frontend (popup y same-tab fallback).

El error 400 documentado en `analisis-errores-bold-callback-backend.md` es un problema separado (`CALLBACK_URL` / dashboard de Bold / route cache) y se resuelve aparte siguiendo ese checklist.

## Cambios en el frontend

### Archivo único modificado
[src/app/public/pages/detalle-pago/detalle-pago.component.ts](src/app/public/pages/detalle-pago/detalle-pago.component.ts) — método `onSubmit()` (líneas 187-243).

### Estrategia
1. Abrir `window.open('about:blank', '_blank')` **antes** del `subscribe`, en el mismo tick síncrono del submit. Esto consume el user-gesture token mientras todavía es válido.
2. Guardar la referencia de la pestaña en una variable local `popup`.
3. En el callback `next` exitoso, asignar `popup.location.href = boldUrl`.
4. Si `popup` es `null` o `popup.closed === true` (caso WebView in-app o popup blocker estricto), hacer fallback con `window.location.href = boldUrl` en la pestaña actual y **no** navegar a `/validar-pago` (porque después del callback el usuario llega solo a esa ruta, no se necesita la pestaña de polling original).
5. Si la respuesta no es exitosa o falla, cerrar la pestaña popup si quedó abierta para no dejar `about:blank` huérfano.

### Forma esperada del método

```typescript
onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const cita = this.datosCita();
  if (!cita) return;

  // Apertura síncrona de la pestaña: requisito de Safari/iOS para preservar el user gesture.
  const popup = window.open('about:blank', '_blank');

  const v = this.form.value;
  const datosPago = {
    tipo_servicio: cita.servicio.tipo_servicio_id,
    servicio: cita.servicio.id,
    sede: cita.sede,
    fecha: cita.fecha,
    hora: cita.hora,
    documento: v.documento,
    nombres: v.nombres,
    apellidos: v.apellidos,
    telefono: v.telefono || undefined,
    whatsapp: v.whatsapp || v.telefono || undefined,
    correo: v.correo || undefined,
    fecha_nacimiento: v.fecha_nacimiento
      ? new Date(v.fecha_nacimiento).toISOString().split('T')[0]
      : undefined,
    ciudad: v.ciudad || undefined,
    direccion: v.direccion || undefined,
    valor_abono: cita.valor_abono,
  };

  this.agendaService.generatePaymentLink(datosPago).subscribe({
    next: (response) => {
      if (!response.success) {
        if (popup && !popup.closed) popup.close();
        return;
      }

      const boldUrl = response.data.url;
      const link = this.agendaService.currentPaymentLink();
      const nombreServicio = cita.servicio.web?.titulo_publico || cita.servicio.nombre_comercial || '';
      localStorage.setItem('servicio_reservado', nombreServicio);

      const popupAbierto = popup && !popup.closed;

      if (popupAbierto) {
        popup!.location.href = boldUrl;
        // Pestaña original arranca el polling
        this.router.navigate(['/validar-pago'], {
          queryParams: { 'bold-order-id': link ?? response.data.transaction_id },
        });
      } else {
        // Fallback: WebView in-app o popup blocker estricto.
        window.location.href = boldUrl;
      }
    },
    error: (err) => {
      if (popup && !popup.closed) popup.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.error?.message || 'Error al generar el link de pago',
      });
    },
  });
}
```

## Archivos críticos

- **Modificar:** [src/app/public/pages/detalle-pago/detalle-pago.component.ts](src/app/public/pages/detalle-pago/detalle-pago.component.ts) — solo el método `onSubmit()`.
- **No tocar:** [src/app/shared/services/agenda.service.ts](src/app/shared/services/agenda.service.ts) — el servicio sigue igual.
- **No tocar:** [src/app/public/pages/validar-pago/validar-pago.component.ts](src/app/public/pages/validar-pago/validar-pago.component.ts) — ya soporta tanto el caso popup (lee `bold-order-id` del query) como el caso same-tab fallback (mismo path desde el callback del backend).
- **No tocar backend:** ruta `/bold-callback` permanece igual.

## Verificación

### Prueba en escritorio
1. `npm start` (o el script de dev configurado).
2. Abrir el flujo en **Safari macOS** y reservar un servicio.
3. Confirmar que al hacer click en "Pagar":
   - Se abre una nueva pestaña que primero está en `about:blank` y luego carga la URL de Bold.
   - La pestaña original navega a `/validar-pago` y muestra "Validando tu pago...".
4. Repetir en **Chrome** y **Firefox** desktop — debe abrir la pestaña sin bloquear.

### Prueba en móvil
5. Abrir el sitio en **Safari iOS** (no en WebView). Confirmar el mismo comportamiento de dos pestañas.
6. Abrir el sitio desde el **navegador in-app de Instagram** (forzando con un link de prueba). Confirmar que el fallback redirige en la misma pestaña a Bold y que al volver del callback aterriza en `/validar-pago` con el `bold-order-id`.

### Prueba del flujo completo de pago
7. Pagar realmente con Bold (sandbox o producción según ambiente):
   - Pestaña popup: tras pagar, Bold redirige a `/bold-callback` → backend redirige a `/#/validar-pago?bold-order-id=...&bold-tx-status=approved`.
   - Pestaña original: el polling debe detectar `PAID` en máximo 5–10 s y mostrar la confirmación.
8. Probar también un pago **rechazado** y uno **cancelado** — ambos deben terminar el polling correctamente.

### Casos negativos
9. Bloquear popups manualmente en Safari (Preferencias → Sitios web → Ventanas emergentes → Bloquear). Confirmar que entra al fallback de `window.location.href`.
10. Cerrar la pestaña popup antes de pagar — confirmar que la pestaña original sigue en polling y que un eventual `PAID` se detecta igual.
