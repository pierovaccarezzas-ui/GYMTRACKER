# PLAN-004 — Rediseño visual "Swiss Neo-Brutalist SaaS Editorial" (base clara/papel)

```yaml
plan_id: PLAN-004
slug: swiss-neobrutalist-editorial-redesign
status: passing                  # planned → approved → in_progress → in_review → passing
executor: claude-design         # diseño de interfaz (desviación dirigida por el usuario: ya NO se usa V0)
executor_fallback: codex        # si Claude Design no ejecuta, lo aplica Codex
author: Planner (Opus 4.8)
date: 2026-06-08
features_addressed: [ui-009]
supersedes_visual_of: [ui-005]   # ui-005 (PLAN-003, "brutalista crema") ya está `passing`; este plan reemplaza esa estética sin borrar su registro
scope: solo-diseno              # NO cambia lógica/estado/almacenamiento/comportamiento
```

> **Nota de roles (desviación dirigida por el usuario).** `AGENTS.md` asigna el UI a `executor:
> v0`. Por instrucción explícita del usuario **ya no se usa V0**: este plan se asigna a **Claude
> Design** y, si no puede ejecutar, **se delega a Codex**. Se documenta aquí para trazabilidad.

---

## Goal

Rediseñar **solo la interfaz** de GymTrack (sin tocar lógica ni datos) adoptando un sistema visual
**"Swiss Neo-Brutalist SaaS Editorial"** sobre **base clara/papel (crema)**, con la sensación de
producto tipo **Linear / Vercel / Raycast / Arc** mezclada con **diseño editorial y suizo**.

Pilares del estilo (del brief del usuario):
- **Neo-Brutalismo**: tipografía muy grande, alto contraste, bordes/elementos simples, claridad
  antes que decoración, **secciones numeradas** (`01 / 02 / 03`).
- **Swiss / Estilo Suizo**: grillas rígidas, mucho espacio en blanco, sans-serif limpia, jerarquía
  clara, **rótulos técnicos/científicos** (tipo `LAT / LON`, `EST. 2026`, `MONITOREO ACTIVO`).
- **Editorial**: titulares enormes, mucho aire, pocas palabras (sensación de revista premium).
- **Dashboard preview**: el producto como protagonista, limpio y de alto contraste.

Cubre la nueva feature `ui-009`. **Reemplaza la estética "brutalista crema" de PLAN-003 (`ui-005`,
que ya está `passing`)** sin borrar su registro/evidencia; las features funcionales de PLAN-003
(`ui-006` series, `ui-007` calentamiento, `ui-008` editar nombre) siguen vigentes y son
independientes de este plan.

---

## Decisiones confirmadas con el usuario
- **Paleta base**: **clara / papel (crema)**. Se mantiene el papel actual (`body` ya es `#e5d8be`;
  manifest/theme `#F1E8D5`).
- **Tipografía**: a criterio del Planner → **auto-alojada** para verse profesional y funcionar
  offline: **Inter** (grotesca, UI + titulares) + **IBM Plex Mono** (rótulos técnicos). Se **retira
  Bebas Neue** (hoy se carga por red en runtime, lo que además rompe el offline de la PWA).

---

## Context (estado actual)
- Todo el UI son **estilos inline en `src/GymTracker.jsx`**. Tokens en líneas 22–27
  (`BG="#000"` … tema **oscuro** actual, a reemplazar) y fuentes `FBB` (Bebas) / `FD` (system).
- Acentos por sesión: cada sesión define `c1`/`c2` y se pintan como **gradientes** (p. ej.
  `SessionView` líneas 283, 287; `Ring` líneas 122–124; nav indicador línea 637).
- **Carga de fuente por red** en `useEffect` (línea ~542): inyecta `<link>` a Google Fonts (Bebas).
  Rompe offline → se elimina y se sustituye por `@font-face` auto-alojado.
- `src/index.css`: reset + `body { background:#e5d8be }`. `index.html`: `theme-color` ya crema.

---

## Sistema de diseño (dirección; Claude Design afina valores finales)

### Tokens de color (papel claro)
| Token | Sugerencia | Uso |
|---|---|---|
| `PAPER` | `#E9DFC8` | Fondo base de la app. |
| `PAPER_RAISED` | `#F4EEDF` | Tarjetas/superficies elevadas. |
| `INK` | `#17150F` | Texto principal / bordes. |
| `INK_2` | `#5B554A` | Texto secundario / metadatos. |
| `HAIRLINE` | `rgba(23,21,15,.16)` | Líneas de grilla suizas (1px). |
| `RULE_BOLD` | `#17150F` | Bordes brutalistas (2px) en énfasis. |
| `ACCENT` | `#E5482F` (rojo señal editorial) | Acento único global (activos, progreso). |
| `OK` | mantener un verde discreto | Estado "completado". |

