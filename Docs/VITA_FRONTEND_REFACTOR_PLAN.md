# Plan de refactorización para VITA Frontend

## 1. Objetivo

Organizar la arquitectura frontend para que el proyecto sea escalable, consistente y preparado para migrar de CSS clásico a Tailwind CSS de forma correcta, sin mezclar patrones, sin estilos duplicados y sin dependencias de CSS por página de forma arbitraria.

---

## 2. Diagnóstico actual del proyecto

### 2.1. Estructura actual y patrón observado

El proyecto tiene una estructura relativamente clara:

- `src/pages/`: páginas de la app
- `src/routes/`: enrutado
- `src/context/`: estado global (auth)
- `src/api/`: consumo HTTP
- `src/components/`: algunos componentes reutilizables

Sin embargo, la organización visual no está alineada con una arquitectura moderna:

1. Cada página importa su propio archivo CSS.
2. Hay nombres inconsistentes entre archivos y exports (`loginPage.tsx` vs `LoginPage.tsx`, `registerPage.tsx` vs `RegisterPage.css`).
3. Hay estilos globales mezclados con estilos específicos de pantalla, y esto dificulta mantener design tokens y reutilización.
4. El proyecto ya tiene Tailwind instalado (`@tailwindcss/vite` + `tailwindcss`), pero la base del proyecto todavía está orientada a CSS tradicional.
5. Existen estilos residuales y archivos sin continuidad clara en el flujo visual.

### 2.2. Problemas concretos detectados

#### a) Importación de estilos por página

Ejemplos actuales:

- `LoginPage.tsx` importa `./LoginPage.css`
- `RegisterPage.tsx` importa `./RegisterPage.css`
- `LandingPage.tsx` importa `./LandingPage.css`
- `HomePage.tsx` importa `./HomePage.css`

Esto genera dos problemas:

- Se mezclan estilos globales, componentes reutilizables y reglas muy específicas en archivos separados.
- La lógica visual queda ligada a cada página y no a un sistema de diseño compartido.

#### b) Nombres de archivos inconsistentes

Se observa una mezcla entre:

- `loginPage.tsx` y `LoginPage.tsx`
- `registerPage.tsx` y `RegisterPage.css`
- `LandingPage.tsx` y `LandingPage.css`

Esto no es solo un detalle de estilo; en sistemas Linux/macOS puede causar problemas de importación y conflictos de case-sensitivity.

#### c) CSS no basado en tokens

Los colores y tamaños están repetidos y no se gestionan de forma centralizada. El proyecto ya define un sistema de variables en algunos archivos CSS, pero no existe un único source of truth para:

- colores
- espaciados
- radios
- sombras
- tipografías
- breakpoints

#### d) Tailwind no está siendo usado como sistema principal

El proyecto incluye Tailwind v4, lo cual es muy bueno, pero aun así el diseño se ha concentrado en CSS manual. La migración ideal es:

- usar Tailwind como motor principal de diseño
- mantener CSS solo para tokens globales, resets y utilidades muy específicas
- eliminar las reglas de estilo repetidas por página

---

## 3. Arquitectura correcta recomendada

### 3.1. Principio base

La organización correcta para un proyecto React + Vite + Tailwind debería incorporar estas reglas:

1. Las páginas solo deben orquestar contenido y layout.
2. Los estilos compartidos deben vivir en un sistema de tokens y utilidades.
3. Los componentes reutilizables deben recibir clases Tailwind y opcionalmente, estilos mínimos muy específicos.
4. Evitar archivos CSS por página cuando el diseño ya se puede resolver con utility classes.
5. Mantener los archivos de estilo globales muy pequeños y muy claros.

### 3.2. Estructura recomendada

```text
src/
  app/
    routes/
    providers/
  components/
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
    layout/
      Navbar.tsx
      Sidebar.tsx
  features/
    auth/
      components/
      hooks/
      services/
    landing/
    home/
  pages/
    LoginPage.tsx
    RegisterPage.tsx
    LandingPage.tsx
    HomePage.tsx
  styles/
    globals.css
    tokens.css
    utilities.css
  lib/
    cn.ts
    formatters.ts
  hooks/
  api/
  context/
```

### 3.3. Cómo usar Tailwind de manera correcta

#### Recomendación para Tailwind v4

En `src/index.css` o `src/styles/globals.css` se debe tener algo como:

```css
@import "tailwindcss";

@theme {
  --color-brand-500: #10b981;
  --color-surface-900: #0f172a;
  --color-surface-800: #1e293b;
  --color-text-100: #f8fafc;
  --color-text-400: #94a3b8;
}

@layer base {
  body {
    @apply bg-slate-900 text-slate-100 antialiased;
  }
}
```

Esto permite:

- centralizar tokens visuales
- mantener CSS global mínimo
- reducir la necesidad de reglas de estilo pequeñas por página

#### Recomendación para UI

Los componentes UI se deben construir así:

```tsx
<Button className="rounded-xl bg-emerald-500 px-4 py-2 text-slate-900 font-semibold" />
<Input className="h-11 w-full rounded-xl border border-slate-600 bg-slate-800/60 pl-11 text-slate-100" />
```

Esto evita duplicar archivos CSS por cada pantalla.

---

## 4. Discrepancias de estilo y conexiones actuales

### 4.1. Discrepancia: CSS por página vs sistema global

Actualmente el proyecto sigue esta lógica:

- cada pantalla tiene su propio CSS
- las páginas definen tanto layout como colores como componentes visuales
- no existe una capa base que defina tokens visuales globales

