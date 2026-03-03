# Sistema de Iconos - Documentación

## Cómo guardar iconos en la base de datos

El sistema soporta dos tipos de iconos:

### 1. Iconos de Material Symbols (Google)
Formato: `material:nombre_icono`

Ejemplo:
```
material:pregnant_woman|material:eco|material:breastfeeding
```

### 2. Iconos personalizados (SVG)
Formato: `custom:nombre_archivo` (sin extensión .svg)

Ejemplo:
```
custom:vegano|custom:organico
```

### Mezclar ambos tipos
```
material:pregnant_woman|material:eco|custom:vegano|material:girl
```

## En Laravel (Backend)

```php
// Ejemplo de cómo guardar en la base de datos
$servicio->iconos = 'material:pregnant_woman|material:eco|custom:vegano|material:breastfeeding';
$servicio->save();
```

## Agregar nuevos iconos SVG

1. Coloca el archivo SVG en: `public/icons/`
2. Usa el nombre del archivo (sin .svg) en la BD con formato: `custom:nombre`

Ejemplo: 
- Archivo: `public/icons/vegano.svg`
- En BD: `custom:vegano`

## Formato Visual

Los iconos se mostrarán inline, separados automáticamente con el spacing correcto (4px entre cada uno).

Todos los iconos tendrán:
- Tamaño: 24x24px
- Alineación vertical: middle
- Espaciado: 4px entre iconos
