# Especificación completa para módulo de servicios (ERP + Landing)

## 1. Objetivo

Este documento define, con comportamiento detallado, todas las operaciones, reglas, validaciones, contratos y decisiones que una IA agente debe ejecutar para administrar el módulo de servicios de una peluquería, separando correctamente el ERP de la landing pública.

El documento está diseñado para que una IA pueda:

* crear
* editar
* validar
* ordenar
* publicar
* ocultar
* relacionar
* construir payloads para frontend
* respetar reglas de negocio
* no mezclar contenido editorial con datos operativos

---

## 2. Entidades del modelo

### 2.1 `servicio`

Entidad maestra del ERP.

Representa el servicio como producto/servicio del negocio.

#### Responsabilidad

* Existir como registro base del ERP
* Relacionarse con agenda, categorías, reportes, ventas u otras áreas del sistema
* Servir como origen maestro del contenido web

#### Comportamiento

* Puede existir sin configuración web
* Puede estar activo en ERP pero no publicado en web
* No debe depender de la landing para existir

#### Regla clave

`servicio` no debe crecer indefinidamente con columnas editoriales nuevas.

---

### 2.2 `servicio_web`

Configuración pública del servicio.

#### Responsabilidad

* Controlar cómo se publica el servicio en la landing
* Guardar metadatos generales visibles en la web
* Actuar como cabecera de la composición del detalle público

#### Regla clave

Debe existir máximo un registro `servicio_web` por cada `servicio`.

---

### 2.3 `servicio_web_seccion`

Bloques dinámicos del detalle web.

#### Responsabilidad

* Construir visualmente la landing del servicio
* Permitir flexibilidad sin cambiar el esquema principal
* Permitir orden, visibilidad y contenido específico por bloque

#### Regla clave

Cada fila es un bloque visual y funcional de la landing.

---

### 2.4 `atributo_servicio`

Catálogo de atributos/iconos reutilizables.

#### Responsabilidad

* Centralizar atributos globales como:

  * libre de formol
  * vegano
  * apto embarazadas
  * apto niñas
  * sin vapores tóxicos
  * sin ácido glioxílico
  * etc.

#### Regla clave

El atributo debe ser reutilizable entre múltiples servicios.

---

### 2.5 `servicio_atributo`

Tabla pivote entre servicio y atributo.

#### Responsabilidad

* Relacionar qué atributos aplica a cada servicio
* Permitir orden visual de los iconos

---

## 3. Regla de separación arquitectónica

### 3.1 Lo que pertenece a `servicio`

Va en `servicio` todo lo que sea núcleo del ERP:

* identificador
* nombre base
* tipo
* categoría
* estado interno
* datos operativos
* campos requeridos por agenda o ventas

### 3.2 Lo que pertenece a `servicio_web`

Va en `servicio_web` todo lo general de publicación:

* slug
* título público
* subtítulo
* imagen portada
* descripción corta
* botón agenda
* estado de publicación

### 3.3 Lo que pertenece a `servicio_web_seccion`

Va en `servicio_web_seccion` todo el contenido modular y cambiante:

* descripción larga
* recomendaciones
* beneficios
* promociones
* garantía
* diagnóstico
* advertencias
* FAQ
* CTA secundarios
* texto libre
* protocolos
* condiciones
* cualquier otro bloque que se muestre en landing

### 3.4 Lo que pertenece a tablas relacionales

Va en tablas relacionales lo reutilizable o consultable:

* iconos/atributos
* precios si luego se normalizan
* obsequios si luego se normalizan
* catálogos
* relaciones entre entidades

---

## 4. Campos esperados por entidad

## 4.1 `servicio`

La IA debe asumir esta tabla como existente.

Campos ya existentes relevantes:

* `id`
* `tipo_servicio_id`
* `servicio`
* `nombre_comercial`
* `descripcion`
* `duracion`
* `recomendaciones`
* `iconos`
* `obsequio`
* `imagen`
* `categoria_id`
* `estado`
* `created_at`
* `updated_at`

#### Regla de compatibilidad

Los campos antiguos (`descripcion`, `recomendaciones`, `iconos`, `obsequio`, `imagen`) pueden usarse como fallback mientras la migración al nuevo modelo no esté completa.

---

## 4.2 `servicio_web`

Campos:

* `id`
* `servicio_id`
* `slug`
* `titulo_publico`
* `subtitulo`
* `descripcion_corta`
* `imagen_portada`
* `texto_boton_agenda`
* `mostrar_agenda`
* `published`
* `created_at`
* `updated_at`

