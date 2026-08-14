# Módulo: Configuración de perfil

## Ubicación

| | |
| --- | --- |
| Componente | `src/pages/PerfilPage.tsx` |
| Estilos | `src/pages/PerfilPage.css` |
| Acceso | Entrada Configuración del menú lateral, sección `settings` |
| Roles | Los tres |

## Qué permite hacer

1. Editar nombre y apellido.
2. Editar teléfono con selector de código de país.
3. Subir una foto de perfil.
4. Cambiar la contraseña.

El correo se muestra en modo lectura. Cambiarlo afectaría a la identidad de la
cuenta y al inicio de sesión, así que no se ofrece aquí.

## Carga inicial

Al montar, la pantalla pide el perfil completo:

```tsx
const profile = await getMeApi();
updateUser(profile);
setFields((current) => ({
  ...current,
  nombre: profile.nombre,
  apellido: profile.apellido ?? '',
  telefono: formatPhoneDisplay(profile.telefono),
}));
setCountryId(findCountryIdByCode(profile.codigoPais));
```

No se rellena desde `localStorage` porque allí no están `fotoUrl`, `telefono` ni
`codigoPais`, por decisión de diseño del contexto de sesión. El detalle está en
[`../02-arquitectura/autenticacion-y-sesion.md`](../02-arquitectura/autenticacion-y-sesion.md).

## Teléfono y código de país

Se guardan en columnas separadas: `telefono` con los dígitos y `codigoPais` con el
prefijo internacional. Separarlos permite cambiar de país sin reescribir el número
y validar cada parte por su cuenta.

La lista de países está en el propio componente, en la constante `countries`, con
doce entradas y Colombia como valor por defecto.

Transformaciones aplicadas:

| Dirección | Función | Efecto |
| --- | --- | --- |
| Del servidor a la vista | `formatPhoneDisplay` | `3001234567` se muestra como `300 123 4567` |
| De la vista al servidor | `replace(/\D/g, '')` | Se envían solo dígitos |
| Del servidor al selector | `findCountryIdByCode` | `+57` selecciona Colombia |

El agrupado de tres en tres solo se aplica a números de diez dígitos, que es el
formato colombiano. Otras longitudes se muestran sin separar, para no partir mal un
número extranjero.

Si el campo de teléfono queda vacío, se envían `telefono: null` y `codigoPais: null`.
Guardar un prefijo sin número no aporta nada y dejaría datos incoherentes.

## Foto de perfil

### Selección

El `input type="file"` está oculto y lo dispara un botón con estilo propio. Al
elegir un archivo se genera una vista previa local, sin subir nada todavía:

```tsx
setPendingPhoto(photo);
setPhotoPreview(URL.createObjectURL(photo));
```

La subida se retrasa hasta el guardado por coherencia: nada cambia en el servidor
hasta que el usuario confirma el formulario.

### Subida

Ocurre dentro del envío, antes de actualizar los datos personales:

```tsx
if (pendingPhoto) {
  const uploaded = await uploadProfilePhotoApi(pendingPhoto);
  fotoUrl = uploaded.fotoUrl;
  if (user) updateUser({ ...user, fotoUrl });
  setPendingPhoto(null);
  if (photoPreview) {
    URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  }
}
```

Tras la subida se libera la URL temporal con `revokeObjectURL` y se limpia la vista
previa, de forma que el avatar pasa a leerse del servidor. Omitir esa liberación
mantendría el archivo retenido en memoria mientras viva la pestaña.

### Dónde acaba el archivo

| Capa | Qué guarda |
| --- | --- |
| Disco del servidor | El archivo, en `wwwroot/uploads/profiles/{userId}.{ext}` |
| Base de datos | Solo la ruta relativa, en `AspNetUsers.FotoUrl` |
| `localStorage` | Nada |
| Repositorio git | Nada, la carpeta está ignorada salvo el `.gitkeep` |

La imagen **no se guarda en base de datos ni en el navegador**. El nombre del
archivo es el identificador del usuario, así que cada persona tiene como máximo una
foto y el backend borra la anterior al subir una nueva, incluso si cambia la
extensión.

### Actualización del avatar de la cabecera

