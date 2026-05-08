# Análisis de errores – Callback Bold en producción

## Descripción del problema

Al completar un pago en Bold, el sistema devuelve un error **400** cuando Bold intenta redirigir al usuario de vuelta a la aplicación. El comportamiento observado es:

- **En local:** funciona correctamente
- **En producción:** error 400 al momento del callback
- **URL final pegada manualmente:** funciona sin problema

Esto indica que la URL generada es correcta, pero algo falla cuando **Bold realiza la redirección al servidor** antes de llegar a la app Angular.

---

## Flujo actual del callback

```
Usuario paga en Bold
    ↓
Bold redirige el navegador →
    GET https://sos.fhernandez-dev.com/bold-callback
        ?bold-order-id=LNK_xxx
        &bold-tx-status=approved
    ↓
Laravel (routes/web.php) →
    return redirect('https://soscentrocapilar.com/#/validar-pago?bold-order-id=LNK_xxx&bold-tx-status=approved')
    ↓
Navegador llega a la app Angular en /validar-pago ✓
```

El error 400 ocurre en el paso 2, antes de que Laravel pueda hacer la redirección.

---

## Posibles causas (ordenadas por probabilidad)

### A. CALLBACK_URL apunta al servidor de desarrollo, no al de producción *(más probable)*

El `.env` actual tiene:
```
CALLBACK_URL='https://sos.fhernandez-dev.com/bold-callback'
```

`sos.fhernandez-dev.com` parece ser el servidor de desarrollo. En producción de Bold, cuando se generan links con credenciales reales, Bold puede:
- Validar que el dominio del callback esté registrado en su dashboard
- Rechazar callbacks a dominios no aprobados o de desarrollo

**Verificar:**
- ¿La `CALLBACK_URL` en el `.env` del servidor de producción apunta al dominio correcto?
- ¿Ese dominio coincide con el registrado en el dashboard de Bold para las credenciales de producción?

---

### B. La ruta `/bold-callback` no está desplegada o no existe en producción

Si el deploy más reciente no incluyó esta ruta o se hizo `route:cache` antes de agregarla, Laravel devolvería 404 (que algunos clientes pueden mostrar como 400).

**Verificar en el servidor de producción:**
```bash
php artisan route:list | grep bold-callback
```

Si no aparece:
```bash
php artisan route:clear
php artisan route:cache
```

---

### C. La ruta está dentro de un grupo con middleware de autenticación

Si en `routes/web.php` la ruta `/bold-callback` está anidada dentro de un grupo con middleware `auth` o `sanctum`, Laravel devolverá un redirect al login o un 401.

El usuario llega desde Bold **sin sesión activa** en el servidor, por lo que cualquier middleware de autenticación la bloqueará.

**Verificar en `routes/web.php`:**
```php
// INCORRECTO - dentro de grupo auth
Route::middleware(['auth'])->group(function () {
    Route::get('/bold-callback', ...); // ← PROBLEMA
});

// CORRECTO - fuera de cualquier grupo protegido
Route::get('/bold-callback', function (Request $request) {
    return redirect('https://soscentrocapilar.com/#/validar-pago?...');
});
```

---

### D. URL de callback diferente registrada en el dashboard de Bold

Bold valida que la URL a la que redirige coincida con la registrada en su panel de control. Si en el dashboard de Bold producción está configurada una URL diferente a `sos.fhernandez-dev.com/bold-callback`, la redirección fallará.

**Verificar:**
- Ingresar al dashboard de Bold con las credenciales de producción
- Revisar la configuración de URL de retorno / callback URL
- Confirmar que coincide exactamente con el valor en `CALLBACK_URL` del `.env`

---

### E. Credenciales de Bold (API Key) de producción incorrectas

Si el `.env` de producción usa credenciales de sandbox/prueba de Bold, la API de Bold rechazará las peticiones al generar links o al validar pagos.

**Verificar:**
- `BOLD_API_KEY` (o variable equivalente) en `.env` de producción
- Comparar con las credenciales del dashboard de Bold (producción vs. sandbox)
- Los links generados con credenciales de sandbox no son válidos en producción y viceversa

---

### F. Certificado SSL inválido o expirado en `sos.fhernandez-dev.com`

Bold exige que los callbacks sean a URLs HTTPS con certificado válido en producción. Si el certificado de `sos.fhernandez-dev.com` expiró o es autofirmado, Bold puede rechazar la redirección.

**Verificar:**
```bash
curl -vI https://sos.fhernandez-dev.com/bold-callback
```
Confirmar que no hay errores de certificado en la respuesta.

