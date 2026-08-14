# Módulo: Cursos

## Pantallas

| Pantalla | Archivo | Sección | Roles |
| --- | --- | --- | --- |
| Explorar catálogo | `pages/domain/ExploreCoursesPage.tsx` | `explore` | Los tres |
| Gestionar cursos | `pages/domain/ManageCoursesPage.tsx` | `my-courses` | Admin e Instructor |

## Explorar catálogo

Lista los cursos disponibles. Tiene dos modos según quién la abre:

| Modo | Quién lo usa | Diferencia |
| --- | --- | --- |
| `enroll` | Estudiante | Muestra el botón Inscribirme en cada tarjeta |
| `browse` | Admin e Instructor | Solo consulta, sin acciones de inscripción |

Un mismo componente con un prop en lugar de dos pantallas: el listado, el filtrado
y las tarjetas son idénticos, y lo único que cambia es la acción disponible.

### Búsqueda

El término de búsqueda vive en `HomePage` y se pasa como prop junto con su
actualizador. Está así porque el buscador está en la cabecera, fuera de la pantalla
de contenido, y además permite un comportamiento útil: al escribir en la cabecera
desde el dashboard, la aplicación cambia automáticamente a la sección donde ese
texto tiene sentido.

| Rol | Sección a la que salta al buscar |
| --- | --- |
| Estudiante | `explore` |
| Instructor | `my-courses` |
| Admin | `my-courses` |

El filtrado se hace en el cliente con las utilidades de `utils/courseSearch.ts`. Es
viable con el volumen actual de cursos; si el catálogo crece, corresponde mover el
filtro al backend con parámetros de consulta.

### Inscripción

```tsx
await enrollApi({ cursoId: course.id });
```

Al cargar el catálogo en modo `enroll` también se pide `GET /enrollments/me`. Los
cursos ya inscritos **no muestran** el botón Inscribirme: solo queda Ver lecciones.
Tras un alta correcta (o un 409 de ya inscrito) se marca el curso como inscrito en
memoria para ocultar el botón de inmediato.

Los errores se guardan por curso, no en una variable global:

```tsx
const [enrollErrors, setEnrollErrors] = useState<Record<number, string>>({});
```

Así el mensaje aparece en la tarjeta que falló, y no como un aviso suelto que
obligaría a adivinar a qué curso se refiere.

Los mensajes los resuelve `resolveEnrollmentError`, que traduce el 409 a Ya estás
inscrito en este curso.

## Gestionar cursos

Es la pantalla más extensa del proyecto: administra cursos y, dentro del curso
seleccionado, sus lecciones.

### Las dos variantes

```tsx
variant: 'instructor' | 'admin'
```

| Aspecto | Variante instructor | Variante admin |
| --- | --- | --- |
| Cursos que lista | `GET /courses/me`, solo los propios | `GET /courses`, todos |
| Instructor del curso | Es siempre quien crea | Se elige de una lista de instructores |
| Publicar | Permitido en sus cursos | Bloqueado |

### Publicar está reservado al instructor asignado

Un administrador puede crear, editar y borrar cursos y lecciones, pero no publicar.
Publicar equivale a declarar el contenido terminado, y esa decisión pertenece a
quien lo produce.

La regla la impone el backend con un 403. El frontend la anticipa en lugar de dejar
que el usuario choque con el error:

```tsx
if (nextStatus === 'publicado' && isAdminVariant) {
  setLoadError('Solo el instructor asignado puede publicar el curso.');
  return;
}
```

El botón además se muestra deshabilitado con un `title` que explica el motivo. La
comprobación local no sustituye a la del servidor: existe para que la interfaz no
ofrezca algo que va a fallar.

### Estados de un curso

| Estado | Significado |
| --- | --- |
| `borrador` | En preparación, no visible en el catálogo |
| `publicado` | Disponible para inscripción |

El cambio se hace con `PATCH /courses/{id}/status`. Solo existen esos dos valores:
enviar cualquier otro devuelve 400.

### Reglas de negocio del servidor

| Regla | Respuesta si se incumple |
| --- | --- |
| Un curso necesita al menos una lección para publicarse | 400 con El curso debe tener al menos una lección antes de publicarse |
| Un curso publicado no se puede borrar | 409 |
| Un instructor solo modifica sus cursos | 403 |
| Solo el instructor asignado publica | 403 |

Para borrar un curso publicado hay que pasarlo antes a borrador. Es una salvaguarda
contra la eliminación accidental de contenido que ya tiene estudiantes.

### Creación de un curso

El formulario carga en paralelo las listas que necesita:

```tsx
const [categoriesData, levelsData] = await Promise.all([
  getCategoriesApi(),
  getLevelsApi(),
]);
```

En la variante admin se pide además la lista de usuarios para elegir instructor,
filtrando por ese rol.

Campos que espera el backend:

| Campo | Obligatorio | Notas |
| --- | --- | --- |
| `titulo` | Sí | Entre 5 y 200 caracteres |
| `idCategoria` | Sí | Debe existir |
| `idNivel` | Sí | Debe existir |
| `descripcionCorta` | No | Máximo 300 caracteres |
| `descripcionLarga` | No | Sin límite |
| `imagenPortadaUrl` | No | Máximo 255 caracteres; normalmente se rellena con `POST /courses/{id}/cover` |
| `duracionEstimadaMin` | No | Entre 1 y 100000 |

Tras crear el curso, el front sube la portada con multipart (mismo patrón que la foto
de perfil):

```tsx
await uploadCourseCoverApi(created.id, coverFile);
```

Al crear, la portada es obligatoria en la UI. Al editar es opcional: si no se elige
archivo nuevo, se conserva la portada actual (`PUT` no envía `imagenPortadaUrl` y el
backend no la borra).

Los nombres son los del backend (`idCategoria`, no `categoriaId`). Enviar otra
variante produce un 400 por campo requerido ausente.

### Estados de operación en curso

La pantalla mantiene el identificador del elemento sobre el que se está operando,
no un booleano:

```tsx
const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
```

Eso permite deshabilitar y mostrar el indicador solo en la fila afectada. Con un
booleano global se bloquearía toda la tabla durante una operación sobre un único
curso.

### Recarga tras modificar

Después de cada operación con éxito, la lista se vuelve a pedir al servidor en lugar
de ajustarse en memoria. Es una llamada más, pero garantiza que lo que se ve
coincide con el estado real, incluidos los campos derivados que el backend calcula.

## Endpoints consumidos

| Acción | Endpoint |
| --- | --- |
| Listar todos | `GET /api/courses` |
| Listar propios | `GET /api/courses/me` |
| Ver detalle | `GET /api/courses/{id}` |
| Crear | `POST /api/courses` |
| Editar | `PUT /api/courses/{id}` |
| Cambiar estado | `PATCH /api/courses/{id}/status` |
| Borrar | `DELETE /api/courses/{id}` |
| Subir portada | `POST /api/courses/{id}/cover` |

Todos requieren sesión, incluido el listado del catálogo.

## Tipos

En `src/types/course.ts`: `Course`, `CourseListItem`, `CourseCreateRequest`,
`CourseUpdateRequest` y `CourseStatusRequest`.