#### Reglas

* `servicio_id` único
* `slug` único
* `mostrar_agenda` controla visibilidad del CTA principal
* `published` controla disponibilidad pública

---

## 4.3 `servicio_web_seccion`

Campos:

* `id`
* `servicio_web_id`
* `tipo_seccion`
* `titulo`
* `subtitulo`
* `contenido_json`
* `orden`
* `visible`
* `created_at`
* `updated_at`

#### Reglas

* varias secciones por `servicio_web`
* orden ascendente por `orden`
* `visible = 0` implica no renderizar
* `contenido_json` debe validarse según el `tipo_seccion`

---

## 4.4 `atributo_servicio`

Campos:

* `id`
* `nombre`
* `slug`
* `icono`
* `descripcion`
* `activo`
* `created_at`
* `updated_at`

#### Reglas

* `slug` único
* si `activo = 0`, el atributo no debe ofrecerse para nuevas asignaciones
* si ya está asignado a servicios, puede mantenerse histórico

---

## 4.5 `servicio_atributo`

Campos:

* `id`
* `servicio_id`
* `atributo_id`
* `orden`
* `created_at`
* `updated_at`

#### Reglas

* evitar duplicados de la pareja (`servicio_id`, `atributo_id`)
* el `orden` define el orden de iconos en frontend

---

## 5. Catálogo obligatorio de tipos de sección

La IA debe soportar al menos estos tipos de sección.

## 5.1 `descripcion`

Bloque principal de descripción larga.

### Uso

Explica qué es el servicio, para quién sirve, qué tecnología usa, qué lo diferencia y cuál es su resultado esperado.

### JSON esperado

```json
{
  "parrafos": [
    "Texto 1",
    "Texto 2"
  ],
  "duracion": "6h",
  "resultado": "Liso con brillo espejo"
}
```

### Validaciones

* `parrafos` debe ser arreglo
* mínimo 1 párrafo
* máximo sugerido 10 párrafos
* `duracion` opcional
* `resultado` opcional

### Render

* mostrar `titulo`
* recorrer `parrafos`
* si existe `duracion`, mostrar badge o línea informativa
* si existe `resultado`, mostrar destacado breve

---

## 5.2 `recomendaciones`

Bloque de recomendaciones previas o posteriores.

### Uso

Indica instrucciones antes de agendar o antes/después del procedimiento.

### JSON esperado

```json
{
  "momento": "antes",
  "items": [
    "No aplicar crema de peinar",
    "No asistir con cabello mojado"
  ]
}
```

### Validaciones

* `items` obligatorio
* `items` debe ser arreglo no vacío
* `momento` opcional, valores sugeridos: `antes`, `despues`, `general`

### Render

* mostrar `titulo`
* mostrar lista de bullets
* si existe `momento`, usarlo para etiqueta contextual

---

## 5.3 `beneficios`

Lista de beneficios o resultados positivos.

### JSON esperado

```json
{
  "items": [
    "Control de frizz",
    "Mayor brillo",
    "Disminución del quiebre"
  ]
}
```

### Validaciones

* `items` obligatorio
* cada item debe ser string

### Render

* listado visual con íconos de check o cards breves

---

## 5.4 `promocion`

Bloque comercial de campaña o descuento.

### JSON esperado

```json
{
  "titulo_destacado": "PROMO AMIGA -20%",
  "descripcion": "La promoción se activa si dos personas separan cita el mismo día.",
  "condiciones": [
    "Ambas deben abonar el mismo día",
    "Pueden asistir en horarios distintos"
  ],
  "vigencia": "Válido durante octubre"
}
```

### Validaciones

* al menos uno de estos campos debe existir: `titulo_destacado`, `descripcion`
* `condiciones` opcional
* `vigencia` opcional

### Render

* bloque visual destacado
* mostrar condiciones como lista si existen
* mostrar vigencia como texto secundario

---

## 5.5 `garantia`

Bloque de garantía comercial o técnica.

### JSON esperado

```json
{
  "dias": 20,
  "texto": "El servicio cuenta con garantía de 20 días por protocolo técnico.",
  "condiciones": [
    "Debe seguirse el cuidado indicado",
    "No aplica por procedimientos externos posteriores"
  ]
}
```

### Validaciones

* `texto` obligatorio
* `dias` opcional numérico entero positivo
* `condiciones` opcional

### Render

* destacar días si existen
* mostrar texto principal
* mostrar condiciones debajo

---

## 5.6 `diagnostico`

