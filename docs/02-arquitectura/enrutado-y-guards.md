# Enrutado y guards

## Mapa de rutas

Definidas en `src/routes/AppRouter.tsx` con React Router 7.

| Ruta | Componente | Acceso |
| --- | --- | --- |
| `/` | `LandingPage` | Público |
| `/login` | `LoginPage` | Público |
| `/register` | `RegisterPage` | Público |
| `/403` | `ForbiddenPage` | Público |
| `/home` | `RoleHomeRedirect` | Requiere sesión |
| `/admin/*` | `HomePage` | Rol Admin |
| `/instructor/*` | `HomePage` | Rol Admin o Instructor |
| `/estudiante/*` | `HomePage` | Rol Estudiante |
| Cualquier otra | Redirige a `/` | Público |

## Las rutas por área no se escriben a mano

Las tres rutas de área se generan recorriendo `roleRouteAccess`, declarado en
`src/utils/roleNavigation.ts`:

```ts
export const roleRouteAccess: Record<string, PlatformRole[]> = {
  '/admin': ['admin'],
  '/instructor': ['admin', 'instructor'],
  '/estudiante': ['estudiante'],
};
```

```tsx
{Object.entries(roleRouteAccess).map(([routeBase, allowedRoles]) => (
  <Route
    key={routeBase}
    path={`${routeBase}/*`}
    element={<RoleGuard allowedRoles={allowedRoles}>{<HomePage />}</RoleGuard>}
  />
))}
```

El motivo de hacerlo así es evitar la clase de error más costosa en control de
acceso: que la tabla de permisos y el árbol de rutas se desincronicen. Con un solo
objeto como fuente de verdad, añadir un área es una línea, y el router, el guard y
la comprobación `canAccessRoute` quedan alineados por construcción.

Nótese que `/instructor` admite también a `admin`. Es deliberado: un administrador
puede entrar al área de instructor para gestionar cursos y lecciones.

## RoleGuard

`src/components/auth/RoleGuard.tsx` decide en tiempo de render:

```tsx
if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

const role = normalizePlatformRole(user?.rol);
if (!role || !allowedRoles.includes(role)) return <Navigate to="/403" replace />;

return <>{children}</>;
```

Detalles que importan:

- **Sin sesión va a `/login`; con sesión pero sin permiso va a `/403`.** Son casos
  distintos y el usuario merece saber cuál le aplica.
- Se guarda la ruta de origen en `state.from` para poder volver tras el login.
- `replace` evita que el botón Atrás devuelva al usuario a una ruta que no puede ver.
- Un rol desconocido o ausente **se deniega**. La lista de permitidos es explícita,
  nunca por descarte.

## RoleHomeRedirect

`/home` no renderiza nada propio: resuelve a dónde pertenece el usuario.

```tsx
if (!token) return <Navigate to="/login" replace />;
const homePath = getRoleHomePath(user?.rol);
return <Navigate to={homePath ?? '/403'} replace />;
```

Así el login puede enviar siempre a `/home` sin conocer los roles, y la decisión
queda en un único lugar.

## Navegación dentro del panel

Las tres áreas montan el mismo componente `HomePage`, que actúa como layout:
barra lateral, cabecera y área de contenido. La sección visible se controla con
estado local (`active`), no con subrutas:

```tsx
const renderMainContent = () => {
  if (active === 'categories') return <CategoriesPage />;
  if (active === 'settings') return <PerfilPage />;
  if (active === 'explore') return <ExploreCoursesPage mode={...} />;
  if (active === 'users') return <UsersPage />;
  if (active === 'reports') return <ReportsPage />;
  if (active === 'my-courses') { /* varía según el rol */ }
  // por defecto, el dashboard del rol
};
```

| Sección | Admin | Instructor | Estudiante |
| --- | --- | --- | --- |
| `dashboard` | `AdminDashboard` | `InstructorDashboard` | `StudentDashboard` |
| `my-courses` | `ManageCoursesPage` variante admin | `ManageCoursesPage` variante instructor | `MyEnrollmentsPage` |
| `explore` | `ExploreCoursesPage` modo browse | `ExploreCoursesPage` modo browse | `ExploreCoursesPage` modo enroll |
| `users` | `UsersPage` | No disponible | No disponible |
| `categories` | `CategoriesPage` | No disponible | No disponible |
| `reports` | `ReportsPage` | `ReportsPage` | No disponible |
| `settings` | `PerfilPage` | `PerfilPage` | `PerfilPage` |

Como el patrón de ruta es `${routeBase}/*`, cualquier subruta del área sigue
resolviendo a `HomePage`. La contrapartida conocida de este diseño: **la sección
activa no queda reflejada en la URL**, así que no se puede compartir un enlace
directo a una sección ni recargar manteniéndola. Migrarlo a subrutas reales es la
mejora natural si esa necesidad aparece.

## El menú no es control de acceso

`getRoleNavItems(rol)` decide qué entradas se muestran en la barra lateral, y eso
es solo presentación. El acceso real lo imponen tres capas:

1. `RoleGuard` en el router.
2. El propio `HomePage`, que solo monta la pantalla si el rol corresponde.
3. El backend, que valida el rol en cada petición.

Ocultar un botón nunca cuenta como protección: la comprobación del servidor es la
que decide.

## Añadir una sección nueva

1. Crear la pantalla en `src/pages/<area>/`.
2. Añadir la entrada en `navItemsByRole` dentro de `utils/roleNavigation.ts`.
3. Añadir el icono al tipo `RoleNavIcon` y su trazado en el componente `Icon`.
4. Añadir la rama correspondiente en `renderMainContent` de `HomePage.tsx`.
5. Confirmar que el endpoint del backend valida el rol.
