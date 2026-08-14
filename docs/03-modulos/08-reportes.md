# Módulo: Reportes

## Ubicación

| | |
| --- | --- |
| Pantalla | `src/pages/domain/ReportsPage.tsx` |
| Sección | `reports` |
| Roles | Admin e Instructor |

## Qué ve cada rol

```tsx
const isAdmin = isAdminRole(user?.rol);
const canViewReports = isAdmin || isInstructor;
```

| Reporte | Admin | Instructor |
| --- | --- | --- |
| Cursos por instructor | Sí | No |
| Estudiantes por curso | Sí | Sí, solo sus cursos |
| Cursos más populares | Sí | No |

El instructor ve un único reporte, restringido a sus cursos. La restricción la aplica
el backend a partir del token, no el frontend con un filtro: así no hay forma de
obtener datos de otro instructor manipulando el cliente.

## Carga

Para el administrador, los tres reportes se piden en paralelo:

```tsx
const [byInstructor, byCourse, top] = await Promise.all([
  getCoursesByInstructorReportApi(),
  getStudentsByCourseReportApi(),
  getTopCoursesReportApi(),
]);
```

Para el instructor solo se pide el que le corresponde:

```tsx
const byCourse = await getStudentsByCourseReportApi();
```

Pedir en paralelo hace que el tiempo total sea el de la petición más lenta y no la
suma de las tres. La contrapartida es que si una falla, se muestra un único mensaje
de error para todo el bloque: son datos de un mismo panel y no tendría sentido
mostrar un resumen incompleto sin avisar.

## Estructura de los datos

Definidos en `src/types/report.ts`, reflejo de los DTO del backend.

### Cursos por instructor

```ts
interface CoursesByInstructorItem {
  instructorId: string;
  instructor: string;
  totalCursos: number;
}
```

Admite filtrar por instructor:

```ts
getCoursesByInstructorReportApi(instructorId?: string)
```

Cuando el parámetro es `undefined`, no se envía y el reporte cubre a todos.

### Estudiantes por curso

```ts
interface StudentsByCourseItem {
  cursoId: number;
  titulo: string;
  totalEstudiantes: number;
}
```

### Cursos más populares

```ts
interface TopCourseItem {
  cursoId: number;
  titulo: string;
  instructor: string;
  totalInscritos: number;
}
```

Acepta un límite, con 10 por defecto:

```ts
getTopCoursesReportApi(limit = 10)
```

## Presentación

Cada reporte es una tabla con `role` semántico y un título asociado mediante
`aria-labelledby`, lo que permite recorrer las secciones con un lector de pantalla.
Las tablas se envuelven en un contenedor con desplazamiento horizontal para que en
pantallas estrechas no desborden el resto de la maquetación.

Estados contemplados: cargando, error con opción de reintentar, y sin datos.

## Endpoints consumidos

| Acción | Endpoint |
| --- | --- |
| Cursos por instructor | `GET /api/reports/courses-by-instructor` |
| Estudiantes por curso | `GET /api/reports/students-by-course` |
| Cursos más populares | `GET /api/reports/top-courses` |

Los tres devuelven 403 para el rol Estudiante.

## Limitaciones conocidas

- **Los datos no incluyen progreso de lecciones**, porque el backend no lo persiste.
  Los reportes miden inscripciones, no avance real.
- **No hay exportación** a CSV ni a otro formato.
- **No hay filtro por fechas**: las cifras son acumuladas desde el inicio.
- Los totales se calculan en cada petición, sin caché. Con volúmenes grandes,
  conviene revisar el rendimiento en el backend.
