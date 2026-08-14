# Módulo: Lecciones

## Componentes

| Componente | Archivo | Para qué |
| --- | --- | --- |
| `LessonListPanel` | `components/domain/LessonListPanel.tsx` | Lista de lecciones del curso seleccionado, con acciones de gestión |
| `LessonForm` | `components/domain/LessonForm.tsx` | Formulario de alta y edición |
| `CoursePlayerView` | `components/domain/CoursePlayerView.tsx` | Vista de consumo del curso |

Los dos primeros se montan dentro de `ManageCoursesPage`; el tercero se abre desde
el catálogo y desde las inscripciones.

## Rutas anidadas

Las lecciones siempre viven bajo un curso:

```
/api/courses/{courseId}/lessons
/api/courses/{courseId}/lessons/{id}
```

Por eso todas las funciones de `lessonsApi.ts` reciben `courseId` como primer
parámetro. No existe forma de pedir una lección sin conocer su curso, lo que impide
por construcción manipular una lección con un curso equivocado.

## Quién puede gestionarlas

| Rol | Ver | Crear, editar y borrar |
| --- | --- | --- |
| Admin | Sí | Sí, en cualquier curso |
| Instructor | Sí | Solo en sus cursos |
| Estudiante | Sí | No |

Que un administrador pueda gestionar lecciones es deliberado y conviene contrastarlo
con la regla de publicación: el administrador **sí** administra el contenido, pero
**no** publica el curso. Corregir una lección es mantenimiento; publicar es dar el
contenido por terminado.

En el backend la comprobación es explícita:

```csharp
private async Task<bool> CanManageLessonsAsync(string userId, string role, int courseId) =>
    role == "Admin" || await _ownership.IsCourseOwnerAsync(userId, courseId);
```

## Campos de una lección

| Campo | Obligatorio | Notas |
| --- | --- | --- |
| `titulo` | Sí | |
| `descripcion` | No | |
| `orden` | Sí | Posición dentro del curso |
| `duracionMinutos` | No | |
| `videoUrl` | No | Enlace al material |

El campo `orden` determina la secuencia mostrada. Al crear desde el formulario se
sugiere el siguiente número libre, aunque el backend acepta cualquier entero, así
que pueden quedar huecos o repetidos si se editan a mano.

## Reproductor del curso

`CoursePlayerView` se abre en modo superpuesto desde el catálogo o desde las
inscripciones, con el identificador y el título del curso:

```tsx
const [openCourse, setOpenCourse] = useState<{ id: number; title: string } | null>(null);
```

Se pasa el título junto al identificador para poder mostrar la cabecera de inmediato,
sin esperar a que responda la petición del detalle.

## Progreso de lecciones

El progreso se guarda **solo en el navegador**, en `localStorage`, mediante
`src/utils/lessonProgress.ts`:

```ts
const storageKey = (userId: string, courseId: number) =>
  `vita.lesson-progress.${userId}.${courseId}`;
```

| Función | Qué hace |
| --- | --- |
| `getCompletedLessonIds(userId, courseId)` | Devuelve los identificadores completados |
| `markLessonCompleted(userId, courseId, lessonId)` | Marca una lección y devuelve la lista actualizada |
| `isLessonCompleted(userId, courseId, lessonId)` | Consulta una lección concreta |

La clave incluye el identificador de usuario para que dos cuentas en el mismo
navegador no compartan progreso.

La lectura es defensiva a propósito: si el valor almacenado no es un arreglo o el
JSON está corrupto, devuelve una lista vacía en lugar de propagar la excepción.
`localStorage` es editable por el usuario y no se puede asumir bien formado.

### Limitación conocida

**El backend no persiste el progreso.** Consecuencias:

- El progreso no se sincroniza entre dispositivos ni navegadores.
- Se pierde al limpiar los datos del sitio.
- No aparece en los reportes.

Está reconocido como fuera de alcance en la documentación del backend, apartado
No implementado. Resolverlo requiere endpoints nuevos, del estilo
`POST /api/enrollments/{id}/lessons/{lessonId}/complete`, y migrar estas tres
funciones para llamarlos. La firma de las utilidades ya encaja con ese cambio: solo
pasarían a ser asíncronas.

## Endpoints consumidos

| Acción | Endpoint |
| --- | --- |
| Listar | `GET /api/courses/{courseId}/lessons` |
| Ver detalle | `GET /api/courses/{courseId}/lessons/{id}` |
| Crear | `POST /api/courses/{courseId}/lessons` |
| Editar | `PUT /api/courses/{courseId}/lessons/{id}` |
| Borrar | `DELETE /api/courses/{courseId}/lessons/{id}` |

## Interacción con la publicación del curso

Un curso sin lecciones no se puede publicar: el backend responde 400 con El curso
debe tener al menos una lección antes de publicarse.

Por eso el formulario de creación de curso de `ManageCoursesPage` permite crear la
primera lección junto con el curso, y así el resultado queda en un estado publicable
sin un segundo paso obligatorio.

## Tipos

En `src/types/lesson.ts`: `Lesson` y `LessonRequest`.