Bloque que indica necesidad de valoración previa.

### JSON esperado

```json
{
  "obligatorio": true,
  "texto": "Se requiere diagnóstico capilar previo antes de confirmar la cita.",
  "canal": "WhatsApp",
  "instrucciones": [
    "Enviar foto frontal",
    "Enviar foto posterior",
    "Indicar historial químico"
  ]
}
```

### Validaciones

* `texto` obligatorio
* `obligatorio` booleano opcional
* `instrucciones` opcional arreglo

### Render

* badge de obligatorio/opcional
* texto explicativo
* lista de instrucciones si existe

---

## 5.7 `tribu_vip`

Bloque de comunidad, beneficios extras o membresía.

### JSON esperado

```json
{
  "descripcion": "Accede a beneficios exclusivos por pertenecer a la comunidad.",
  "beneficios": [
    "Descuentos futuros",
    "Acceso prioritario",
    "Promociones exclusivas"
  ]
}
```

### Validaciones

* `descripcion` obligatoria o `beneficios` no vacío

### Render

* sección promocional comunitaria
* lista de beneficios

---

## 5.8 `consideraciones_tecnicas`

Bloque de reglas técnicas del procedimiento.

### JSON esperado

```json
{
  "items": [
    "No apto para cuero cabelludo irritado",
    "Debe respetarse el tiempo de evaluación"
  ]
}
```

### Validaciones

* `items` obligatorio

### Render

* lista de advertencias o consideraciones

---

## 5.9 `obsequios`

Bloque de regalos incluidos.

### JSON esperado

```json
{
  "items": [
    "Cepillo de mantenimiento",
    "Mini shampoo post cuidado"
  ]
}
```

### Validaciones

* `items` obligatorio

### Render

* lista de obsequios
* puede mostrarse con estilo de bonus/regalo

---

## 5.10 `texto_libre`

Bloque flexible no tipificado.

### Uso

Permite contenido editorial ocasional sin crear un tipo nuevo inmediatamente.

### JSON esperado

```json
{
  "html": "<p>Texto libre</p>"
}
```

o

```json
{
  "texto": "Texto libre simple"
}
```

### Validaciones

* debe existir `html` o `texto`
* si se usa `html`, debe sanitizarse

### Render

* si hay `html`, render seguro sanitizado
* si hay `texto`, render como párrafo

---

## 5.11 `faq`

Preguntas frecuentes.

### JSON esperado

```json
{
  "items": [
    {
      "pregunta": "¿Cuánto dura el procedimiento?",
      "respuesta": "Depende de la longitud y densidad del cabello."
    },
    {
      "pregunta": "¿Es apto para embarazadas?",
      "respuesta": "Sí, si el atributo del servicio lo indica."
    }
  ]
}
```

### Validaciones

* `items` obligatorio
* cada item debe contener `pregunta` y `respuesta`

### Render

* acordeón o lista expandible

---

## 5.12 `cta_secundario`

Llamado a la acción complementario.

### JSON esperado

```json
{
  "texto": "Solicita diagnóstico",
  "url": "/diagnostico",
  "target": "_self"
}
```

### Validaciones

* `texto` obligatorio
* `url` obligatoria
* `target` opcional: `_self`, `_blank`

### Render

* botón secundario o link destacado

---

## 5.13 `video`

Video embebido o enlace a multimedia.

### JSON esperado

```json
{
  "titulo": "Conoce el procedimiento",
  "url": "https://youtube.com/...",
  "thumbnail": "/uploads/thumb.jpg"
}
```

### Validaciones

* `url` obligatoria
* validar dominio permitido si aplica

### Render

* tarjeta de video o iframe seguro según política del frontend

---

## 5.14 `galeria`

Galería de imágenes del servicio.

### JSON esperado

```json
{
  "imagenes": [
    "/uploads/servicios/1.jpg",
    "/uploads/servicios/2.jpg"
  ]
}
```

### Validaciones

* `imagenes` obligatorio
* mínimo 1 imagen

### Render

* carrusel o grid de imágenes

---

## 5.15 `advertencias`

Advertencias o contraindicaciones.

### JSON esperado

```json
{
  "items": [
    "No aplicar en caso de irritación severa",
    "Debe realizarse prueba previa en casos sensibles"
  ]
}
```

### Validaciones

* `items` obligatorio

### Render

* bloque visual de alerta

---

## 5.16 `precios_referencia`

Bloque temporal para mostrar precios si aún no existe tabla normalizada de precios.

### JSON esperado

