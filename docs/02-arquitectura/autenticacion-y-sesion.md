# Autenticación y sesión

## Archivos implicados

El contexto de autenticación está repartido en tres archivos a propósito:

| Archivo | Contenido |
| --- | --- |
| `src/context/authContext.ts` | La interfaz `AuthContextType` y el objeto de contexto |
| `src/context/AuthContext.tsx` | El componente `AuthProvider` |
| `src/context/useAuth.ts` | El hook `useAuth` |

La separación no es estética. La regla de lint `react(only-export-components)`
avisa cuando un archivo exporta a la vez un componente y otros valores, porque eso
rompe la sustitución en caliente durante el desarrollo. Con los tres archivos, el
módulo que define el componente exporta solo el componente.

## Contenido del contexto

```ts
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  photoVersion: number;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}
```

Uso en cualquier componente por debajo del proveedor:

```tsx
import { useAuth } from '../context/useAuth';

const { user, isAuthenticated, logout } = useAuth();
```

`useAuth` lanza un error si se usa fuera de `AuthProvider`. Es intencionado: falla
en el momento del desarrollo en lugar de devolver `undefined` y romper más tarde
en un punto sin relación aparente.

## Qué se guarda y qué no

`localStorage` contiene dos claves:

| Clave | Contenido |
| --- | --- |
| `token` | El JWT emitido por la API |
| `user` | Datos básicos: `id`, `nombre`, `apellido`, `email`, `rol`, `activo` |

**Los campos de perfil `fotoUrl`, `telefono` y `codigoPais` se excluyen a propósito.**
La función que filtra es explícita:

```ts
function toSessionUser(user: User): User {
  const { fotoUrl: _foto, telefono: _tel, codigoPais: _pais, ...session } = user;
  return session;
}
```

El razonamiento: son datos que cambian desde otros dispositivos y que quedarían
obsoletos en el almacenamiento local. Guardar lo mínimo evita mostrar una foto
antigua tras cambiarla en otra sesión. La contrapartida es que el perfil completo
hay que pedirlo al servidor, y de eso se encarga el paso siguiente.

## Rehidratación al entrar al panel

`HomePage` pide el perfil completo al montar:

```tsx
useEffect(() => {
  if (!isAuthenticated) return;
  let cancelled = false;

  getMeApi()
    .then((profile) => { if (!cancelled) updateUser(profile); })
    .catch(() => undefined);

  return () => { cancelled = true; };
}, [isAuthenticated, updateUser]);
```

Esta llamada está en el layout del panel y **no en `AuthProvider`**. La diferencia
es relevante: si el proveedor hiciera una petición al montar, cualquier prueba o
pantalla que se renderizara dentro de él dispararía red, y un 401 con un token de
prueba cerraría la sesión antes de que la pantalla se evaluara. Colocándola en el
layout, el proveedor queda como estado puro.

El `catch` vacío es deliberado: si la API no responde, se conserva la sesión con
los datos básicos en lugar de expulsar al usuario. Un fallo de red no es una sesión
inválida.

## Invalidación de la caché de la foto

El backend guarda la foto con un nombre estable, `{userId}.{extensión}`, así que al
sustituirla la URL no cambia y el navegador seguiría mostrando la anterior. Para
resolverlo, el contexto mantiene un contador:

```tsx
useEffect(() => {
  setPhotoVersion((version) => version + 1);
}, [user?.fotoUrl]);
```

Y la URL final se construye añadiéndolo como parámetro:

```
http://localhost:5044/uploads/profiles/<id>.jpg?v=3
```

De eso se encarga `getProfilePhotoUrl(fotoUrl, photoVersion)` en
`src/utils/profilePhoto.ts`. Cualquier sitio que muestre el avatar debe usar esa
función, no concatenar la URL a mano; de lo contrario mostrará una imagen cacheada.

## Ciclo de vida de la sesión

### Inicio

```tsx
const { token, usuario } = await loginApi({ email, password });
login(token, usuario);
navigate('/home');
```

`login` escribe token y usuario en `localStorage`, actualiza el estado y reinicia
`photoVersion`. `/home` decide el área según el rol.

### Durante la sesión

Cada petición añade el token en `src/api/http.ts`:

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.authorization = `Bearer ${token}`;
  return config;
});
```

El token se lee de `localStorage` y no del estado de React porque el interceptor no
es un componente y no puede acceder al contexto.

### Cierre

```tsx
const handleLogout = async () => {
  try {
    await logoutApi();
  } catch {
    // Logout stateless: limpiar sesión local aunque falle la red.
  }
  logout();
  navigate('/login');
};
```

El JWT no se revoca en el servidor, así que la llamada a `logoutApi` es informativa.
La limpieza local se hace siempre, incluso si esa llamada falla: lo contrario
dejaría al usuario dentro de la aplicación tras haber pedido salir.

### Expiración

`AuthProvider` publica un handler que el cliente HTTP invoca ante cualquier 401:

```tsx
useEffect(() => {
  setUnauthorizedHandler(() => { logout(); });
  return () => setUnauthorizedHandler(null);
}, [logout]);
```

Al limpiarse la sesión, `RoleGuard` deja de encontrar token y redirige a `/login`.
El resultado es que **la expiración se maneja en un solo sitio** y ninguna pantalla
necesita tratar el 401.

La inversión de dependencias aquí es intencionada: `api/http.ts` no importa el
contexto (crearía un ciclo), sino que expone `setUnauthorizedHandler` para que el
proveedor se registre.

## Comportamiento tras cambiar la contraseña

El backend no invalida los tokens emitidos, así que la sesión actual sigue siendo
válida después de un cambio de contraseña y el usuario continúa dentro. Las
sesiones abiertas en otros dispositivos también siguen activas hasta que caduquen.
Si en el futuro se requiere cerrarlas, hace falta soporte del backend, como una
marca de versión de credenciales incluida en el token.