Esto hace que la UI se vuelva difícil de mantener y que haya estilos reescritos sin reglas claras.

### 4.2. Discrepancia: imports con nombres inconsistentes

El código importa algunos módulos con mayúsculas y otros con minúsculas, lo que genera un riesgo real de incompatibilidad y confusión.

Ejemplo:

- `import { LoginPage } from '../pages/loginPage';`
- `import { RegisterPage } from '../pages/registerPage';`

Esto debería unificarse a:

- `../pages/LoginPage`
- `../pages/RegisterPage`

### 4.3. Discrepancia: estilos CSS mezclados con lógica de componente

El style de cada página no solo cambia layout, sino también aspectos visuales de diseño base. En Tailwind la idea es:

- la lógica de UI se resuelve en JSX
- los estilos específicos complejos (animaciones, pseudo-elementos, sombras irregulares) se dejan solo en CSS mínimo

### 4.4. Discrepancia: Tailwind no está como capa principal

El proyecto ya usa Tailwind, pero la implementación no está siendo explotada como sistema principal. El paso correcto es migrar de:

- `CSS manual por pantalla`

A:

- `componentes con clases Tailwind`
- `tokens centralizados`
- `CSS global solo para reset y ajustes base`

---

## 5. Plan de refactorización propuesto

### Fase 1: Normalizar estructura y nombres

#### Objetivo
Estabilizar la base para evitar errores de importación y confusión.

#### Acciones

1. Renombrar archivos de páginas para unificar PascalCase.
   - `loginPage.tsx` → `LoginPage.tsx`
   - `registerPage.tsx` → `RegisterPage.tsx`
2. Corregir imports en `AppRouter.tsx`.
3. Revisar si existen imports con nombres inconsistentes en otros archivos.
4. Eliminar archivos CSS o componentes huérfanos que ya no se usen.

#### Resultado esperado

- estructura consistente
- imports seguros en ambientes case-sensitive
- menor riesgo de errores de runtime

### Fase 2: Definir sistema de design tokens

#### Objetivo
Centralizar el estilo visual del proyecto.

#### Acciones

1. Crear `src/styles/tokens.css` o un bloque `@theme` en `globals.css`.
2. Definir:
   - colors
   - spacing
   - radius
   - shadows
   - font sizes
   - breakpoints
3. Reutilizar estas tokens en toda la UI.

#### Resultado esperado

- mismo lenguaje visual en login, register, home y landing
- menos duplicación
- estilo uniforme entre pantallas

### Fase 3: Establecer la base global con Tailwind

#### Objetivo
Eliminar el CSS base manual y dejar el foco en Tailwind.

#### Acciones

1. Asegurar `@import "tailwindcss";` en el CSS global.
2. Crear una capa base mínima con resets y tipografías.
3. Dejar solo reglas de utilidad muy específica fuera de Tailwind.
4. Definir clases reutilizables como `btn-primary`, `input-base` solo si son verdaderamente compartidas.

#### Resultado esperado

- menos CSS escrito manualmente
- mejor consistencia visual
- mejor mantenibilidad

### Fase 4: Migrate pages to utility-first classes

#### Objetivo
Las páginas deben verse con Tailwind puro, no con CSS file-per-page.

#### Acciones

1. Convertir `LandingPage.tsx` a clases Tailwind.
2. Convertir `LoginPage.tsx` a clases Tailwind.
3. Convertir `RegisterPage.tsx` a clases Tailwind.
4. Convertir `HomePage.tsx` a clases Tailwind.
5. Mantener solo un CSS mínimo para animaciones o comportamientos complejos.

#### Resultado esperado

- las páginas quedan más legibles
- UI más consistente
- menos duplicación visual

### Fase 5: Consolidar componentes reutilizables

#### Objetivo
Extraer elementos repetidos en componentes reutilizables.

#### Acciones

1. Crear `Button`, `Input`, `Card`, `Badge`.
2. Usar props y clases compartidas.
3. Extraer patrones repetidos desde login y register.

#### Resultado esperado

- menos código duplicado
- mejor escalabilidad
- diseño uniforme en toda la app

### Fase 6: Limpieza final del proyecto

#### Objetivo
Dejar la arquitectura limpia y preparada para crecer.

#### Acciones

1. Eliminar estilos restos huérfanos.
2. Revisar imports no utilizados.
3. Finalizar normalización de nombres y estructura.
4. Documentar convenciones de diseño para nuevos componentes.

---

## 6. Recomendación de migración para VITA

La estrategia más segura es:

1. primero corregir nombres y estructura,
2. luego crear tokens y base global,
3. luego migrar páginas poco a poco a Tailwind,
4. y solo después eliminar archivos CSS viejos.

Esto evitará romper la UI y permitirá hacer la migración por etapas sin grandes riesgos.

---

## 7. Criterios de éxito

Se considerará una refactorización exitosa cuando:

- todas las páginas sigan una convención de nombres consistente,
- no haya estilos redundantes por pantalla,
- Tailwind sea el sistema principal de UI,
- exista una capa única de tokens visuales,
- cualquier nueva pantalla pueda construirse con un patrón consistente,
- el proyecto sea mantenible para crecimiento de equipo y features.

---

## 8. Recomendación final

La combinación correcta para este proyecto no es seguir con CSS clásico por página, sino:

- Tailwind como base de diseño,
- CSS mínimo global para tokens y reset,
- componentes reutilizables con clases compartidas,
- una estructura limpia por `features`, `components`, `pages`, `styles`.

Esto le dará a VITA una arquitectura mucho más profesional, más rápida de mantener y más preparada para escalar.
