# Pruebas

## Herramientas

| Herramienta | Papel |
| --- | --- |
| Vitest | Ejecutor de pruebas, integrado con la configuración de Vite |
| Testing Library | Consultas sobre el DOM desde el punto de vista del usuario |
| `user-event` | Simulación de interacción realista |
| jsdom | Entorno de DOM en Node |

## Comandos

```bash
npm run test         # una pasada, lo que se usa en CI
npm run test:watch   # modo observador durante el desarrollo
```

## Estado actual

| Archivo | Pruebas | Entorno |
| --- | --- | --- |
| `src/pages/admin/CategoriesPage.test.tsx` | 11 activas | jsdom |
| `src/api/categoriesApi.integration.test.tsx` | 3, se saltan sin el mock | node |

## Entorno por archivo

El entorno se declara en la primera línea del archivo, no de forma global:

```tsx
// @vitest-environment jsdom
```

```tsx
// @vitest-environment node
```

Las pruebas de componentes necesitan DOM; las de integración hacen peticiones HTTP
reales y no lo necesitan. Declararlo por archivo evita cargar jsdom donde no aporta.

## Qué se prueba

La suite de categorías está organizada por comportamiento, no por método:

| Bloque | Qué verifica |
| --- | --- |
| lectura | Indicador de carga, lista, estado vacío y error con opción de reintentar |
| DELETE 409 | Que un borrado rechazado no altera la tabla |
| DELETE correcto | Que la fila desaparece solo tras un 2xx, releyendo del servidor |
| CREATE y UPDATE | Recorte de valores, validación local, 409 de duplicado y precarga al editar |
| permisos | Que un estudiante no ve la pantalla ni dispara peticiones |

## El caso que justifica la suite

Cuatro aserciones sobre un mismo escenario, un borrado que el servidor rechaza con 409:

```tsx
// 1. mensaje literal exigido por la tarjeta
expect(await screen.findByText('No se puede borrar: categoría en uso')).toBeTruthy();

// 2. la categoría sigue en la tabla: el borrado nunca es silencioso
expect(within(screen.getByRole('table')).getByText('Desarrollo')).toBeTruthy();
expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);

// 3. no se recargó la lista como si hubiera funcionado
expect(vi.mocked(getCategoriesApi)).toHaveBeenCalledTimes(1);

// 4. el diálogo sigue abierto con el error visible
expect(screen.getByRole('alertdialog')).toBeTruthy();
```

Comprobar el mensaje no bastaría: el fallo grave sería mostrar el aviso y borrar la
fila de todos modos. La tercera aserción cierra la otra variante del error, recargar
la lista como si la operación hubiera tenido éxito.

## Cómo se aísla la capa de API

Se sustituye el módulo completo:

```tsx
vi.mock('../../api/categoriesApi', () => ({
  getCategoriesApi: vi.fn(),
  createCategoryApi: vi.fn(),
  updateCategoryApi: vi.fn(),
  deleteCategoryApi: vi.fn(),
}));
```

Esto es posible porque las pantallas nunca usan `axios` directamente. Si una pantalla
hiciera su propia llamada HTTP, dejaría de ser aislable.

Los errores HTTP se construyen con un ayudante:

```tsx
const httpError = (status: number) =>
  new AxiosError('request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: { error: 'x', statusCode: status },
    // ...
  } as never);
```

Reproduce la forma real de un error de Axios, que es lo que leen las utilidades de
`apiErrors.ts`.

## Simulación de sesión

```tsx
const signIn = (rol: string) => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify({ id: 'u1', nombre: 'Andrés', email: 'a@vita.co', rol }));
};
```

Se escribe en `localStorage` porque es de donde `AuthProvider` rehidrata al montar.
Cambiar el rol en esa llamada es todo lo que hace falta para probar el caso de
permisos.

Detalle importante que conviene no romper: **`AuthProvider` no hace peticiones al
montar**. La lectura del perfil vive en `HomePage`. Si se moviera al proveedor,
estas pruebas dispararían una llamada real con un token falso, el 401 cerraría la
sesión y la pantalla mostraría el aviso de permisos en lugar de los datos. Es un
fallo confuso de diagnosticar, así que la ubicación de esa petición es deliberada.

## Higiene entre pruebas

```tsx
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  signIn('Admin');
  vi.mocked(getCategoriesApi).mockResolvedValue([desarrollo, marketing]);
});

afterEach(() => cleanup());
```

Se limpian los mocks y el almacenamiento en cada prueba, y se desmonta el árbol al
terminar. Sin eso, el orden de ejecución influiría en los resultados.

## Pruebas de integración

`categoriesApi.integration.test.tsx` verifica el contrato contra el mock que replica
el controlador del backend. Requiere el mock levantado:

```bash
npm run mock:api
```

Si no está disponible, la suite se salta en lugar de fallar:

```tsx
const isMockUp = await fetch(`${MOCK_URL}/categories`, { headers: { authorization: 'ping' } })
  .then((response) => response.ok)
  .catch(() => false);

describe.skipIf(!isMockUp)('categoriesApi contra el contrato real', () => { /* ... */ });
```

El motivo es práctico: nadie debería ver la suite en rojo por no tener levantado un
servicio opcional. En el entorno node no existe `localStorage`, del que el
interceptor lee el token, así que se define un sustituto mínimo en `beforeAll`.

## Escribir una prueba nueva

1. Crear `<Componente>.test.tsx` junto al componente.
2. Declarar el entorno en la primera línea con `// @vitest-environment jsdom`.
3. Sustituir el módulo de `api/` con `vi.mock`.
4. Renderizar dentro de `AuthProvider` y fijar el rol con un ayudante como `signIn`.
5. Consultar por rol y texto visible (`getByRole`, `findByText`), no por clase CSS.
6. Cubrir el camino correcto, el estado vacío, el error y los permisos.

Criterio para elegir aserciones: comprobar lo que el usuario percibe. Un texto
visible o una fila presente en la tabla resisten un refactor de estilos; una clase
CSS o un nombre de estado interno, no.

## Qué falta por cubrir

Las pantallas de cursos, lecciones, usuarios, reportes y perfil no tienen pruebas
automatizadas. Al añadirlas, `CategoriesPage.test.tsx` es la referencia. Por impacto,
el orden razonable sería:

1. `PerfilPage`, por la combinación de subida de archivo y cambio de contraseña.
2. `ManageCoursesPage`, por las reglas de publicación.
3. `UsersPage`, por los cambios de rol y estado.
