# Manejo de errores

## Contrato del backend

Todos los errores de la API llegan con la misma forma, sin importar el módulo:

```json
{ "error": "El nombre debe tener entre 3 y 100 caracteres.", "statusCode": 400 }
```

El campo `error` ya viene redactado en español y es apto para mostrarse al usuario.
Por eso la regla general es preferir el mensaje del servidor antes que un texto
genérico propio.

## Utilidades disponibles

Todas viven en `src/utils/apiErrors.ts`.

| Función | Para qué sirve |
| --- | --- |
| `getHttpStatus(error)` | Devuelve el código HTTP, o `undefined` si el fallo no es de red |
| `getApiErrorMessage(error, fallback)` | Devuelve `error` o `message` del cuerpo; si no existen, el texto de reserva |
| `resolveDeleteCategoryError(error)` | Traduce los códigos del borrado de categorías |
| `resolveSaveCategoryError(error)` | Traduce los códigos del alta y edición de categorías |
| `resolveEnrollmentError(error)` | Traduce los códigos de la inscripción a un curso |

## Patrón de uso en una pantalla

```tsx
try {
  await updateProfileApi(payload);
  setSaveMessage('Cambios guardados correctamente.');
} catch (error) {
  setLoadError(getApiErrorMessage(error, 'No se pudieron guardar los cambios.'));
}
```

Siempre se pasa un texto de reserva porque el fallo puede no venir del backend:
si el servidor está apagado, Axios rechaza sin cuerpo de respuesta.

## Significado de cada código

| Código | Situación | Qué debe hacer la UI |
| --- | --- | --- |
| 400 | Datos inválidos | Mostrar el mensaje del servidor junto al formulario, sin cerrarlo |
| 401 | Sesión ausente, inválida o expirada | No se maneja en la pantalla: lo resuelve el interceptor global |
| 403 | Autenticado pero sin permiso | Mostrar aviso de permisos y no reintentar |
| 404 | El recurso ya no existe | Invitar a recargar la lista |
| 409 | Conflicto de reglas de negocio | Mostrar el motivo exacto y conservar el estado anterior |
| 500 | Fallo del servidor | Mensaje genérico y opción de reintentar |

## El 401 es global

`src/api/http.ts` registra un interceptor de respuesta que, ante un 401, llama al
handler que publicó `AuthProvider`. Ese handler limpia la sesión, con lo que las
rutas protegidas redirigen a `/login` de forma automática.

Consecuencia: **ninguna pantalla debe tratar el 401 por su cuenta**. Si lo hace,
duplica lógica y puede dejar la sesión en un estado inconsistente.

## Reglas que no se negocian

1. **Un fallo nunca se traga en silencio.** Si una operación no se completó, el
   usuario tiene que verlo.
2. **El estado local no se modifica antes de la confirmación del servidor.** Si un
   borrado responde 409, la fila permanece en la tabla. Hay una prueba automatizada
   que verifica exactamente esto en `CategoriesPage.test.tsx`.
3. **Un formulario con error no se cierra.** El usuario debe poder corregir sin
   volver a escribir todo.
4. **Los errores se anuncian a lectores de pantalla** con `role="alert"` para
   errores y `role="status"` para confirmaciones.