```json
{
  "moneda": "COP",
  "items": [
    {"label": "Talla S", "precio": 120000},
    {"label": "Talla M", "precio": 150000},
    {"label": "Talla L", "precio": 180000}
  ]
}
```

### Validaciones

* `items` obligatorio
* cada item debe contener `label` y `precio`
* `precio` numérico

### Render

* tabla o cards de precio

### Nota

Cuando el módulo de precios se normalice, esta sección debe deprecarse.

---

## 5.17 `galeria_con_texto`

Galería de imágenes organizadas por filas, donde cada fila agrupa N imágenes junto a un texto descriptivo. Ideal para mostrar resultados antes/después con etiqueta.

### Uso

Mostrar fotografías de resultados con una descripción al costado derecho (ej: "Resultado 1: Relajación de onda de un 20%").

### JSON esperado

```json
{
  "columnas_imagen": 2,
  "items": [
    {
      "imagenes": ["/storage/imagenes/servicios-web/antes1.jpg", "/storage/imagenes/servicios-web/despues1.jpg"],
      "texto": "Resultado 1: Relajación de onda de un 20%"
    },
    {
      "imagenes": ["/storage/imagenes/servicios-web/antes2.jpg", "/storage/imagenes/servicios-web/despues2.jpg"],
      "texto": "Resultado 2: Relajación de onda de un 40%"
    }
  ]
}
```

### Campos

| Campo            | Tipo    | Descripción                                                     |
|------------------|---------|-----------------------------------------------------------------|
| `columnas_imagen`| integer | Número de columnas de imagen por fila: `1`, `2` ó `3`          |
| `items`          | array   | Lista de filas; cada fila tiene `imagenes[]` y `texto`          |
| `items[].imagenes` | string[] | URLs de las imágenes de esa fila (mín. 1)                  |
| `items[].texto`  | string  | Descripción o etiqueta de resultado de esa fila                 |

### Validaciones

* `items` obligatorio y no vacío
* cada item debe tener `imagenes` como arreglo no vacío y `texto` como string
* `columnas_imagen` opcional; si se omite asumir `2`
* `texto` es texto plano (no HTML)

### Layout recomendado

```
[  img  ] [  img  ] [ texto  ]
[  img  ] [  img  ] [ texto  ]
```

Con `columnas_imagen: 2`, el grid total por fila es de 3 columnas (2 de imagen + 1 de texto).

### Render

* Recorrer `items`
* Por cada item: mostrar `columnas_imagen` columnas de imagen + 1 columna de texto a la derecha
* Usar CSS Grid o Flexbox; en mobile colapsar a columna única (imágenes arriba, texto abajo)
* El texto puede centrarse verticalmente respecto a las imágenes

---

## 6. Operaciones exactas por entidad

## 6.1 Operaciones sobre `servicio`

### Crear servicio

La IA debe:

1. validar datos mínimos
2. crear registro en `servicio`
3. marcar estado según política del ERP
4. devolver ID generado

#### Validaciones mínimas

* `servicio` obligatorio
* `tipo_servicio_id` obligatorio si el ERP lo exige
* `categoria_id` obligatorio si el ERP lo exige

### Editar servicio

La IA debe permitir actualizar:

* nombre del servicio
* nombre comercial
* descripción legado
* duración
* imagen
* estado
* categoría
* tipo

### Desactivar servicio

La IA debe preferir eliminación lógica:

* cambiar `estado` a inactivo
* no borrar físicamente salvo solicitud explícita y segura

### Consultar servicio

La IA debe poder buscar por:

* `id`
* nombre exacto
* nombre comercial
* categoría
* estado

---

## 6.2 Operaciones sobre `servicio_web`

### Crear configuración web

La IA debe:

1. verificar que el `servicio` exista
2. verificar que no exista ya otro `servicio_web` para ese servicio
3. generar o validar `slug`
4. persistir configuración

### Validaciones

* `slug` único
* `titulo_publico` obligatorio
* `servicio_id` obligatorio

### Editar configuración web

La IA debe permitir actualizar:

* `slug`
* `titulo_publico`
* `subtitulo`
* `descripcion_corta`
* `imagen_portada`
* `texto_boton_agenda`
* `mostrar_agenda`
* `published`

### Publicar

* poner `published = 1`
* validar que exista al menos configuración mínima

### Despublicar

* poner `published = 0`
* mantener configuración sin borrar

### Consultar landing base

* buscar `servicio_web` por `servicio_id` o `slug`

---

## 6.3 Operaciones sobre `servicio_web_seccion`