- **Reducir gradientes**: cada sesión usa su color como **bloque plano** (sin degradado). El color
  por sesión se conserva como acento de esa sesión; el acento **global** (rojo señal) se usa para
  estados activos/UI. Claude Design decide la mezcla exacta manteniendo alto contraste y AA.

### Tipografía (auto-alojada, offline)
- **Inter** (variable o pesos 400/500/700/800) → cuerpo, UI y **titulares editoriales** grandes
  (tracking ajustado, leading corto). **IBM Plex Mono** (400/500) → **rótulos técnicos** en
  mayúsculas con letter-spacing (códigos de semana, contadores `SET 02 / 04`, `EST. 2026`).
- Escala editorial: titulares muy grandes (p. ej. label de sesión ~56–72px), microcopy mono ~10–11px.

### Grilla y forma (Swiss + Neo-Brutalist)
- Grilla rígida, **márgenes generosos**, **líneas hairline** (1px `HAIRLINE`) como divisores;
  bloques **2px `RULE_BOLD`** solo para énfasis (sesión activa, botón primario). Esquinas rectas o
  radio mínimo (0–4px). Sombra dura opcional y muy sobria (Swiss tiende a plano).
- **Numeración** `01 / 02 / 03` (en mono) en: pestañas de nav, lista de sesiones de la semana,
  ejercicios dentro de una sesión, e ítems de "RECUPERACIÓN".

### Componente por componente (`src/GymTracker.jsx`)
- **Header**: masthead editorial. Wordmark `GYMTRACK` grande; sub-línea mono técnica
  (`EST. 2026 · W24 / LUN`). Stat de progreso como **numeral editorial** con rótulo mono
  (`VIGOR 72%` / `PROGRESO`).
- **Switcher de rutina** (líneas 617–624): segmentado con borde `INK`; activo = relleno ink/acento.
- **SessionView** (275–320): cabecera editorial con **bloque de color plano** (no gradiente),
  numeral `01 /` + label enorme; fila de stats en **mono** (`EJ 03/05`, `SERIES 18`, `REST 90s`).
- **ExCard** (182–272): fila tipo lista suiza con **índice numérico** (`01`), nombre editorial,
  meta en mono (`FUERZA · 4×6–8`), objetivo mono (`→ 35 KG/MANO`), divisores hairline. Iconos de
  acción minimalistas en `INK`.
- **SemanaView** (363–419) y **CarrerasView** (421–523): mismo sistema; **numerales grandes**
  (pace, %) + rótulos mono.
- **Ring** (117–132): trazo **plano de un color** (sin gradiente suave), o sustituir por
  indicador de % en mono + barra fina. Claude Design decide.

### Tamaños táctiles (se conserva de ui-005)
- **Nav inferior** (633–640): altura ~64px, labels mono numerados (`01 HOY` · `02 SEMANA` ·
  `03 CORRER`), área táctil ≥48px, respetar `env(safe-area-inset-bottom)`. Indicador activo = regla
  superior `RULE_BOLD`/`ACCENT`.
- Botón de completar (239–241): de 32 → ≥48px. Botones de acción con más alto y tipografía mayor.

---

## Affected files
| Archivo | Acción |
|---|---|
| `src/GymTracker.jsx` | **Principal (solo estilos)**: reemplazar tokens (22–27), reestilar todos los componentes, **quitar gradientes** por bloques planos, numeración `01/02/03`, rótulos mono, nav/botones grandes, y **eliminar la inyección de Google Fonts** del `useEffect` (~línea 542). **No** tocar la carga de datos ni handlers. |
| `src/index.css` | Fondo papel, `@font-face` de Inter + IBM Plex Mono auto-alojadas, `font-family` base, antialias. |
| `public/fonts/` | **Crear**: woff2 auto-alojados (Inter, IBM Plex Mono — ambas OFL). |
| `index.html` | Confirmar `theme-color` crema; opcional ajustar al `PAPER` final. |
| `vite.config.js` | Alinear `theme_color`/`background_color` del manifest al `PAPER` final (ya crema). |
| `FEATURE_LIST.json` / `PROGRESS.md` | **No tocar aquí** (Executor→`in_progress`, Reviewer→`passing`). |

