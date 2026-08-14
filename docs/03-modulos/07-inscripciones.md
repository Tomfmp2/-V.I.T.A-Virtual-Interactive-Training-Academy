# Módulo: Inscripciones

## Pantallas

| Pantalla | Archivo | Sección | Rol |
| --- | --- | --- | --- |
| Explorar catálogo | `pages/domain/ExploreCoursesPage.tsx` en modo `enroll` | `explore` | Estudiante |
| Mis inscripciones | `pages/domain/MyEnrollmentsPage.tsx` | `my-courses` | Estudiante |

## Inscribirse

Desde una tarjeta del catálogo:

```tsx
await enrollApi({ cursoId: course.id });
```

Solo los cursos publicados admiten inscripción. Un curso en borrador devuelve 400.

### Errores por tarjeta

Los mensajes se almacenan indexados por curso:

```tsx
const [enrollErrors, setEnrollErrors] = useState<Record<number, string>>({});
```

Así el error aparece en la tarjeta que lo produjo. Con una sola variable de error,
un aviso suelto en la parte superior obligaría al usuario a deducir a qué curso se
refiere, sobre todo si intentó inscribirse en dos.

Los textos los resuelve `resolveEnrollmentError`:

| Código | Mensaje |
| --- | --- |
| 400 | El mensaje del servidor, o El curso no está disponible para inscripción |
| 403 | No tienes permisos para inscribirte |
| 404 | Curso no encontrado |
| 409 | Ya estás inscrito en este curso |

El 409 se trata como “ya inscrito”: se oculta Inscribirme y no se deja el error
rojo en la tarjeta. Además, al montar la pantalla se carga `GET /enrollments/me`
para no ofrecer Inscribirme en cursos donde el estudiante ya está.

### Indicador de la operación

```tsx
const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
```

El botón del curso en curso pasa a Inscribiendo y se deshabilita, lo que además
evita el doble envío por doble clic.

## Mis inscripciones

Lista los cursos del estudiante:

```tsx
const data = await getMyEnrollmentsApi();
```

El endpoint deduce el usuario del token, así que no recibe parámetros y no hay forma
de consultar las inscripciones de otra persona desde el cliente.

Desde cada elemento se abre el reproductor del curso:

```tsx
const [openCourse, setOpenCourse] = useState<{ id: number; title: string } | null>(null);
```

El buscador de la cabecera filtra esta lista, con el término gestionado en `HomePage`
y recibido por prop.

## Progreso

El avance por lección se guarda en `localStorage` mediante
`src/utils/lessonProgress.ts`. **El backend no lo persiste**, de modo que no se
sincroniza entre dispositivos y se pierde al limpiar los datos del navegador. El
detalle está en [`04-lecciones.md`](04-lecciones.md).

Consecuencia para los reportes: los datos de progreso no aparecen en ellos, porque el
servidor no los conoce.

## Endpoints consumidos

| Acción | Endpoint |
| --- | --- |
| Inscribirse | `POST /api/enrollments` |
| Listar propias | `GET /api/enrollments/me` |

## Limitación conocida

**No existe forma de cancelar una inscripción.** El endpoint
`DELETE /api/enrollments/{id}` figura como no implementado en la documentación del
backend, así que tampoco hay acción en la interfaz. Una inscripción es, por ahora,
definitiva.

## Tipos

En `src/types/enrollment.ts`: `Enrollment` y `EnrollmentRequest`.
