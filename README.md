# VITA — Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

Cliente web de **V.I.T.A** (Virtual Interactive Training Academy), plataforma de
cursos en línea con tres áreas de trabajo diferenciadas: administración, instructor
y estudiante.

Proyecto 3 · CAMPUSLANDS

---

## Índice

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Cómo iniciar](#cómo-iniciar)
- [Cómo usar](#cómo-usar)
- [Scripts disponibles](#scripts-disponibles)
- [Configuración](#configuración)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roles y permisos](#roles-y-permisos)
- [Cómo verificar](#cómo-verificar)
- [Cómo actualizar](#cómo-actualizar)
- [Cómo desplegar](#cómo-desplegar)
- [Convenciones](#convenciones)
- [Documentación](#documentación)
- [Solución de problemas](#solución-de-problemas)

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Biblioteca de interfaz | React 19 |
| Lenguaje | TypeScript |
| Empaquetador | Vite 8 |
| Enrutado | React Router 7 |
| Cliente HTTP | Axios |
| Estilos | CSS con tokens propios y Tailwind CSS 4 |
| Tipografía | Plus Jakarta Sans, instalada como paquete |
| Lint | oxlint |
| Pruebas | Vitest, Testing Library y jsdom |

---

## Requisitos

| Herramienta | Versión mínima | Comprobación |
| --- | --- | --- |
| Node.js | 20, recomendado 22 LTS | `node --version` |
| npm | 10 | `npm --version` |
| API de VITA | En ejecución en `http://localhost:5044` | `curl http://localhost:5044/swagger` |

Este cliente **no funciona sin el backend**. Levántalo primero siguiendo el README
del repositorio `V.I.T.A-Virtual-Interactive-Training-Academy-backend`.

---

## Cómo iniciar

### 1. Clonar e instalar

```bash
git clone <url-del-repositorio>
cd V.I.T.A-Virtual-Interactive-Training-Academy
npm install
```

### 2. Configurar el entorno

```bash
cp .env.example .env
```

Valores por defecto, válidos para desarrollo local:

```bash
VITE_API_URL=http://localhost:5044/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

Ajusta `VITE_API_URL` solo si tu backend usa otro puerto. Debe terminar en `/api`.

### 3. Levantar el servidor de desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5174`.

El puerto está fijado con `strictPort`, así que si está ocupado Vite falla en lugar
de cambiarlo. Esto mantiene la URL de trabajo estable para todo el equipo.

### 4. Iniciar sesión

Usa una de las cuentas de prueba que crea el seed del backend. Las contraseñas están
en la configuración local de ese repositorio.

| Cuenta | Área a la que entra |
| --- | --- |
| `admin@vita.local` | Panel de administración |
| `instructor@vita.local` | Panel de instructor |
| `estudiante@vita.local` | Panel de estudiante |

---

## Cómo usar

Tras iniciar sesión, la aplicación redirige al área que corresponde al rol de la
cuenta. La navegación se hace desde la barra lateral, cuyas entradas cambian según
el rol.

### Área de administración

| Sección | Qué permite |
| --- | --- |
| Dashboard | Resumen de la plataforma |
| Cursos | Gestionar todos los cursos y sus lecciones |
| Explorar | Consultar el catálogo |
| Usuarios | Crear cuentas, cambiar roles y activar o desactivar |
| Categorías | Administrar las categorías del catálogo |
| Reportes | Cursos por instructor, estudiantes por curso y más populares |
| Configuración | Perfil, foto y contraseña |

Un administrador puede crear, editar y borrar cursos y lecciones, pero **no puede
publicar un curso**: publicar está reservado al instructor asignado.

### Área de instructor

| Sección | Qué permite |
| --- | --- |
| Dashboard | Resumen de sus cursos |
| Mis cursos | Gestionar sus cursos, sus lecciones y publicarlos |
| Explorar | Consultar el catálogo |
| Reportes | Estudiantes por curso, limitado a sus cursos |
| Configuración | Perfil, foto y contraseña |

Para publicar un curso hace falta que tenga al menos una lección. Un curso publicado
no se puede borrar: primero hay que pasarlo a borrador.

### Área de estudiante

| Sección | Qué permite |
| --- | --- |
| Dashboard | Resumen de su avance |
| Explorar catálogo | Ver cursos publicados e inscribirse |
| Mis inscripciones | Acceder a los cursos en los que está inscrito |
| Configuración | Perfil, foto y contraseña |

El progreso por lección se guarda en el navegador. No se sincroniza entre
dispositivos, porque el backend todavía no lo persiste.

### Configuración de perfil

Disponible para los tres roles. Permite cambiar nombre, apellido, teléfono con
código de país, foto de perfil y contraseña. El correo se muestra en modo lectura.

La foto se guarda en el disco del servidor y en la base de datos queda solo su ruta.
Se admiten JPG, PNG y WEBP hasta 2 MB.

---

## Scripts disponibles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Verifica tipos con `tsc -b` y genera `dist/` |
| `npm run preview` | Sirve el contenido de `dist/` para revisar el build |
| `npm run lint` | Ejecuta oxlint; sin salida significa sin avisos |
| `npm run test` | Ejecuta la suite de pruebas una vez |
| `npm run test:watch` | Ejecuta las pruebas en modo observador |
| `npm run mock:api` | Levanta un mock del módulo de categorías |

---

## Configuración

| Variable | Obligatoria | Valor por defecto | Uso |
| --- | --- | --- | --- |
| `VITE_API_URL` | No, recomendada | `http://localhost:5044/api` | URL base de la API |
| `VITE_GOOGLE_CLIENT_ID` | No | Ninguno | Reservada para OAuth de Google, sin uso actual |

Tres cosas que conviene tener presentes:

1. **Todo lo que empieza por `VITE_` acaba en el bundle y es público.** No pongas
   secretos en `.env`.
2. **Las variables se leen al arrancar.** Si cambias `.env` con el servidor
   levantado, reinicia `npm run dev`.
3. **`VITE_API_URL` debe terminar en `/api`.** La URL de las fotos de perfil se
   deriva de esa variable quitando el sufijo, porque el backend sirve los archivos
   estáticos fuera de `/api`.

`.env` está ignorado por git; `.env.example` sí se versiona.

---

## Estructura del proyecto

```
src/
├── api/          # Un cliente por módulo de la API; unico lugar con rutas HTTP
├── components/   # Piezas reutilizables de interfaz
├── context/      # Estado de sesión (AuthProvider, useAuth)
├── hooks/        # Hooks reutilizables con estado y datos
├── pages/        # Una pantalla por archivo, agrupada por área
├── routes/       # Árbol de rutas y guards
├── styles/       # Tokens de diseño y estilos globales
├── types/        # Interfaces del contrato con el backend
└── utils/        # Funciones puras: permisos, errores, formato
```

La dirección de las dependencias es siempre la misma:

```
pages / components  ->  hooks  ->  api/  ->  api/http.ts  ->  backend
```

Ningún componente usa `axios` directamente. Eso mantiene las pantallas aislables en
pruebas y concentra cada cambio de ruta del backend en un solo archivo.

---

## Roles y permisos

| Rol en el backend | Área | Ruta |
| --- | --- | --- |
| `Admin` | Administración | `/admin` |
| `Instructor` | Instructor | `/instructor` |
| `Estudiante` | Estudiante | `/estudiante` |

El acceso se controla en tres capas:

| Capa | Qué impide |
| --- | --- |
| `RoleGuard` en el router | Entrar a un área ajena escribiendo la URL |
| Menú y permisos de interfaz | Ofrecer acciones que fallarían |
| Backend | Todo lo demás |

Solo la tercera es seguridad. Ocultar un botón nunca cuenta como protección: cada
endpoint valida rol y propiedad en el servidor.

Un administrador tiene acceso también al área de instructor, para poder gestionar
cursos y lecciones.

---

## Cómo verificar

Los tres comandos deben pasar antes de subir cambios:

```bash
npm run lint     # sin salida significa sin avisos
npm run test     # la suite completa en verde
npm run build    # tipos correctos y bundle generado
```

`npm run build` incluye `tsc -b`, que es la única comprobación de tipos del flujo:
Vite por su cuenta transpila sin verificarlos.

---

## Cómo actualizar

### Traer cambios del repositorio

```bash
git pull
npm install        # por si cambió package.json
npm run build      # confirma que compila
```

`npm install` después de un `git pull` no es opcional: si alguien añadió una
dependencia, la aplicación fallará con un error de módulo no encontrado.

### Actualizar dependencias

```bash
npm outdated                  # ver qué tiene versión nueva
npm update                    # actualizar dentro del rango de package.json
npm install <paquete>@latest  # subir de versión mayor, una a una
```

Tras cualquier actualización, ejecuta la verificación completa. Las subidas de
versión mayor conviene hacerlas de una en una para poder atribuir un fallo a su
causa.

### Revisar vulnerabilidades

```bash
npm audit
npm audit fix
```

Revisa el diff antes de aceptar `npm audit fix`: puede subir versiones mayores y
romper compatibilidad.

### Cuando cambia el contrato de la API

1. Actualiza la interfaz en `src/types/<modulo>.ts`.
2. Ajusta la función en `src/api/<modulo>Api.ts`.
3. Ejecuta `npm run build` para que TypeScript señale los puntos afectados.
4. Actualiza la documentación del módulo en `docs/03-modulos/`.

Empezar por los tipos hace que el compilador enumere todo lo que hay que tocar, en
lugar de descubrirlo en ejecución.

---

## Cómo desplegar

```bash
npm run build
```

El resultado queda en `dist/` y son archivos estáticos que sirve cualquier servidor
web.

Antes de compilar, define `VITE_API_URL` con la URL pública de la API. **El valor
queda incrustado en el bundle**, así que cambiar de entorno exige recompilar.

Requisito del servidor: al ser una aplicación de página única con rutas del lado del
cliente, todas las rutas desconocidas deben responder con `index.html`. Sin esa
regla, recargar en `/admin` devuelve 404.

Revisa el resultado en local antes de publicar:

```bash
npm run preview
```

---

## Convenciones

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Componentes y páginas | `PascalCase.tsx` | `ManageCoursesPage.tsx` |
| Clientes de API | `camelCaseApi.ts` | `coursesApi.ts` |
| Funciones de API | `verboRecursoApi` | `getMyCoursesApi` |
| Utilidades y tipos | `camelCase.ts` | `coursePermissions.ts` |
| Pruebas | `*.test.tsx` junto al archivo probado | `CategoriesPage.test.tsx` |

- Commits con Conventional Commits: `feat(perfil): ...`, `fix(cursos): ...`
- Ramas: `feature/<ID>-descripcion`
- Integración a `main` solo por pull request
- Errores de la API en formato `{ "error": "...", "statusCode": 400 }`

Reglas de comportamiento que la revisión de código verifica:

1. Un fallo nunca se ignora en silencio.
2. El estado local no se modifica antes de la confirmación del servidor.
3. Un formulario con error no se cierra.
4. El 401 se maneja de forma global, nunca en una pantalla.

---

## Documentación

Índice completo en **[docs/README.md](docs/README.md)**.

| Sección | Contenido |
| --- | --- |
| [docs/00-convenciones/](docs/00-convenciones/) | Estructura, manejo de errores, estilos y tokens |
| [docs/01-setup-local/](docs/01-setup-local/) | Instalación, ejecución y variables de entorno |
| [docs/02-arquitectura/](docs/02-arquitectura/) | Enrutado, sesión, capa de API y permisos |
| [docs/03-modulos/](docs/03-modulos/) | Detalle de los ocho módulos funcionales |
| [docs/04-calidad/](docs/04-calidad/) | Pruebas, lint y build |

La documentación de la API está en la carpeta `docs/` del repositorio del backend.

---

## Solución de problemas

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `Port 5174 is already in use` | Otro servidor de Vite sigue vivo | `lsof -ti:5174 \| xargs kill` |
| La sesión se cierra al recargar | La API no responde y devuelve 401 | Verificar que el backend esté arriba |
| Error de CORS en la consola | La API no está en modo Development | En local, CORS solo se activa en Development |
| La foto de perfil no carga | `VITE_API_URL` no termina en `/api` | Corregir la variable y reiniciar |
| Las peticiones van a otro puerto | Se cambió `.env` con el servidor levantado | Reiniciar `npm run dev` |
| El build falla y `dev` funciona | Error de tipos que Vite no comprueba | Leer la salida de `tsc -b` |
| Aviso `only-export-components` | Un archivo exporta un componente y algo más | Separar en dos archivos |
| Un cambio de rol no surte efecto | El rol viaja en el JWT de la sesión abierta | Cerrar sesión y volver a entrar |
