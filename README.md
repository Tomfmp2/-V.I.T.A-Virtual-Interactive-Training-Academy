# VITA — Frontend

Interfaz web de **V.I.T.A** (Virtual Interactive Training Academy), plataforma de cursos online.

Consume la API REST del repositorio backend `VITA`.

Proyecto 3 · CAMPUSLANDS

## Stack

| Capa | Tecnología |
| --- | --- |
| UI | Vue o React (a definir por el equipo) |
| Enrutado | Vue Router / React Router |
| Estado auth | Store / Context (token JWT + usuario) |
| HTTP | Cliente con header `Authorization: Bearer` |
| Estilos | A definir |

## Roles en la interfaz

| Rol | Acceso principal |
| --- | --- |
| `Admin` | Usuarios, categorías, todos los cursos, reportes |
| `Instructor` | Mis cursos, lecciones, publicar / borrador |
| `Estudiante` | Catálogo publicado, inscripciones, mis cursos |

## Pantallas previstas

1. Login / Register / Logout
2. Layout y navegación según rol
3. Admin — usuarios
4. Admin — categorías
5. Instructor — cursos y estado
6. Instructor — lecciones
7. Estudiante — catálogo e inscripción
8. Estudiante — mis cursos
9. Reportes (Admin / Instructor)

## Integración con la API

Prefijo base (desarrollo):

```
http://localhost:<puerto-api>/api
```

Autenticación:

```
Authorization: Bearer <token>
```

Endpoints clave:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- Recursos de cursos, lecciones, inscripciones, categorías, usuarios y reportes según contrato del backend

## Variables de entorno

Ejemplo (ajustar al framework elegido):

```
VITE_API_URL=http://localhost:<puerto-api>/api
```

o

```
REACT_APP_API_URL=http://localhost:<puerto-api>/api
```

No commitear secretos ni tokens.

## Cómo ejecutar

Pendiente de scaffold del proyecto.

```bash
npm install
npm run dev
```

## Reglas de UI

- Guards de ruta por rol: sin token → login; rol incorrecto → sin acceso
- La seguridad real está en el backend; el frontend solo oculta/redirige
- Mostrar estados de loading, error y vacío en los flujos principales
- Ante `401`, limpiar sesión y volver a login
- Ante `409` en inscripción, mostrar mensaje de ya inscrito

## Equipo

| Rol | Responsabilidad |
| --- | --- |
| Frontend | Pantallas, consumo API, guards por rol |
| Líder | Integración, revisión de PRs |
| Backend | Contrato de endpoints (Swagger) |

## Convenciones

- Conventional Commits: `feat(ui): ...`, `fix(auth): ...`
- Ramas: `feature/<ID>-descripcion`
- Merge a `main` solo por PR
- Una tarjeta Trello ≈ una PR verificable

## Documentación de referencia

- Contrato de endpoints del backend (`VITA`)
- Swagger en desarrollo
- Requerimientos Proyecto 3
- Diseño base de pantallas (Paso 1)