### Crear sección

La IA debe:

1. validar que exista `servicio_web`
2. validar `tipo_seccion`
3. validar forma del `contenido_json`
4. asignar `orden`
5. guardar con `visible = 1` por defecto

### Regla de orden

Si no se envía `orden`, usar el siguiente disponible al final.

### Editar sección

La IA debe poder actualizar:

* `titulo`
* `subtitulo`
* `contenido_json`
* `orden`
* `visible`

### Eliminar sección

Dos comportamientos posibles:

* preferido: eliminación física del bloque si es editorial y no deja trazabilidad requerida
* alternativo: `visible = 0` si se requiere conservar histórico visual

### Reordenar secciones

La IA debe:

1. recibir lista ordenada de IDs o movimientos
2. actualizar `orden`
3. garantizar que no queden órdenes repetidos dentro del mismo `servicio_web`

### Ocultar/mostrar sección

* ocultar: `visible = 0`
* mostrar: `visible = 1`

### Duplicar sección

La IA puede:

1. copiar `tipo_seccion`
2. copiar `titulo`
3. copiar `subtitulo`
4. copiar `contenido_json`
5. asignar nuevo `orden`

---

## 6.4 Operaciones sobre `atributo_servicio`

### Crear atributo

La IA debe:

* validar `nombre`
* generar `slug`
* guardar ruta de icono
* definir `activo = 1` por defecto

### Editar atributo

Permitir actualizar:

* `nombre`
* `slug`
* `icono`
* `descripcion`
* `activo`

### Desactivar atributo

* `activo = 0`
* no borrar si está en uso, salvo decisión explícita

### Consultar atributos

Permitir búsqueda por:

* nombre
* slug
* activo

---

## 6.5 Operaciones sobre `servicio_atributo`

### Asignar atributo a servicio

La IA debe:

1. validar que exista `servicio`
2. validar que exista `atributo`
3. verificar que la relación no exista ya
4. insertar relación con `orden`

### Remover atributo de servicio

* eliminar relación pivote

### Reordenar atributos

* actualizar `orden` dentro del servicio

### Consultar atributos de un servicio

* devolver ordenados por `orden ASC`

---

## 7. Contrato de validación por tipo de sección

La IA debe validar el `contenido_json` antes de guardar.

## 7.1 Reglas generales

* debe ser JSON válido
* no debe exceder límites definidos por backend
* no debe guardar claves inesperadas si el sistema es estricto
* si se permite flexibilidad, las claves desconocidas deben ignorarse o registrarse

## 7.2 Regla de sanitización

* cualquier campo HTML debe sanitizarse
* cualquier URL debe validarse
* cualquier imagen debe validarse contra storage permitido

## 7.3 Regla de consistencia

* no guardar una sección visible sin contenido útil
* no guardar listas vacías salvo que el tipo explícitamente lo permita

---

## 8. Construcción de la landing pública

La IA o backend debe construir la landing así:

### Paso 1

Buscar el `servicio`.

### Paso 2

Buscar `servicio_web` por `servicio_id` o `slug`.

### Paso 3

Validar que `published = 1` para vista pública.

### Paso 4

Cargar secciones de `servicio_web_seccion` donde:

* `visible = 1`
* ordenadas por `orden ASC`

### Paso 5

Cargar atributos desde `servicio_atributo` + `atributo_servicio`.

### Paso 6

Construir payload final.

## Payload sugerido

```json
{
  "servicio": {
    "id": 10,
    "nombre": "Sistema Liso HD OLED",
    "categoria_id": 2
  },
  "web": {
    "slug": "sistema-liso-hd-oled",
    "titulo_publico": "SISTEMA DE LISO HD OLED",
    "subtitulo": "Sistemas de alisado / antifrizz",
    "descripcion_corta": "Alisante profesional de nueva generación.",
    "imagen_portada": "/uploads/servicios/liso-hd-oled.jpg",
    "texto_boton_agenda": "AGENDA AQUI",
    "mostrar_agenda": true,
    "published": true
  },
  "atributos": [
    {
      "id": 1,
      "nombre": "Libre de formol",
      "slug": "libre-formol",
      "icono": "/icons/formol.png",
      "orden": 1
    }
  ],
  "secciones": [
    {
      "id": 1,
      "tipo_seccion": "descripcion",
      "titulo": "SISTEMA DE LISO HD OLED",
      "subtitulo": null,
      "contenido": {
        "parrafos": ["Texto 1", "Texto 2"],
        "duracion": "6h"
      },
      "orden": 1
    }
  ]
}
```

