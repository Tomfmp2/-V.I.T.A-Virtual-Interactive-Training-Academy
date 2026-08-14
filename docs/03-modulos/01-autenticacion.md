# Módulo: Autenticación

## Pantallas

| Ruta | Componente | Archivos |
| --- | --- | --- |
| `/login` | `LoginPage` | `pages/LoginPage.tsx`, `components/LoginForm.tsx` |
| `/register` | `RegisterPage` | `pages/RegisterPage.tsx` |
| `/403` | `ForbiddenPage` | `pages/ForbiddenPage.tsx` |

Ambos formularios comparten el marco visual mediante `components/auth/AuthLayout.tsx`
y `components/LoginBrandPanel.tsx`.

## Inicio de sesión

### Validación en el cliente

| Campo | Reglas |
| --- | --- |
| Correo | Obligatorio y con formato válido |
| Contraseña | Obligatoria |

La validación no se dispara al escribir sino cuando el campo se marca como visitado
(`touched`), para no señalar como erróneo un correo que el usuario todavía está
tecleando.

La contraseña no se valida por longitud en el login. Solo importa si el servidor la
acepta, y añadir reglas locales aquí daría pistas sobre las credenciales guardadas.

### Flujo

```tsx
const loginResponse = await loginApi({ email, password });
login(loginResponse.token, loginResponse.usuario);
navigate(getRoleHomePath(usuario.rol) ?? '/403');
```

Al terminar se redirige al área del rol. Si el rol no se reconoce, se va a `/403`
en lugar de dejar al usuario en una pantalla vacía.

### Petición y respuesta

```
POST /api/auth/login
{ "email": "admin@vita.local", "password": "..." }
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiraEn": 604800,
  "usuario": { "id": "...", "nombre": "Admin", "email": "...", "rol": "Admin" }
}
```

### Errores

| Código | Mensaje mostrado |
| --- | --- |
| 400 | El mensaje de validación que envía el servidor |
| 401 | Credenciales incorrectas |
| 403 | La cuenta está desactivada |
| Sin respuesta | No se pudo conectar con el servidor |

Los errores del formulario se muestran en un bloque con `role="alert"`, y los de
cada campo con `aria-describedby` apuntando al mensaje.

## Registro

### Validación en el cliente

| Campo | Reglas |
| --- | --- |
| Nombre | Obligatorio |
| Apellido | Obligatorio |
| Correo | Obligatorio y con formato válido |
| Contraseña | Obligatoria, mínimo 8 caracteres |
| Confirmación | Obligatoria y debe coincidir |

El mínimo de 8 caracteres replica la regla de Identity en el backend. La duplicación
es intencionada: evita un viaje al servidor para un error que se detecta al instante.
Si esa regla cambia en el backend, hay que cambiarla aquí también.

### Flujo

El registro inicia sesión automáticamente para no obligar a escribir las
credenciales dos veces:

```tsx
await registerApi({ nombre: name, apellido: lastName, email, password });
const loginResponse = await loginApi({ email, password });
login(loginResponse.token, loginResponse.usuario);
navigate(getRoleHomePath(usuario.rol) ?? '/403');
```

Si el registro se completa pero el login automático falla, se redirige a `/login`
con un mensaje de éxito. La cuenta quedó creada, así que perder la sesión no debe
parecer un fallo del registro.

Ambas redirecciones llevan un retardo breve para que el mensaje de confirmación sea
legible antes del cambio de pantalla.

### Rol asignado

El endpoint de registro **siempre crea la cuenta como Estudiante**. No hay forma de
elegir el rol desde el formulario público. Promover a Instructor o Admin es una
acción de administración que se hace desde el módulo de usuarios.

### Errores

| Código | Mensaje mostrado |
| --- | --- |
| 400 | El mensaje de validación del servidor, por ejemplo el detalle de la contraseña |
| 409 | Ya existe una cuenta con ese correo |

## Visibilidad de la contraseña

Los campos de contraseña incluyen un botón que alterna entre `type="password"` y
`type="text"`. El botón lleva `aria-label` descriptivo que cambia según el estado,
porque su icono no comunica nada a un lector de pantalla.

## Pantalla de acceso denegado

`/403` es la página a la que envía `RoleGuard` cuando hay sesión válida pero el rol
no tiene acceso al área. Es un caso distinto de la falta de sesión, que redirige a
`/login`, y por eso tiene pantalla propia: el usuario no necesita autenticarse otra
vez, necesita saber que su cuenta no alcanza a esa sección.

## Inicio de sesión con Google

La dependencia `@react-oauth/google` está instalada y existe la variable
`VITE_GOOGLE_CLIENT_ID`, pero **el flujo no está implementado**. Falta el
intercambio del token de Google por un JWT propio en el backend. Hasta entonces, la
única autenticación operativa es la de correo y contraseña.
