# Estructura del proyecto

El objetivo de esta organización es que cada tipo de código tenga un único lugar
evidente donde vivir. Antes de crear un archivo nuevo, busca la carpeta que le
corresponde en esta tabla.

## Raíz del repositorio

| Ruta | Contenido |
| --- | --- |
| `src/` | Todo el código de la aplicación |
| `docs/` | Esta documentación |
| `public/` | Archivos servidos tal cual, sin procesar por Vite |
| `tools/` | Utilidades de desarrollo, como el mock de la API de categorías |
| `.env` | Configuración local, no se versiona |
| `.env.example` | Plantilla de configuración que sí se versiona |
| `vite.config.ts` | Configuración de Vite y de Vitest |
| `.oxlintrc.json` | Reglas de lint |

## Dentro de `src/`

| Carpeta | Responsabilidad | Regla práctica |
| --- | --- | --- |
| `api/` | Un archivo por módulo de la API. Cada función envuelve exactamente una llamada HTTP y devuelve datos ya tipados | Ningún componente debe usar `axios` directamente |
| `context/` | Estado global de sesión | Solo `AuthContext`; el resto del estado es local a cada página |
| `hooks/` | Hooks reutilizables que combinan estado y llamadas a la API | Si un hook se usa en una sola página, déjalo en la página |
| `pages/` | Una pantalla completa por archivo, agrupada por área | `pages/admin/`, `pages/domain/`, `pages/dashboard/` |
| `components/` | Piezas reutilizables de UI | `components/auth/`, `components/admin/`, `components/domain/` |
| `routes/` | Definición del árbol de rutas | Solo `AppRouter.tsx` |
| `types/` | Interfaces del contrato con el backend, un archivo por módulo | Los nombres de campo replican el JSON del backend |
| `utils/` | Funciones puras sin estado ni JSX | Si necesita hooks, es un hook, no un util |
| `styles/` | Tokens de diseño y estilos globales | Los estilos de una pantalla van junto a ella |
| `assets/` | Imágenes y recursos importados desde el código | |

## Convención de nombres

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Componentes y páginas | `PascalCase.tsx` | `ManageCoursesPage.tsx` |
| Clientes de API | `camelCaseApi.ts` | `coursesApi.ts` |
| Funciones de API | `verboRecursoApi` | `getMyCoursesApi`, `deleteLessonApi` |
| Utilidades y tipos | `camelCase.ts` | `coursePermissions.ts`, `auth.ts` |
| CSS de una pantalla | Mismo nombre que la pantalla | `PerfilPage.css` |
| Pruebas | `*.test.tsx` junto al archivo probado | `CategoriesPage.test.tsx` |

## Flujo de datos

La dirección de las dependencias es siempre la misma, de arriba hacia abajo:

```
pages / components
        |
        v
   hooks (opcional)
        |
        v
       api/            <- unico punto que conoce rutas HTTP
        |
        v
    api/http.ts        <- instancia de Axios con interceptores
        |
        v
      backend
```

Consecuencias prácticas de respetar esa dirección:

- Cambiar una ruta del backend afecta a un solo archivo de `api/`.
- Las páginas se pueden probar sustituyendo el módulo de `api/` por un mock.
- Los tipos de `types/` son el contrato compartido entre ambos lados.

## Dónde poner cada cosa

| Necesito | Va en |
| --- | --- |
| Consumir un endpoint nuevo | `api/<modulo>Api.ts` y su interfaz en `types/<modulo>.ts` |
| Una pantalla nueva del panel | `pages/<area>/` y registrarla en `HomePage.tsx` |
| Una regla de permisos | `utils/coursePermissions.ts` o `utils/roleNavigation.ts` |
| Traducir un error HTTP a texto | `utils/apiErrors.ts` |
| Un color, espaciado o radio nuevo | `styles/tokens.css` |
| Una entrada nueva del menú lateral | `utils/roleNavigation.ts` |
