# Lint y build

## Verificación completa

Antes de subir cambios, los tres comandos deben pasar:

```bash
npm run lint     # sin salida significa sin avisos
npm run test     # la suite completa en verde
npm run build    # tipos correctos y bundle generado
```

## Lint con oxlint

```bash
npm run lint
```

oxlint no imprime nada cuando no encuentra problemas.

### Configuración

`.oxlintrc.json`:

```json
{
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

### `react/rules-of-hooks`

Marcada como error. Detecta hooks llamados de forma condicional o dentro de bucles,
que rompen el orden en que React los asocia al componente.

Esta regla explica un patrón que aparece en el código: los hooks se ejecutan siempre
y la condición se pasa como parámetro. Por ejemplo `useCategories(enabled)` recibe un
indicador en lugar de envolverse en un `if`.

### `react/only-export-components`

Marcada como aviso. Salta cuando un archivo exporta un componente junto con otros
valores, lo que impide a Vite aplicar la sustitución en caliente sobre ese módulo.

Es la razón de que el contexto de autenticación esté repartido en tres archivos:

| Archivo | Exporta |
| --- | --- |
| `context/authContext.ts` | El contexto y sus tipos |
| `context/AuthContext.tsx` | Solo el componente `AuthProvider` |
| `context/useAuth.ts` | Solo el hook |

Si se juntan, aparece el aviso y se pierde la recarga en caliente del proveedor, lo
que en la práctica obliga a recargar la página en cada cambio.

## Verificación de tipos

Va incluida en el build:

```json
"build": "tsc -b && vite build"
```

`tsc -b` compila los proyectos referenciados y **para el build si hay un error de
tipos**. Vite por su cuenta transpila sin comprobar tipos, así que este paso es la
única red de seguridad frente a errores de tipado.

Para comprobar tipos sin generar el bundle:

```bash
npx tsc -b --noEmit
```

### Los tres tsconfig

| Archivo | Alcance |
| --- | --- |
| `tsconfig.json` | Raíz con las referencias a los otros dos |
| `tsconfig.app.json` | El código de `src/` |
| `tsconfig.node.json` | Los archivos de configuración, como `vite.config.ts` |

La separación existe porque el código de la aplicación corre en el navegador y la
configuración en Node: cada uno necesita su propio conjunto de tipos globales.

## Build de producción

```bash
npm run build
```

Salida en `dist/`. Referencia del tamaño actual:

| Recurso | Tamaño | Comprimido |
| --- | --- | --- |
| JavaScript | unos 396 kB | unos 116 kB |
| CSS | unos 86 kB | unos 20 kB |

Todo el JavaScript va en un único paquete. Con el tamaño actual es aceptable; si
crece de forma apreciable, el primer paso es dividir por rutas con importaciones
dinámicas.

### Revisar el build

```bash
npm run preview
```

Sirve el contenido de `dist/`. Conviene hacerlo antes de desplegar: el build de
producción no es idéntico al modo de desarrollo, sobre todo en el orden de los
estilos y en el tratamiento de los recursos.

### Las variables quedan incrustadas

`VITE_API_URL` se resuelve en tiempo de compilación, no en ejecución. **Cambiar de
entorno exige recompilar.** Un build hecho apuntando a la API local seguirá
apuntando allí aunque se despliegue en otro sitio.

## Antes de abrir un pull request

| Comprobación | Comando |
| --- | --- |
| Sin avisos de lint | `npm run lint` |
| Pruebas en verde | `npm run test` |
| Tipos y build correctos | `npm run build` |
| Sin `console.log` de depuración | Revisión del diff |
| Sin secretos en `.env.example` | Revisión del diff |
| Documentación al día si cambió el comportamiento | Revisión del diff |

## Problemas frecuentes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| El build falla y `npm run dev` funciona | Error de tipos que Vite no comprueba | Leer la salida de `tsc -b` |
| Aviso `only-export-components` | Un archivo exporta un componente y algo más | Separar en dos archivos |
| Las pruebas pasan en local y fallan en CI | Dependencia del orden o de estado sin limpiar | Verificar `beforeEach` y `cleanup` |
| El bundle crece de golpe | Se importó una biblioteca pesada completa | Importar solo lo necesario |
