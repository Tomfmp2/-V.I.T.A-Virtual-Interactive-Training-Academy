# Módulo: Usuarios

## Ubicación

| | |
| --- | --- |
| Pantalla | `src/pages/domain/UsersPage.tsx` |
| Sección | `users` |
| Rol | Admin |

## Qué permite hacer

1. Listar todas las cuentas de la plataforma.
2. Crear una cuenta indicando su rol.
3. Editar los datos personales de una cuenta.
4. Cambiar el rol desde la propia tabla.
5. Activar o desactivar una cuenta desde la propia tabla.

La división es intencionada: **rol y estado se cambian en la tabla; los datos
personales, en el formulario de edición**. Son operaciones de naturaleza distinta,
cada una con su endpoint, y las dos de la tabla son de un solo clic porque son las
frecuentes.

## Carga inicial

Usuarios y roles se piden en paralelo:

```tsx
const [usersData, rolesData] = await Promise.all([getUsersApi(), getRolesApi()]);
```

Los roles se leen de `GET /api/roles` en vez de escribirse en el código para que el
selector refleje los roles que realmente existen en el backend.

## Comprobación de permisos

```tsx
const canManageUsers = isAdminRole(user?.rol);
```

Si es falso, la pantalla muestra un aviso de permisos y no lanza ninguna petición.
Aun así, cada endpoint valida el rol en el servidor: esta comprobación evita el
viaje inútil, no protege el recurso.

## Crear una cuenta

| Campo | Obligatorio |
| --- | --- |
| `nombre` | Sí |
| `apellido` | Sí |
| `email` | Sí |
| `password` | Sí |
| `rol` | Sí |

A diferencia del registro público, que crea siempre un Estudiante, aquí el rol se
elige. Es la única vía para dar de alta a un Instructor o a otro Admin.

## Cambiar el rol

```tsx
const handleRoleChange = async (target: AdminUser, rol: string) => {
  if (rol === target.rol) return;
  await updateUserRoleApi(target.id, { rol });
  // ...
};
```

La comparación inicial evita una petición cuando el selector emite un cambio con el
mismo valor.

Cambiar el rol tiene efectos que conviene tener presentes:

- Un Instructor degradado a Estudiante pierde el acceso a sus cursos.
- Los cursos siguen asignados a esa cuenta, así que **nadie podrá publicarlos** hasta
  que se le devuelva el rol o se reasigne el curso.
- La sesión abierta de esa persona conserva el rol antiguo hasta que su token
  caduque, porque el rol viaja dentro del JWT.

Ese último punto es el más fácil de pasar por alto al depurar: un cambio de rol no
surte efecto inmediato en una sesión ya iniciada.

## Activar y desactivar

```tsx
await updateUserStatusApi(target.id, { activo: !target.activo });
```

Las cuentas no se borran, se desactivan. Así se conserva la integridad de los datos
asociados: cursos creados, inscripciones e histórico siguen teniendo un usuario
válido al que referirse.

Una cuenta desactivada no puede iniciar sesión: el login responde 403. Si tenía una
sesión abierta, las operaciones de perfil se rechazan por inactividad, aunque el
token siga siendo criptográficamente válido.

## Indicadores por fila

```tsx
const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
```

Se guarda el identificador en curso, no un booleano, para deshabilitar solo la fila
afectada y no toda la tabla.

## Errores

Se resuelven con `getApiErrorMessage` y un texto de reserva por operación:

| Operación | Texto de reserva |
| --- | --- |
| Cambiar estado | No se pudo actualizar el estado del usuario |
| Cambiar rol | No se pudo actualizar el rol del usuario |
| Crear o editar | El mensaje del servidor, o uno genérico |

## Endpoints consumidos

| Acción | Endpoint |
| --- | --- |
| Listar | `GET /api/users` |
| Ver detalle | `GET /api/users/{id}` |
| Crear | `POST /api/users` |
| Editar | `PUT /api/users/{id}` |
| Cambiar estado | `PATCH /api/users/{id}/status` |
| Cambiar rol | `PATCH /api/users/{id}/role` |
| Listar roles | `GET /api/roles` |

Todos exigen rol Admin y responden 403 en cualquier otro caso.

## Tipos

En `src/types/user.ts`: `AdminUser`, `CreateUserRequest`, `UpdateUserRequest`,
`UpdateUserStatusRequest` y `UpdateUserRoleRequest`. El rol está en
`src/types/role.ts`.
