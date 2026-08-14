# Documentación — VITA Frontend

Esta carpeta documenta el cliente web de VITA (Virtual Interactive Training Academy):
cómo instalarlo, cómo está organizado, cómo consume la API y cómo se verifica.

La documentación de la API vive en el repositorio del backend, en su carpeta `docs/`.
Este repositorio documenta únicamente el lado del cliente.

---

## Empieza aquí según tu objetivo

### Quiero levantar el proyecto por primera vez

1. [`01-setup-local/instalacion-y-ejecucion.md`](01-setup-local/instalacion-y-ejecucion.md)
2. [`01-setup-local/variables-de-entorno.md`](01-setup-local/variables-de-entorno.md)
3. [`04-calidad/lint-y-build.md`](04-calidad/lint-y-build.md)

### Quiero entender cómo está construido

1. [`00-convenciones/estructura-del-proyecto.md`](00-convenciones/estructura-del-proyecto.md)
2. [`02-arquitectura/enrutado-y-guards.md`](02-arquitectura/enrutado-y-guards.md)
3. [`02-arquitectura/autenticacion-y-sesion.md`](02-arquitectura/autenticacion-y-sesion.md)
4. [`02-arquitectura/capa-de-api.md`](02-arquitectura/capa-de-api.md)

### Quiero modificar o extender una pantalla

1. [`02-arquitectura/permisos-por-rol.md`](02-arquitectura/permisos-por-rol.md)
2. El módulo correspondiente en [`03-modulos/`](03-modulos/)
3. [`00-convenciones/manejo-de-errores.md`](00-convenciones/manejo-de-errores.md)
4. [`04-calidad/pruebas.md`](04-calidad/pruebas.md)

---

## Tabla de contenidos

### 00 — Convenciones

| Archivo | Descripción |
| --- | --- |
| [`estructura-del-proyecto.md`](00-convenciones/estructura-del-proyecto.md) | Qué contiene cada carpeta de `src/` y dónde va cada tipo de código |
| [`manejo-de-errores.md`](00-convenciones/manejo-de-errores.md) | Cómo se traduce el contrato de errores del backend a mensajes de UI |
| [`estilos-y-tokens.md`](00-convenciones/estilos-y-tokens.md) | Sistema de estilos, tokens de diseño y convenciones de CSS |

### 01 — Setup local

| Archivo | Descripción |
| --- | --- |
| [`instalacion-y-ejecucion.md`](01-setup-local/instalacion-y-ejecucion.md) | Requisitos, instalación, scripts de npm y arranque junto al backend |
| [`variables-de-entorno.md`](01-setup-local/variables-de-entorno.md) | Variables `VITE_*`, valores por defecto y cómo se consumen |

### 02 — Arquitectura

| Archivo | Descripción |
| --- | --- |
| [`enrutado-y-guards.md`](02-arquitectura/enrutado-y-guards.md) | Rutas públicas y privadas, `RoleGuard` y navegación por área |
| [`autenticacion-y-sesion.md`](02-arquitectura/autenticacion-y-sesion.md) | `AuthProvider`, persistencia de sesión, expiración y cierre de sesión |
| [`capa-de-api.md`](02-arquitectura/capa-de-api.md) | Instancia de Axios, interceptores y catálogo de clientes por módulo |
| [`permisos-por-rol.md`](02-arquitectura/permisos-por-rol.md) | Normalización de roles, permisos de curso y menú por rol |

### 03 — Módulos funcionales

| Archivo | Módulo | Roles |
| --- | --- | --- |
| [`01-autenticacion.md`](03-modulos/01-autenticacion.md) | Login y registro | Público |
| [`02-perfil.md`](03-modulos/02-perfil.md) | Configuración de perfil, foto y contraseña | Todos |
| [`03-cursos.md`](03-modulos/03-cursos.md) | Catálogo, gestión y publicación de cursos | Todos |
| [`04-lecciones.md`](03-modulos/04-lecciones.md) | Lecciones y reproductor del curso | Todos |
| [`05-categorias.md`](03-modulos/05-categorias.md) | Categorías | Admin |
| [`06-usuarios.md`](03-modulos/06-usuarios.md) | Usuarios, roles y estado | Admin |
| [`07-inscripciones.md`](03-modulos/07-inscripciones.md) | Inscripción y mis cursos | Estudiante |
| [`08-reportes.md`](03-modulos/08-reportes.md) | Reportes agregados | Admin e Instructor |

### 04 — Calidad

| Archivo | Descripción |
| --- | --- |
| [`pruebas.md`](04-calidad/pruebas.md) | Estrategia de pruebas, Vitest, Testing Library y cómo escribir un test |
| [`lint-y-build.md`](04-calidad/lint-y-build.md) | Lint con oxlint, verificación de tipos y build de producción |

---

## Ficha técnica

| | |
| --- | --- |
| Framework | React 19 con TypeScript |
| Bundler | Vite 8 |
| Enrutado | React Router 7 |
| Cliente HTTP | Axios |
| Estilos | CSS con tokens propios y Tailwind CSS 4 |
| Lint | oxlint |
| Pruebas | Vitest con Testing Library y jsdom |
| URL local | `http://localhost:5174` (puerto fijo: `strictPort` falla si está ocupado) |
| API local | `http://localhost:5044/api` |
