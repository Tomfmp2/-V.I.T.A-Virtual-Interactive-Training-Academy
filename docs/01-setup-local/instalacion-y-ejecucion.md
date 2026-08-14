# Instalación y ejecución

## Requisitos

| Herramienta | Versión mínima | Comprobación |
| --- | --- | --- |
| Node.js | 20 (recomendado 22 LTS) | `node --version` |
| npm | 10 | `npm --version` |
| Backend de VITA | En ejecución en `http://localhost:5044` | `curl http://localhost:5044/swagger` |

El frontend no funciona sin el backend: no hay datos simulados en el arranque
normal. Si necesitas trabajar sin API, consulta el apartado del mock más abajo.

## Instalación

```bash
git clone <url-del-repositorio>
cd V.I.T.A-Virtual-Interactive-Training-Academy
npm install
cp .env.example .env
```

Revisa `.env` y ajusta `VITE_API_URL` si tu backend no está en el puerto 5044.
El detalle de cada variable está en [`variables-de-entorno.md`](variables-de-entorno.md).

## Arranque en desarrollo

```bash
npm run dev
```

La aplicación queda en `http://localhost:5174`.

El puerto está fijado en `vite.config.ts` con `strictPort: true`. Si 5174 está
ocupado, Vite **falla en lugar de cambiar de puerto**, para que la URL de trabajo
sea siempre la misma. Si ves `Port 5174 is already in use`, cierra el servidor
anterior:

```bash
lsof -ti:5174 | xargs kill
```

## Scripts disponibles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Verifica tipos con `tsc -b` y genera el build de producción en `dist/` |
| `npm run preview` | Sirve el contenido de `dist/` para revisar el build |
| `npm run lint` | Ejecuta oxlint sobre todo el proyecto |
| `npm run test` | Ejecuta la suite de pruebas una vez |
| `npm run test:watch` | Ejecuta las pruebas en modo observador |
| `npm run mock:api` | Levanta un servidor mock del módulo de categorías |

## Orden recomendado para levantar todo

Se necesitan dos terminales.

Terminal 1, backend:

```bash
cd ../V.I.T.A-Virtual-Interactive-Training-Academy-backend
dotnet run --project Vita.Api
```

Terminal 2, frontend:

```bash
cd V.I.T.A-Virtual-Interactive-Training-Academy
npm run dev
```

Comprueba que el enlace funciona abriendo `http://localhost:5174` e iniciando
sesión con una cuenta de prueba. Los usuarios demo y sus contraseñas se configuran
en el backend; están documentados en `docs/01-setup-local/configurar-seeds.md` de
ese repositorio.

| Cuenta | Área a la que entra |
| --- | --- |
| `admin@vita.local` | Panel de administración |
| `instructor@vita.local` | Panel de instructor |
| `estudiante@vita.local` | Panel de estudiante |

## Verificación posterior a la instalación

```bash
npm run lint     # sin salida significa sin avisos
npm run test     # la suite debe pasar completa
npm run build    # debe terminar sin errores de tipos
```

Si los tres comandos pasan, el entorno está correcto.

## Trabajar sin backend

`npm run mock:api` levanta un servidor mínimo que responde al módulo de categorías
(`tools/mock-categories-api.mjs`). Sirve para desarrollar esa pantalla de forma
aislada, apuntando `VITE_API_URL` al mock. **No cubre autenticación**, así que no
sustituye al backend para el resto de la aplicación.

## Problemas frecuentes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `Port 5174 is already in use` | Otro servidor de Vite sigue vivo | Cerrar el proceso anterior |
| La sesión se cierra al recargar | El backend no responde y devuelve 401 | Verificar que la API esté arriba y que `VITE_API_URL` apunte a ella |
| Error de CORS en la consola | La API no está en modo Development | En local la política CORS solo se activa en Development |
| La foto de perfil no carga | `VITE_API_URL` no termina en `/api` | La URL de la imagen se deriva de esa variable quitando el sufijo `/api` |
| Las peticiones van a otro puerto | El `.env` se cambió con el servidor levantado | Vite solo lee `.env` al arrancar: reinicia `npm run dev` |
