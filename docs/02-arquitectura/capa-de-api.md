# Capa de API

## Instancia única de Axios

Todo el tráfico HTTP pasa por `src/api/http.ts`. No existe ninguna otra instancia
de Axios ni llamadas directas desde componentes.

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5044/api',
  headers: { 'Content-Type': 'application/json' },
});
```

Con `baseURL` centralizada, los clientes escriben rutas relativas (`/auth/me`) y
apuntar a otro entorno es cambiar una variable, no editar archivos.

## Interceptores

### Petición: adjuntar el token

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.authorization = `Bearer ${token}`;
  return config;
});
```

Ninguna función de `api/` recibe el token como parámetro. Se lee de `localStorage`
porque el interceptor no es un componente y no tiene acceso al contexto de React.

### Respuesta: detectar sesión inválida

```ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
```

El handler lo registra `AuthProvider` mediante `setUnauthorizedHandler`. El módulo
HTTP **no importa el contexto**: eso crearía una dependencia circular. En su lugar
expone la función de registro y el proveedor se suscribe.

Nótese el `return Promise.reject(error)`: el error se propaga siempre. El
interceptor cierra la sesión, pero la pantalla que hizo la llamada sigue pudiendo
reaccionar al fallo.

## Convenciones de los clientes

Un archivo por módulo de la API, y en cada función:

1. Una sola llamada HTTP.
2. Tipos explícitos de entrada y de salida.
3. Devuelve `response.data`, nunca la respuesta completa de Axios.
4. No captura errores: los propaga para que la pantalla decida el mensaje.

```ts
export const getMyCoursesApi = async (): Promise<CourseListItem[]> => {
  const response = await api.get<CourseListItem[]>('/courses/me');
  return response.data;
};
```

La cuarta regla es la que sostiene el manejo de errores: el mismo 409 significa
cosas distintas según la pantalla, así que la traducción a texto pertenece a la UI.

## Catálogo completo

### `authApi.ts`

| Función | Método y ruta |
| --- | --- |
| `loginApi` | `POST /auth/login` |
| `registerApi` | `POST /auth/register` |
| `getMeApi` | `GET /auth/me` |
| `updateProfileApi` | `PUT /auth/me` |
| `uploadProfilePhotoApi` | `POST /auth/me/photo` |
| `changePasswordApi` | `POST /auth/change-password` |
| `logoutApi` | `POST /auth/logout` |

### `coursesApi.ts`

| Función | Método y ruta |
| --- | --- |
| `getCoursesApi` | `GET /courses` |
| `getMyCoursesApi` | `GET /courses/me` |
| `getCourseByIdApi` | `GET /courses/{id}` |
| `createCourseApi` | `POST /courses` |
| `updateCourseApi` | `PUT /courses/{id}` |
| `changeCourseStatusApi` | `PATCH /courses/{id}/status` |
| `deleteCourseApi` | `DELETE /courses/{id}` |

### `lessonsApi.ts`

| Función | Método y ruta |
| --- | --- |
| `getLessonsApi` | `GET /courses/{courseId}/lessons` |
| `getLessonByIdApi` | `GET /courses/{courseId}/lessons/{id}` |
| `createLessonApi` | `POST /courses/{courseId}/lessons` |
| `updateLessonApi` | `PUT /courses/{courseId}/lessons/{id}` |
| `deleteLessonApi` | `DELETE /courses/{courseId}/lessons/{id}` |

### `categoriesApi.ts`

| Función | Método y ruta |
| --- | --- |
| `getCategoriesApi` | `GET /categories` |
| `createCategoryApi` | `POST /categories` |
| `updateCategoryApi` | `PUT /categories/{id}` |
| `deleteCategoryApi` | `DELETE /categories/{id}` |

### `levelsApi.ts`

| Función | Método y ruta |
| --- | --- |
| `getLevelsApi` | `GET /levels` |
| `createLevelApi` | `POST /levels` |
| `updateLevelApi` | `PUT /levels/{id}` |
| `deleteLevelApi` | `DELETE /levels/{id}` |

### `usersApi.ts`

| Función | Método y ruta |
| --- | --- |
| `getUsersApi` | `GET /users` |
| `getUserByIdApi` | `GET /users/{id}` |
| `createUserApi` | `POST /users` |
| `updateUserApi` | `PUT /users/{id}` |
| `updateUserStatusApi` | `PATCH /users/{id}/status` |
| `updateUserRoleApi` | `PATCH /users/{id}/role` |

### `enrollmentsApi.ts`

| Función | Método y ruta |
| --- | --- |
| `enrollApi` | `POST /enrollments` |
| `getMyEnrollmentsApi` | `GET /enrollments/me` |

### `reportsApi.ts`

| Función | Método y ruta |
| --- | --- |
| `getCoursesByInstructorReportApi` | `GET /reports/courses-by-instructor` |
| `getStudentsByCourseReportApi` | `GET /reports/students-by-course` |
| `getTopCoursesReportApi` | `GET /reports/top-courses` |

### `rolesApi.ts`

| Función | Método y ruta |
| --- | --- |
| `getRolesApi` | `GET /roles` |

## Caso especial: subir la foto de perfil

Es la única llamada que no envía JSON. Hay que construir un `FormData` y sustituir
la cabecera por defecto:

```ts
export const uploadProfilePhotoApi = async (file: File): Promise<{ fotoUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ fotoUrl: string }>('/auth/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};
```

El nombre del campo tiene que ser exactamente `file`: así se llama el parámetro
`IFormFile` del controlador.

## Caso especial: claves con eñe

El endpoint de cambio de contraseña espera nombres de propiedad con tilde y eñe,
tal como los declara el backend. El tipo lo refleja con claves entre comillas:

```ts
export interface ChangePasswordRequest {
  'contraseñaActual': string;
  'nuevaContraseña': string;
  'confirmarContraseña': string;
}
```

Puede parecer un descuido, pero es el contrato real: si se envían en ASCII, el
backend responde 400 porque no encuentra los campos requeridos.

## Añadir un módulo nuevo

1. Definir las interfaces en `src/types/<modulo>.ts`, con los nombres de campo del
   backend.
2. Crear `src/api/<modulo>Api.ts` con una función por endpoint.
3. Si hay reglas de error propias, añadir un `resolve<Accion>Error` en
   `utils/apiErrors.ts`.
4. Consumirlo desde la pantalla y documentarlo en `03-modulos/`.
