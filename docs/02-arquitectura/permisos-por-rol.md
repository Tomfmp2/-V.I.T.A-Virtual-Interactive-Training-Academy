# Permisos por rol

## Los tres roles

| Rol en el backend | Rol normalizado | Área |
| --- | --- | --- |
| `Admin` | `admin` | `/admin` |
| `Instructor` | `instructor` | `/instructor` |
| `Estudiante` | `estudiante` | `/estudiante` |

## Normalización

`normalizePlatformRole` en `src/utils/coursePermissions.ts` convierte el rol que
llega del backend a un valor interno:

```ts
export const normalizePlatformRole = (role?: string | null): PlatformRole | null => {
  const normalized = role?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'administrador') return 'admin';
  if (normalized === 'instructor') return 'instructor';
  if (normalized === 'estudiante') return 'estudiante';
  return null;
};
```

Quita acentos, espacios y diferencias de mayúsculas, de modo que `Estudiante`,
`estudiante` y `ESTUDIANTE` se resuelven igual, y acepta `Administrador` como
sinónimo de `Admin`.

Lo importante es el retorno: **cualquier valor desconocido devuelve `null`**, y
todos los consumidores tratan `null` como sin permisos. La comparación por igualdad
exacta se hace una sola vez, aquí, en lugar de repartirse por las pantallas.

## Permisos de curso

`getCoursePermissions(rol)` devuelve un objeto con todos los permisos resueltos:

| Permiso | Admin | Instructor | Estudiante | Sin rol |
| --- | --- | --- | --- | --- |
| `viewCourse` | Sí | Sí | Sí | No |
| `enterCourse` | Sí | Sí | Sí | No |
| `createCourse` | Sí | Sí | No | No |
| `editCourse` | Sí | Sí | No | No |
| `deleteCourse` | Sí | Sí | No | No |
| `viewLesson` | Sí | Sí | Sí | No |
| `enterLesson` | Sí | Sí | Sí | No |
| `createLesson` | Sí | Sí | No | No |
| `editLesson` | Sí | Sí | No | No |
| `deleteLesson` | Sí | Sí | No | No |
| `manageCategory` | Sí | Sí | No | No |

Uso:

```ts
import { canAccessCourse } from '../utils/coursePermissions';

if (canAccessCourse(user?.rol, 'createLesson')) {
  // mostrar el boton de nueva leccion
}
```

Se devuelve el conjunto completo en lugar de calcular permiso por permiso para que
el resultado sea consistente: no hay forma de que una pantalla obtenga una mezcla
de permisos de dos roles distintos.

Hay tres conjuntos predefinidos: `fullPermissions` para admin e instructor,
`readOnlyPermissions` para estudiante y `noPermissions` para roles desconocidos.

## Reglas que la tabla no captura

Dos reglas dependen de datos, no solo del rol, y las impone el backend:

### Propiedad del curso

Un instructor solo puede modificar **sus** cursos. La tabla de arriba concede
`editCourse` a cualquier instructor porque el frontend no sabe de antemano quién es
el dueño; la comprobación real la hace el servidor y responde 403 si no coincide.

### Publicar es exclusivo del instructor asignado

Un administrador puede crear, editar y borrar cursos y lecciones, pero **no puede
publicar un curso**. Publicar significa dar por terminado el contenido, y esa
decisión pertenece a quien lo produce.

El backend responde:

```json
{ "error": "Solo el instructor asignado puede publicar el curso.", "statusCode": 403 }
```

El frontend acompaña la regla en lugar de dejar que el usuario choque con ella: en
`ManageCoursesPage`, con la variante admin, el botón de publicar aparece
deshabilitado y con un `title` que explica el motivo.

Además hay otras dos condiciones de negocio que no dependen del rol:

- Un curso necesita al menos una lección para poder publicarse.
- Un curso publicado no se puede borrar: primero hay que pasarlo a borrador.

## Menú lateral

`getRoleNavItems(rol)` en `src/utils/roleNavigation.ts` decide las entradas visibles:

| Entrada | Admin | Instructor | Estudiante |
| --- | --- | --- | --- |
| Dashboard | Sí | Sí | Sí |
| Cursos | Sí, como Cursos | Sí, como Mis cursos | Sí, como Mis inscripciones |
| Explorar | Sí | Sí | Sí, como Explorar catálogo |
| Usuarios | Sí | No | No |
| Categorías | Sí | No | No |
| Reportes | Sí | Sí | No |
| Configuración | Sí | Sí | Sí |

Las etiquetas cambian según el rol porque el mismo concepto significa cosas
distintas: para un instructor son los cursos que dicta, para un estudiante los que
cursa.

## Las tres capas de control

| Capa | Archivo | Qué impide |
| --- | --- | --- |
| Router | `RoleGuard` | Entrar a un área ajena por URL |
| Interfaz | `roleNavigation`, `coursePermissions` | Ofrecer acciones que fallarían |
| Servidor | Backend | Todo lo demás |

Solo la tercera capa es seguridad. Las dos primeras existen para que la aplicación
sea coherente y no muestre botones que van a devolver 403. Un usuario que
manipule el estado del navegador puede saltarse las dos primeras; **no puede
saltarse la tercera**, y por eso cada endpoint valida rol y propiedad.

## Añadir un permiso

1. Añadir el nombre al tipo `CoursePermission`.
2. Darle valor en `readOnlyPermissions`, `fullPermissions` y `noPermissions`. Si se
   omite alguno, TypeScript falla, que es exactamente lo que se quiere: obliga a
   decidir de forma explícita para cada rol.
3. Consumirlo con `canAccessCourse`.
4. Confirmar que el endpoint correspondiente aplica la misma regla.
