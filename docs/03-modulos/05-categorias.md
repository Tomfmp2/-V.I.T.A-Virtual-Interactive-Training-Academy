# Módulo: Categorías

## Ubicación

| | |
| --- | --- |
| Pantalla | `src/pages/admin/CategoriesPage.tsx` |
| Estilos | `src/pages/admin/CategoriesPage.css` |
| Pruebas | `src/pages/admin/CategoriesPage.test.tsx` |
| Componentes | `components/admin/CategoryForm.tsx`, `components/admin/ConfirmDeleteDialog.tsx` |
| Hook | `src/hooks/useCategories.ts` |
| Sección | `categories` |
| Rol | Admin |

Es el módulo con mayor cobertura de pruebas del proyecto y sirve de referencia para
implementar un CRUD nuevo.

## El hook useCategories

```ts
export const useCategories = (enabled = true) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [loadError, setLoadError] = useState('');

  const refetch = useCallback(async () => {
    if (!enabled) return;
    // ...
  }, [enabled]);

  useEffect(() => { void refetch(); }, [refetch]);

  return { categories, isLoading, loadError, refetch };
};
```

El parámetro `enabled` resuelve un problema concreto de las reglas de los hooks: no
se pueden llamar condicionalmente, así que el hook se ejecuta incluso cuando el rol
del usuario no puede ver categorías. Sin `enabled`, la pantalla lanzaría una
petición destinada a recibir un 403 antes de mostrar el aviso de permisos.

`isLoading` arranca en el valor de `enabled`: si el hook está desactivado no hay
carga en curso, y arrancar en `true` mostraría un indicador que nunca se apagaría.

`refetch` se expone porque toda mutación termina releyendo del servidor.

## Campos

| Campo | Obligatorio | Reglas |
| --- | --- | --- |
| `nombre` | Sí | Mínimo 3 caracteres, único |
| `descripcion` | No | Se recorta; si queda vacía se envía `null` |
| `iconoUrl` | No | Se recorta; si queda vacía se envía `null` |

El backend devuelve además `id`, `slug` y `activo`. El `slug` se genera en el
servidor a partir del nombre y no es editable.

Los valores se recortan antes de enviarse. Hay una prueba que verifica que
`'  Datos  '` llega como `'Datos'`: un espacio invisible al final no debería crear
una categoría distinta.

## El caso central: borrar una categoría en uso

Si una categoría tiene cursos asociados, el backend responde 409. La regla de la
interfaz es estricta y está cubierta por pruebas:

```ts
if (status === 409) return CATEGORY_IN_USE_MESSAGE;
```

```ts
export const CATEGORY_IN_USE_MESSAGE = 'No se puede borrar: categoría en uso';
```

Cuando eso ocurre, deben cumplirse cuatro condiciones a la vez:

1. Se muestra ese texto exacto.
2. La categoría **permanece** en la tabla.
3. La lista **no** se recarga como si la operación hubiera funcionado.
4. El diálogo de confirmación **sigue abierto** con el error visible.

Las cuatro están verificadas en `CategoriesPage.test.tsx`. La razón de ser tan
explícito: un borrado que parece funcionar y no lo hizo es el peor resultado
posible, porque el usuario se entera cuando ya cuenta con que el dato desapareció.

Al cerrar el diálogo, la fila queda marcada con la etiqueta En uso, de modo que la
información obtenida no se pierde al descartar el mensaje.

## Ningún cambio local antes de la confirmación

Todas las mutaciones siguen el mismo patrón:

```tsx
await deleteCategoryApi(id);   // si falla, lanza y no se sigue
await refetch();               // se relee del servidor
```

No hay actualizaciones optimistas. Es una llamada extra por operación, a cambio de
que la tabla nunca muestre un estado que el servidor no confirmó. Una prueba
comprueba que tras un borrado con éxito `getCategoriesApi` se llamó dos veces, y que
tras un 409 se llamó una sola.

## Errores

| Código | Al borrar | Al crear o editar |
| --- | --- | --- |
| 400 | | Revisa los datos: el backend rechazó la categoría |
| 403 | No tienes permisos para eliminar categorías | No tienes permisos para gestionar categorías |
| 404 | La categoría ya no existe. Actualiza la lista | La categoría ya no existe. Actualiza la lista |
| 409 | No se puede borrar: categoría en uso | Ya existe una categoría con ese nombre |
| Otro | No se pudo eliminar la categoría. Intenta de nuevo | No se pudo guardar la categoría. Intenta de nuevo |

Los resolvedores están en `utils/apiErrors.ts`: `resolveDeleteCategoryError` y
`resolveSaveCategoryError`.

## Diálogo de confirmación

`ConfirmDeleteDialog` usa `role="alertdialog"` y muestra los errores dentro del
propio diálogo. No se cierra si la operación falla, para que el usuario vea el motivo
en el mismo contexto en el que actuó.

## Validación en el cliente

El mínimo de 3 caracteres se comprueba antes de llamar al servidor. Hay una prueba
que confirma que con `'ab'` **no se llama** a `createCategoryApi`: una petición que
se sabe inválida es latencia gratuita.

## Endpoints consumidos

| Acción | Endpoint |
| --- | --- |
| Listar | `GET /api/categories` |
| Crear | `POST /api/categories` |
| Editar | `PUT /api/categories/{id}` |
| Borrar | `DELETE /api/categories/{id}` |

## Niveles

Los niveles (Principiante, Intermedio, Avanzado) tienen su cliente completo en
`api/levelsApi.ts` con las cuatro operaciones, pero **no hay pantalla de gestión**.
Se consumen en modo lectura desde el formulario de cursos. Los tres registros vienen
del seed del backend. Si hiciera falta administrarlos, esta pantalla es la plantilla
a seguir.
