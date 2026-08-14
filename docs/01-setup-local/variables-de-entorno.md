# Variables de entorno

## Cómo funcionan en Vite

Vite solo expone al navegador las variables que empiezan por `VITE_`. Se leen con
`import.meta.env.VITE_NOMBRE`.

Dos consecuencias importantes:

1. **Todo lo que definas aquí acaba en el bundle y es público.** Nunca pongas
   secretos, claves privadas ni cadenas de conexión en este archivo.
2. **Las variables se leen al arrancar.** Si cambias `.env` mientras el servidor
   está levantado, hay que reiniciar `npm run dev`.

## Archivos

| Archivo | Se versiona | Uso |
| --- | --- | --- |
| `.env.example` | Sí | Plantilla de referencia con la lista completa de variables |
| `.env` | No | Tu configuración local, ignorada por git |

Al clonar el repositorio: `cp .env.example .env`.

## Variables

### `VITE_API_URL`

| | |
| --- | --- |
| Obligatoria | No, pero recomendada |
| Valor por defecto | `http://localhost:5044/api` |
| Formato | URL absoluta terminada en `/api`, sin barra final |

URL base de la API. La usa la instancia de Axios en `src/api/http.ts`, de modo que
los clientes escriben rutas relativas (`/auth/me`, `/courses`).

```bash
VITE_API_URL=http://localhost:5044/api
```

El sufijo `/api` importa por un motivo que no es evidente: `src/utils/profilePhoto.ts`
construye la URL de las fotos de perfil quitando ese sufijo, porque el backend
sirve los archivos estáticos fuera de `/api`.

```
VITE_API_URL = http://localhost:5044/api
fotoUrl del backend = /uploads/profiles/<id>.jpg
URL final de la imagen = http://localhost:5044/uploads/profiles/<id>.jpg
```

Si `VITE_API_URL` no termina en `/api`, las fotos de perfil no cargarán aunque el
resto de la aplicación funcione.

### `VITE_GOOGLE_CLIENT_ID`

| | |
| --- | --- |
| Obligatoria | No |
| Valor por defecto | Ninguno |

Identificador de cliente OAuth para el inicio de sesión con Google. La dependencia
`@react-oauth/google` está instalada y la variable reservada, pero **el flujo no
está activo**: la autenticación en uso es la de usuario y contraseña contra la API.
Puede quedarse con el valor de ejemplo sin afectar a nada.

## Configuración por entorno

Vite admite archivos por modo, todos ignorados por git salvo el ejemplo:

| Archivo | Cuándo se aplica |
| --- | --- |
| `.env` | Siempre |
| `.env.development` | Solo con `npm run dev` |
| `.env.production` | Solo con `npm run build` |

Para desplegar, define `VITE_API_URL` con la URL pública de la API antes de
compilar. El valor queda incrustado en el build, así que **cambiar de entorno
exige recompilar**.

## Añadir una variable nueva

1. Añádela a `.env.example` con un valor de ejemplo y un comentario.
2. Añádela a tu `.env` local.
3. Consúmela con `import.meta.env.VITE_NOMBRE` y prevé un valor por defecto.
4. Documéntala en este archivo.

Patrón recomendado para el valor por defecto:

```ts
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5044/api';
```

Así el proyecto arranca aunque falte el `.env`, lo que evita que una configuración
incompleta parezca un error de código.
