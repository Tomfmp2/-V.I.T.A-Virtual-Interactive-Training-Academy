# Estilos y tokens de diseño

## Cómo se organizan los estilos

| Archivo | Alcance |
| --- | --- |
| `src/styles/tokens.css` | Variables CSS con la paleta, sombras y radios. Única fuente de verdad del diseño |
| `src/styles/globals.css` | Reset, tipografía base y utilidades globales |
| `src/index.css` | Punto de entrada que importa lo anterior y Tailwind |
| `src/pages/<Pantalla>.css` | Estilos propios de una pantalla |
| `src/components/**/<Componente>.css` | Estilos de un componente reutilizable |

La regla es simple: **si un estilo se usa en un solo sitio, vive junto a ese sitio**.
Solo se sube a `globals.css` lo que se repite en tres o más pantallas.

## Tokens disponibles

Definidos en `:root` dentro de `src/styles/tokens.css`.

### Marca

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-brand-600` | `#00e676` | Color de acción principal, botones y foco |
| `--color-brand-500` | `#10b981` | Variante para estados hover |
| `--color-brand-100` | verde al 10 por ciento | Fondos suaves y resaltados |

### Superficies

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-surface-950` | `#0f172a` | Fondo de la aplicación |
| `--color-surface-900` | `#111827` | Barra lateral y cabecera |
| `--color-surface-800` | `#1e293b` | Tarjetas y paneles |
| `--color-surface-700` | `#334155` | Campos de formulario |
| `--color-surface-100` | `#f8fafc` | Superficies claras |

### Texto y bordes

| Token | Uso |
| --- | --- |
| `--color-text-100` | Texto principal sobre fondo oscuro |
| `--color-text-200` | Texto secundario sobre fondo oscuro |
| `--color-text-400` | Texto atenuado, etiquetas y descripciones |
| `--color-text-900` | Texto sobre fondo claro |
| `--color-border-500` | Bordes de tarjetas y campos |
| `--color-border-400` | Bordes en estado hover o activo |

### Formas y profundidad

| Token | Valor |
| --- | --- |
| `--radius-card` | `16px` |
| `--radius-input` | `10px` |
| `--shadow-soft` | Sombra de reposo de tarjetas |
| `--shadow-brand` | Sombra verde para elementos destacados |

### Alias heredados

El archivo también expone alias sin prefijo (`--primary`, `--background`,
`--text-primary`, `--surface`, entre otros) que quedaron de la primera versión de
la interfaz. Siguen funcionando, pero **el código nuevo debe usar los tokens con
prefijo** (`--color-brand-600` en lugar de `--primary`). Así los alias se pueden
retirar más adelante sin tocar pantallas.

## Tipografía

La fuente es Plus Jakarta Sans, instalada como paquete (`@fontsource/plus-jakarta-sans`)
en lugar de cargarse desde un CDN. Eso evita una petición externa en el arranque y
mantiene el render estable sin conexión.

## Tailwind CSS

Tailwind 4 está disponible a través del plugin de Vite y se usa para ajustes
puntuales de maquetación. La identidad visual se define con los tokens y el CSS
propio, no con cadenas largas de clases utilitarias.

Criterio para decidir: si necesitas un color, un radio o una sombra, usa un token.
Si necesitas resolver un `flex` o un espaciado aislado, una utilidad de Tailwind
está bien.

## Accesibilidad

Estas condiciones se revisan al modificar la interfaz:

- Todo control interactivo tiene un estado de foco visible.
- Los iconos decorativos llevan `aria-hidden="true"`.
- Los botones que solo contienen un icono llevan `aria-label`.
- Los mensajes de error usan `role="alert"`; las confirmaciones, `role="status"`.
- Las secciones se asocian a su título con `aria-labelledby`.
- Los campos con error llevan `aria-invalid`.