> Sin nuevas **dependencias** de runtime (fuentes auto-alojadas como assets; sin librerías nuevas).

---

## Step-by-step tasks (Executor: Claude Design; fallback Codex)
1. **Baseline.** `./init.sh` debe salir 0.
2. **Fuentes.** Añadir woff2 de Inter + IBM Plex Mono a `public/fonts/`; declarar `@font-face` y
   `font-family` base en `index.css`. Quitar la inyección runtime de Bebas/Google Fonts en
   `GymTracker.jsx` (~línea 542) **sin** alterar el resto del `useEffect` (carga de datos).
3. **Tokens.** Reemplazar el bloque de tokens (líneas 22–27) por la paleta papel + tipografías.
4. **Estructura editorial/suiza.** Aplicar grilla, espacios, hairlines, numeración `01/02/03` y
   rótulos mono en header, switcher, SessionView, ExCard, SemanaView, CarrerasView.
5. **Quitar gradientes.** Sustituir `linear-gradient(...)` por bloques de color plano + ink; ajustar
   `Ring` a trazo plano o indicador mono.
6. **Tamaños táctiles.** Agrandar nav inferior (~64px, ≥48px, safe-area), botón de completar y
   botones de acción.
7. **Coherencia PWA.** Alinear `theme-color` (index.html) y `theme_color`/`background_color`
   (vite.config manifest) al `PAPER` final.
8. **Smoke local.** `npm run build` + `npm run preview`; revisar en viewport de móvil.
9. **Cierre de Executor.** `FEATURE_LIST.json` `ui-009` → `in_progress`; registrar sesión en
   `PROGRESS.md`; commit referenciando `PLAN-004`.

---

## Acceptance criteria
- La app presenta de forma **consistente** (Hoy / Semana / Correr) el sistema **Swiss
  Neo-Brutalist editorial** sobre **papel claro**: titulares grandes, alto contraste, grilla con
  hairlines, mucho espacio en blanco, **secciones numeradas `01/02/03`** y **rótulos técnicos en
  monospace**.
- **Sin gradientes** de sesión (bloques de color planos) y con un **acento global** único.
- **Tipografías auto-alojadas** activas; **no** hay petición de red a Google Fonts (verificable en
  Network) → la estética se mantiene **offline**.
- **Nav inferior** y botones principales con área táctil ≥48px, cómodos en móvil.
- **Sin cambios de comportamiento**: navegación, marcado, edición, almacenamiento y datos funcionan
  exactamente igual que antes (este plan es solo visual).
- `theme-color`/manifest coherentes con el papel.
- `./init.sh` y `npm run build` salen 0; `dist/index.html` renderiza sin errores en consola.
- `ui-009` NO se marca `passing` hasta verificación del Reviewer (Antigravity).

## Verification commands
```bash
./init.sh                      # exit 0
npm run build                  # genera dist/index.html
npm run preview                # abrir en viewport móvil (DevTools responsive)
# 1) Estilo editorial/suizo consistente; numeración 01/02/03; rótulos mono; sin gradientes.
# 2) Network: sin requests a fonts.googleapis.com (fuentes auto-alojadas) → estética offline.
# 3) Nav inferior y botones grandes (≥48px) cómodos en móvil.
# 4) Regresión: marcar/editar/añadir/borrar y cambiar de pestaña/rutina funcionan igual.
```

---

## Risks / notes
- **Desviación de roles**: UI normalmente es V0; por decisión del usuario va a **Claude Design**
  (fallback **Codex**). Registrado en el yaml y en `PROGRESS.md`.
- **Supersesión**: este plan reemplaza la dirección visual de **PLAN-003 (`ui-005`)**. Las features
  funcionales de PLAN-003 (`ui-006/007/008`) **no** se ven afectadas; al integrarlas, deben heredar
  este sistema visual (categoría "Calentamiento" necesita su token de color en la nueva paleta;
  la vista de series y el campo "Nombre" deben seguir el estilo editorial).
- **Solo diseño**: si el executor detecta que un cambio visual exige tocar lógica, debe **parar** y
  devolver al Planner (no ampliar scope), salvo el retiro de la carga de fuente por red (explícito).
- **Fuentes**: usar woff2 OFL (Inter, IBM Plex Mono); subset latino para minimizar peso del bundle PWA.
- **Accesibilidad**: validar contraste AA del papel con `INK`/`ACCENT` y que la tipografía grande no
  rompa el layout `maxWidth:480`.