---

## 9. Reglas de fallback durante migración

Mientras la migración no esté completa, la IA puede usar datos heredados de `servicio`.

### Fallback sugerido

* si no hay `servicio_web.descripcion_corta`, usar `servicio.descripcion`
* si no hay imagen_portada, usar `servicio.imagen`
* si no hay bloque `recomendaciones`, usar `servicio.recomendaciones`
* si no hay atributos normalizados, leer `servicio.iconos` solo como legado temporal
* si no hay obsequios normalizados o en secciones, usar `servicio.obsequio`

### Regla

El fallback es transitorio, no el modelo objetivo.

---

## 10. Comportamiento del panel admin esperado

La IA debe asumir que el panel admin opera sobre formularios, no sobre JSON manual.

## 10.1 Flujo de administración del servicio

1. seleccionar servicio
2. editar datos ERP
3. abrir configuración web
4. crear/editar secciones
5. asignar iconos
6. ordenar bloques
7. publicar o despublicar

## 10.2 Comportamiento del editor de secciones

Cuando el usuario agrega una sección, el sistema debe:

1. pedir tipo de sección
2. mostrar formulario según tipo
3. mapear formulario a `contenido_json`
4. guardar sin exponer JSON crudo al usuario final

## 10.3 Ejemplos de formularios

### Formulario para `recomendaciones`

* título
* lista dinámica de items
* selector momento

### Formulario para `faq`

* título
* filas repetibles de pregunta/respuesta

### Formulario para `promocion`

* título destacado
* descripción
* lista de condiciones
* vigencia

### Formulario para `garantia`

* días
* texto
* lista de condiciones

---

## 11. Reglas de integridad y errores

La IA debe devolver errores claros en estos casos:

### Errores de servicio

* servicio no existe
* servicio inactivo si la operación requiere activo

### Errores de servicio_web

* ya existe configuración web para el servicio
* slug duplicado
* configuración inexistente

### Errores de secciones

* tipo_seccion inválido
* JSON inválido
* contenido obligatorio ausente
* orden inconsistente

### Errores de atributos

* atributo no existe
* atributo duplicado en el mismo servicio

---

## 12. Reglas de evolución futura

La IA debe respetar estas decisiones:

1. si aparece un nuevo bloque frecuente, crear un nuevo `tipo_seccion` formal
2. si un bloque comienza a requerir consultas, filtros o reportes, sacarlo del JSON a tabla relacional
3. si un contenido deja de ser editorial y pasa a ser de negocio, normalizarlo

---

## 13. Decisiones técnicas obligatorias

### 13.1 JSON se usa para

* contenido editorial flexible
* listas de textos
* FAQ
* promos
* bloques que cambian de forma con frecuencia

### 13.2 Tablas relacionales se usan para

* atributos/iconos
* futuras tablas de precios
* futuras tablas de obsequios si requieren control fuerte
* relaciones reutilizables

### 13.3 Publicación pública depende de

* `servicio_web.published = 1`
* existencia del servicio
* disponibilidad del slug

---

## 14. Lista resumida de funciones que la IA debe soportar

### Servicios

* crear servicio
* editar servicio
* consultar servicio
* desactivar servicio

### Configuración web

* crear servicio_web
* editar servicio_web
* publicar servicio_web
* despublicar servicio_web
* consultar por slug

### Secciones

* crear sección
* editar sección
* eliminar sección
* ocultar sección
* mostrar sección
* duplicar sección
* reordenar secciones
* validar contenido_json por tipo

### Atributos

* crear atributo
* editar atributo
* desactivar atributo
* consultar atributos
* asignar atributo a servicio
* remover atributo de servicio
* reordenar atributos

### Landing

* construir payload landing
* aplicar fallback legado si corresponde
* devolver solo secciones visibles y ordenadas

---

## 15. Regla final de comportamiento de la IA

La IA nunca debe tratar `servicio` como si fuera suficiente para resolver la landing moderna.

Debe pensar así:

* `servicio` = identidad del negocio
* `servicio_web` = cabecera pública
* `servicio_web_seccion` = bloques de contenido
* `atributo_servicio` = catálogo reusable
* `servicio_atributo` = asociación visual del servicio

La IA debe ser estricta en validaciones, consistente en orden, cuidadosa en publicación, y flexible en la composición del contenido.

---

## 16. Fin

Este documento es la base operativa para cualquier agente IA, backend, CRUD administrativo o API que manipule el módulo de servicios y su landing pública.
