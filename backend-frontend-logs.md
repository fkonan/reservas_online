# Backend — Frontend Logs (Laravel)

Son 3 archivos nuevos + 1 línea en `routes/api.php`. No toca nada existente.

> **Nota sobre el `id`:** La tabla usa `id` BIGINT AUTO_INCREMENT (estándar Laravel).
> El UUID que genera el frontend se guarda en `frontend_id` (columna UNIQUE) y se usa
> para evitar registros duplicados si el frontend reintenta el POST.

---

## Paso 1 — Modelo

```bash
php artisan make:model FrontendLog
```

```php
<?php
// app/Models/FrontendLog.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FrontendLog extends Model
{
    public $timestamps = false; // created_at lo manejamos manualmente

    protected $fillable = [
        'frontend_id',
        'ts',
        'ts_local',
        'session_id',
        'type',
        'message',
        'stack',
        'url',
        'http_method',
        'http_url',
        'http_status',
        'user_agent',
        'extra',
        'created_at',
        'ip',
    ];

    protected $casts = [
        'extra' => 'array',
        'ts'    => 'datetime',
    ];
}
```

---

## Paso 2 — Controlador

```bash
php artisan make:controller FrontendLogController
```

```php
<?php
// app/Http/Controllers/FrontendLogController.php

namespace App\Http\Controllers;

use App\Models\FrontendLog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FrontendLogController extends Controller
{
    public function store(Request $request): Response
    {
        $data = $request->validate([
            'id'          => 'required|string|max:36',
            'ts'          => 'nullable|string',
            'ts_local'    => 'nullable|string|max:60',
            'session'     => 'nullable|string|max:36',
            'type'        => 'required|string|max:30',
            'message'     => 'required|string',
            'stack'       => 'nullable|string',
            'url'         => 'nullable|string|max:500',
            'httpDetails' => 'nullable|array',
            'userAgent'   => 'nullable|string|max:500',
            'extra'       => 'nullable|array',
        ]);

        // Busca por frontend_id (UUID del browser) para evitar duplicados en reintentos
        FrontendLog::firstOrCreate(
            ['frontend_id' => $data['id']],
            [
                'ts'          => $data['ts'] ?? null,
                'ts_local'    => $data['ts_local'] ?? null,
                'session_id'  => $data['session'] ?? null,
                'type'        => $data['type'],
                'message'     => $data['message'],
                'stack'       => $data['stack'] ?? null,
                'url'         => $data['url'] ?? null,
                'http_method' => $data['httpDetails']['method'] ?? null,
                'http_url'    => $data['httpDetails']['requestUrl'] ?? null,
                'http_status' => $data['httpDetails']['status'] ?? null,
                'user_agent'  => $data['userAgent'] ?? null,
                'extra'       => $data['extra'] ?? null,
                'created_at'  => now(),
                'ip'          => $request->ip(),
            ]
        );

        return response()->noContent(); // 204 — el frontend no lee el body
    }
}
```

---

## Paso 3 — Ruta

En `routes/api.php`, agregar **fuera** de cualquier grupo que use `auth` o middleware de token:

```php
use App\Http\Controllers\FrontendLogController;

// Sin autenticación — los errores ocurren antes o durante el login
Route::post('/frontend-logs', [FrontendLogController::class, 'store'])
     ->middleware('throttle:10,1'); // máx 10 req/minuto por IP
```

---

## Paso 4 — Habilitar CORS para este endpoint

El frontend usa `fetch()` nativo (no Angular HttpClient), por lo que el backend
debe permitir el origen de la app en este endpoint. En `config/cors.php`:

```php
'paths' => ['api/*'],  // ya debería estar así
```

Si el proyecto tiene CORS restringido por origen, agregar el dominio del frontend
a `allowed_origins`.

---

## Query para diagnosticar el problema del spinner atascado

```sql
SELECT ts_local, type, message, url, http_url, http_status, user_agent, extra, ip
FROM frontend_logs
WHERE type IN ('stuck_loading', 'http_error')
ORDER BY created_at DESC
LIMIT 50;
```

- **`stuck_loading`** → muestra cuántas peticiones quedaron abiertas (`extra.activeRequests`)
- **`http_error`** → muestra qué endpoint falla y con qué código HTTP

---

## Activar el envío desde el frontend

Una vez el endpoint esté funcionando, editar `src/app/environments/env.dev.ts`:

```typescript
logUrl: `https://sos.fhernandez-dev.com/api/frontend-logs`,
```

Mientras esté vacío (`''`) los errores solo se guardan en `localStorage` del navegador.