El avatar del menú superior en `HomePage` lee el mismo `user.fotoUrl` del contexto,
así que se actualiza en cuanto `updateUser` recibe la nueva ruta, sin recargar.

Como el nombre del archivo no cambia entre subidas, hace falta invalidar la caché
del navegador. De eso se encarga `photoVersion` combinado con `getProfilePhotoUrl`:

```tsx
const profilePhotoSrc = photoPreview ?? getProfilePhotoUrl(user?.fotoUrl, photoVersion);
```

El operador `??` da prioridad a la vista previa local mientras exista, para que la
imagen elegida se vea de inmediato.

### Validaciones del servidor

| Regla | Respuesta si falla |
| --- | --- |
| Debe haber archivo | 400 con Debes seleccionar una imagen |
| Máximo 2 MB | 400 con La imagen no puede superar 2 MB |
| Tipo declarado JPG, PNG o WEBP | 400 con Formato no permitido |
| Firma binaria coincidente con el tipo | 400 con Formato no permitido |

La última merece explicación: el `Content-Type` lo declara el cliente y se puede
falsear, así que el backend comprueba además los primeros bytes del archivo. Un
archivo de texto renombrado a `.png` se rechaza.

El `input` usa `accept="image/*"`, que solo filtra el diálogo de selección. La
validación real es la del servidor.

## Cambio de contraseña

### Validación en el cliente

| Campo | Reglas |
| --- | --- |
| Contraseña actual | Obligatoria si se está cambiando |
| Nueva contraseña | Obligatoria, mínimo 8 caracteres |
| Confirmación | Obligatoria y debe coincidir |

La sección es opcional: solo se valida y se envía si alguno de los tres campos
tiene contenido.

```tsx
const isChangingPassword = Boolean(
  fields.currentPassword || fields.newPassword || fields.confirmPassword,
);
```

### Orden de las operaciones

El cambio de contraseña se ejecuta **antes** que la foto y los datos personales:

```tsx
if (isChangingPassword) {
  await changePasswordApi({
    'contraseñaActual': fields.currentPassword,
    'nuevaContraseña': fields.newPassword,
    'confirmarContraseña': fields.confirmPassword,
  });
}
```

El motivo es la operación con más probabilidad de fallar, típicamente por escribir
mal la contraseña actual. Si va primera y falla, no se aplica ningún otro cambio y
el usuario recibe un error concreto sobre lo que salió mal. En el orden inverso,
habría que explicarle que el perfil se guardó pero la contraseña no.

Las claves del objeto llevan tilde y eñe porque así las declara el contrato del
backend. En ASCII, el servidor responde 400.

### Errores del servidor

| Código | Situación |
| --- | --- |
| 400 | La nueva contraseña no cumple la política, o la confirmación no coincide |
| 401 | La contraseña actual es incorrecta |

### Efecto sobre la sesión

La sesión actual sigue abierta: el backend no revoca los tokens ya emitidos. Las
sesiones en otros dispositivos también continúan hasta que caduque su token.

## Mensajes de resultado

| Situación | Mensaje |
| --- | --- |
| Solo datos personales o foto | Cambios guardados correctamente |
| Con cambio de contraseña | Cambios guardados y contraseña actualizada |
| Fallo en cualquier paso | El mensaje del servidor, o uno genérico de reserva |

Las confirmaciones usan `role="status"` y los errores `role="alert"`.

## Endpoints consumidos

| Acción | Endpoint |
| --- | --- |
| Leer perfil | `GET /api/auth/me` |
| Guardar datos personales | `PUT /api/auth/me` |
| Subir foto | `POST /api/auth/me/photo` |
| Cambiar contraseña | `POST /api/auth/change-password` |

El detalle de cada uno está en `docs/02-modulos-api/10-profile-settings.md` del
repositorio del backend.

## Validaciones del servidor para los datos personales

| Campo | Regla |
| --- | --- |
| `nombre` | Obligatorio, entre 3 y 100 caracteres |
| `apellido` | Obligatorio, entre 3 y 100 caracteres |
| `telefono` | Opcional, máximo 20 caracteres |
| `codigoPais` | Opcional, formato `+` seguido de 1 a 4 dígitos |

Nombre y apellido se validan también en el cliente con las mismas longitudes, para
mostrar el error junto al campo antes de enviar.