---

### G. WAF o reglas de Nginx/Apache bloqueando la petición

El servidor de producción puede tener un Web Application Firewall o reglas de servidor que rechacen peticiones que:
- Lleguen con un User-Agent de Bold
- Contengan ciertos query params
- Vengan de las IPs de Bold

**Verificar:**
```bash
# Logs de Nginx en tiempo real
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Logs de Apache
tail -f /var/log/apache2/error.log
```

Buscar entradas al momento del error.

---

### H. Route cache desactualizado

Si se ejecutó `php artisan route:cache` antes de agregar la ruta `/bold-callback`, la ruta no estará disponible.

**Solución:**
```bash
php artisan route:clear
php artisan route:cache
# o simplemente:
php artisan optimize:clear
```

---

## Revisión del código de la ruta actual

```php
Route::get('/bold-callback', function (Request $request) {
    return redirect('https://soscentrocapilar.com/#/validar-pago?bold-order-id=' 
        . $request->query('bold-order-id') 
        . '&bold-tx-status=' . $request->query('bold-tx-status'));
    // return redirect('http://localhost:4200/#/validar-pago?bold-order-id=' 
    //     . $request->query('bold-order-id') 
    //     . '&bold-tx-status=' . $request->query('bold-tx-status'));
});
```

**Mejoras recomendadas para diagnóstico y robustez:**

```php
Route::get('/bold-callback', function (Request $request) {
    // Log para diagnóstico en producción
    \Log::info('Bold callback recibido', [
        'bold-order-id' => $request->query('bold-order-id'),
        'bold-tx-status' => $request->query('bold-tx-status'),
        'ip' => $request->ip(),
        'user_agent' => $request->userAgent(),
    ]);

    $orderId = $request->query('bold-order-id', '');
    $txStatus = $request->query('bold-tx-status', '');

    if (empty($orderId)) {
        \Log::warning('Bold callback sin bold-order-id');
        return response('Bad Request: missing bold-order-id', 400);
    }

    $targetUrl = config('app.frontend_url') . '/#/validar-pago'
        . '?bold-order-id=' . $orderId
        . '&bold-tx-status=' . $txStatus;

    return redirect($targetUrl);
});
```

Agregar en `.env`:
```
FRONTEND_URL=https://soscentrocapilar.com
```

---

## Checklist de verificación para el equipo backend

```
[ ] 1. Confirmar CALLBACK_URL en .env de producción apunta al dominio correcto
[ ] 2. Confirmar que ese dominio está registrado en el dashboard de Bold producción
[ ] 3. Verificar que la ruta /bold-callback aparece: php artisan route:list | grep bold-callback
[ ] 4. Confirmar que la ruta NO está dentro de un grupo con middleware auth/sanctum
[ ] 5. Verificar credenciales de Bold en .env de producción (producción vs. sandbox)
[ ] 6. Comprobar SSL: curl -vI https://sos.fhernandez-dev.com/bold-callback
[ ] 7. Revisar logs de Laravel: tail -f storage/logs/laravel.log
[ ] 8. Revisar logs de Nginx/Apache al momento del error
[ ] 9. Ejecutar: php artisan route:clear && php artisan route:cache
[ ] 10. Probar manualmente el endpoint:
         curl -I "https://sos.fhernandez-dev.com/bold-callback?bold-order-id=TEST&bold-tx-status=approved"
         (debe devolver 302, no 400)
[ ] 11. Agregar Log::info en la ruta y confirmar que el log aparece en producción
```

---

## Solución recomendada

Si el servidor de callback correcto para producción debe ser distinto a `sos.fhernandez-dev.com`:

1. Actualizar en `.env` de producción:
   ```
   CALLBACK_URL=https://[dominio-produccion]/bold-callback
   ```

2. Registrar esa misma URL en el dashboard de Bold (cuenta de producción)

3. Verificar que el servidor de producción tiene la ruta desplegada y accesible

4. Agregar logs temporales a la ruta para confirmar que llega la petición de Bold

---

## Nota sobre el flujo Angular

El frontend Angular no tiene errores relacionados con este problema. La app:
- Abre Bold en nueva pestaña con `window.open(boldUrl, '_blank')`
- Navega a `/validar-pago` en la pestaña principal y hace polling cada 5s
- El polling detectará el pago como `PAID` independientemente del callback

El **único problema** es que la pestaña de Bold no regresa correctamente a la app por el error 400 en el callback. El polling en la pestaña principal debería seguir funcionando mientras el backend valide el pago correctamente.
