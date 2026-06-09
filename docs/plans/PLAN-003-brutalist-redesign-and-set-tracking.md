# PLAN-003 — Rediseño brutalista (crema) + botones grandes + categoría Calentamiento + marcado por series + editar nombre

```yaml
plan_id: PLAN-003
slug: brutalist-redesign-and-set-tracking
status: planned            # planned → approved → in_progress → in_review → passing
executor: v0               # diseño de interfaz → V0 (todo el look & feel)
executor_secondary: codex  # SOLO el modelo de datos del marcado por series (state/storage)
author: Planner (Opus 4.8)
date: 2026-06-08
features_addressed: [ui-005, ui-006, ui-007, ui-008]
depends_on: [PLAN-002]     # recomendado ejecutar después: nombre/edición usan `sessionExercises.overrides`
```

---

## Goal

Mejorar la interfaz de GymTrack con **5 cambios**:

1. **Estética brutalista en color crema**: fondo crema, alto contraste, bordes negros gruesos,
   sombras duras (sin blur), esquinas rectas, tipografía condensada/bold. (`ui-005`)
2. **Botones más grandes** y táctiles, especialmente la **barra de navegación inferior**
   (hoy demasiado pequeña en móvil). Objetivo de accesibilidad: área táctil ≥ 48 px. (`ui-005`)
3. **Categoría "Calentamiento"** al crear/editar un ejercicio, además de Fuerza, Cardio y Plyo. (`ui-007`)
4. **Marcado serie por serie** en ejercicios de fuerza: al tocar el ejercicio se abre una interfaz
   donde se marca cada serie individualmente (no las 4 de golpe). (`ui-006`)
5. **Editar el nombre** del ejercicio, sumándolo a los campos ya editables (sets/reps/objetivo). (`ui-008`)

Todo el **diseño de interfaz lo ejecuta V0**. El único trozo de **lógica** (modelo de datos del
marcado por series + migración) queda delimitado para **Codex** (ver carril Codex abajo).

---

## Context (estado actual del código)

Todo el UI vive como **estilos inline dentro de `src/GymTracker.jsx`** (no hay CSS de
componentes en `App.css`/`index.css` relevantes). Referencias clave:

- **Design tokens** (líneas 22–27): `BG="#000"`, `C1/C2/C3`, `BR`, `TX/TX2/MU`, `GN`, fuentes
  `FBB` (Bebas Neue) y `FD` (system-ui). Tema **oscuro** actual → a reemplazar por **crema**.
- **Categorías de ejercicio**: `T_CLR` y `T_LBL` (líneas 92–93) definen color/label por tipo
  (`strength/cardio/plyo`). El selector está en `AddExForm` (líneas 152–157) con el array
  `["strength","cardio","plyo"]`.
- **Edición de ejercicio**: `ExCard` (líneas 182–272). El form de edición (líneas 244–267)
  permite editar **sets/reps/target**, **pero NO el nombre**. El nombre se muestra en línea 217.
- **Marcado de completado**: estado `done = { [exId]: bool }` (línea 529); `toggle` (línea 568)
  invierte el booleano; el botón circular de check está en `ExCard` (líneas 239–241, 32 px).
  `sessProgress` (líneas 106–114) cuenta ejercicios hechos. **No hay concepto de series
  individuales.** Cada `ExCard` solo dibuja puntos decorativos (líneas 227–231).
- **Navegación inferior**: `<nav>` (líneas 633–640) con padding `"13px 0 11px"` y texto 11 px
  (**pequeña**). El switcher de rutina (líneas 617–624) y el botón de check también son chicos.
- **Persistencia**: helper `store` (líneas 4–14), claves `done/custom/addedEx/deletedEx/runs/
  routine/week`. (PLAN-002 propone unificar en `sessionExercises`.)

> **Dependencia con PLAN-002.** La edición de nombre (`ui-008`) se guarda como un override más;
> si PLAN-002 ya está aplicado, va en `sessionExercises.overrides[id].name`; si no, en
> `custom[id].name`. El marcado por series introduce su **propia clave** (ver Codex). Se
> **recomienda ejecutar PLAN-003 después de PLAN-002**.

---

## Carril V0 — Diseño de interfaz (todo el look & feel)

### A. Rediseño brutalista crema (`ui-005`)
- Reemplazar los tokens de color (líneas 22–27) por una **paleta crema brutalista**. Dirección
  sugerida (V0 decide los valores finales): fondo crema `#EDE6D6`/`#F2ECDD`; tinta casi-negra
  `#16140F`; acentos saturados planos; **bordes** `2–3px solid #16140F`; **sombras duras**
  `box-shadow: 4px 4px 0 #16140F` (sin blur); `border-radius` 0–4 px; tipografía bold/condensada.
- Aplicar consistentemente a: header + rings, tarjetas de sesión (`SessionView`), `ExCard`,
  `AddExForm`, `SemanaView`, `CarrerasView`, nav inferior, switcher de rutina, estados de
  hover/active. Mantener legibilidad y contraste AA.
- Los **rings de progreso** (`Ring`, líneas 117–132) deben encajar en el estilo (trazos sólidos,
  sin gradientes suaves si rompen la estética; V0 decide).

### B. Botones más grandes / táctiles (`ui-005`)
- **Nav inferior** (líneas 633–640): subir altura a ~64 px, íconos/labels mayores, área táctil
  ≥ 48 px por pestaña; respetar `env(safe-area-inset-bottom)` en móvil.
- Botón circular de completar (líneas 239–241): de 32 → ~44–48 px.
- Switcher de rutina y botones de acción (Agregar/Guardar/Cancelar) con más alto y tipografía
  mayor. Verificar que todos los *tap targets* sean cómodos en pantalla de teléfono.

### C. Categoría "Calentamiento" en el form (`ui-007` — parte UI)
- Añadir `"warmup"` al selector de tipo en `AddExForm` (línea 152) y, cuando se implemente el
  carril edición, también al editar. Añadir su token visual a `T_CLR`/`T_LBL` (p. ej.
  label "Calentamiento", color cálido propio). Mantener la regla "sin sets" si V0/usuario lo
  desea como cardio-like, o permitir sets (decidir; por defecto permitir sets como Fuerza).

### D. Editar nombre del ejercicio (`ui-008` — UI del form)
- Añadir un campo **"Nombre"** al form de edición de `ExCard` (líneas 244–267), inicializado con
  el nombre efectivo. Al guardar, propagar el nuevo nombre por el handler de override (ver Codex/
  PLAN-002). Mostrar indicador "editado" como ya ocurre (línea 224).

### E. Interfaz de marcado por series (`ui-006` — UI)
- Al tocar un `ExCard` de tipo con series (Fuerza/Calentamiento con `sets`), abrir una **vista
  enfocada de series** (modal o pantalla a página completa) que muestre **N filas/checkboxes**
  (una por serie) con número de serie, y permita marcar/desmarcar **una a una**. Botón de cierre/
  "Listo". Debe verse el progreso (p. ej. 2/4) y reflejarse en el ring de la sesión.
- Para ejercicios sin series (Cardio, `anyOne`), mantener el toggle simple actual.
- El componente consume el estado/handlers que provee Codel (carril Codex), no inventa storage.

---

## Carril Codex — Modelo de datos del marcado por series (`ui-006` — lógica)

> Este es el único trozo no-visual. Es **state management + storage** → Codex. V0 construye la
> UI (E) sobre estos handlers.

- **Nuevo estado/persistencia**: introducir `setProgress = { [exId]: number }` (series
  completadas) con clave de store `"setProgress"`. El total de series de un ejercicio sale de su
  definición efectiva (`sets`).
- **Derivación de "done"**: un ejercicio cuenta como completado cuando
  `setProgress[exId] >= sets` (para Fuerza/Calentamiento). Para Cardio/`anyOne` (sin `sets`),
  `done` equivale a `setProgress>=1`. Adaptar `sessProgress` (líneas 106–114) y los cálculos de
  `activeIds/doneEx/wPct` (líneas 583–588) para derivar de `setProgress`.
- **Handlers**: `setSetDone(exId, n)` / `toggleSet(exId, index)` que escriben `"setProgress"`
  (reemplazando o envolviendo el `toggle` actual de la línea 568). `addEx` debe inicializar
  `setProgress[exId]=0`.
- **Migración** (retrocompat): al cargar, si existe `done` legacy y no `setProgress`, convertir:
  `done[exId]===true → setProgress[exId] = sets (o 1 si sin sets)`, `false → 0`. No borrar `done`
  legacy (solo-lectura) para diagnóstico.
- **Reset semanal**: el chequeo de `isoWeek()` (líneas 545–550) que hoy resetea `done` debe
  resetear `setProgress` a `{}`/ceros al cambiar de semana.
- **Nombre editable**: exponer que el override acepte `name` (ya soportado por el diseño de
  `sessionExercises.overrides` en PLAN-002; si PLAN-002 no está, extender `saveCustom` para
  aceptar `name`). V0 solo añade el input; Codex garantiza la persistencia.

---

## Affected files

| Archivo | Acción |
|---|---|
| `src/GymTracker.jsx` | **Principal**. Tokens crema + estilos brutalistas (todo el archivo), nav/botones grandes, `warmup` en `T_CLR`/`T_LBL`/`AddExForm`, campo nombre en `ExCard`, nueva vista de series, y (Codex) estado `setProgress` + migración + derivaciones. |
| `index.html` | Ajustar `<meta name="theme-color">` al nuevo crema (coherencia con la PWA de PLAN-001). |
| `src/index.css` / `src/App.css` | Solo si V0 mueve algún estilo global (fondo crema, safe-area). Opcional. |
| `FEATURE_LIST.json` / `PROGRESS.md` | **No tocar aquí** (Executor→`in_progress`, Reviewer→`passing`). |

> Sin nuevas dependencias salvo que V0 justifique una (evitar para mantener el bundle PWA ligero).

---

## Step-by-step tasks

**Orden recomendado:** primero el carril Codex (modelo de series), luego V0 construye la UI encima.

1. **Baseline.** `./init.sh` debe salir 0. (Recomendado: PLAN-002 ya aplicado.)
2. **(Codex)** Implementar `setProgress` + handlers + migración + reset semanal + derivaciones
   (`sessProgress`, `activeIds/wPct`). Exponer override de `name`.
3. **(V0-A)** Reemplazar tokens por la paleta **crema brutalista** y reestilar todos los
   componentes con bordes negros, sombras duras y esquinas rectas.
4. **(V0-B)** Agrandar **nav inferior** (~64 px, ≥48 px táctil, safe-area), botón de completar
   (~44–48 px), switcher de rutina y botones de acción.
5. **(V0-C)** Añadir **"Calentamiento"** (`warmup`) a `T_CLR`/`T_LBL` y al selector de
   `AddExForm` (y al de edición).
6. **(V0-D)** Añadir campo **"Nombre"** al form de edición de `ExCard`; guardar vía el override.
7. **(V0-E)** Construir la **vista de marcado por series**: abrir al tocar el ejercicio, marcar
   serie por serie, mostrar progreso, conectar a los handlers de Codex.
8. **Smoke local.** `npm run build` + abrir `dist/index.html`; recorrer los 5 cambios.
9. **Cierre de Executor.** `FEATURE_LIST.json` `ui-005..ui-008` → `in_progress`; registrar
   sesión en `PROGRESS.md`; commit referenciando `PLAN-003`.

---

## Acceptance criteria

- **ui-005**: La app se ve en estilo brutalista crema (fondo crema, bordes negros gruesos,
  sombras duras, alto contraste) de forma consistente en Hoy/Semana/Correr. La **nav inferior**
  y los botones principales tienen área táctil ≥ 48 px y se usan cómodamente en móvil.
- **ui-007**: Al crear (y editar) un ejercicio aparece la categoría **Calentamiento** junto a
  Fuerza/Cardio/Plyo, con su color/label, y se guarda correctamente.
- **ui-008**: El form de edición permite cambiar el **nombre**; tras recargar, el nuevo nombre
  persiste y se marca como "editado".
- **ui-006**: Tocar un ejercicio de fuerza abre la **vista de series**; se puede marcar/desmarcar
  **cada serie individualmente**; el ejercicio queda completo solo al marcar todas las series;
  el progreso por serie **persiste** tras recargar y los rings/porcentajes reflejan el avance
  parcial. Cardio/`anyOne` conservan el toggle simple.
- **Migración**: con `done` previo, al abrir la app el estado de completado se conserva
  (true→todas las series, false→cero) sin pérdida.
- `./init.sh` y `npm run build` salen 0; `dist/index.html` renderiza sin errores en consola.
- Ninguna feature se marca `passing` hasta verificación del Reviewer (Antigravity).

## Verification commands

```bash
./init.sh                      # exit 0
npm run build                  # genera dist/index.html
open dist/index.html           # smoke manual:
# 1) Estética crema brutalista consistente; nav inferior grande y cómoda en móvil (DevTools responsive).
# 2) Crear ejercicio → categoría "Calentamiento" disponible y guardable.
# 3) Editar ejercicio → cambiar nombre → recargar → persiste.
# 4) Tocar ejercicio de fuerza → marcar serie por serie → recargar → progreso parcial persiste.
# 5) (Migración) Con done previo en localStorage, abrir y verificar completado conservado.
```

---

## Risks / notes

- **Cruce de roles (V0/Codex)**: el marcado por series es **lógica** (state/storage), no diseño;
  por eso se delimita un carril **Codex** dentro de un plan mayormente **V0**. Si se prefiere
  respeto estricto de "una feature por agente", separar `ui-006`-lógica en un PLAN aparte de
  Codex y dejar PLAN-003 solo-V0. Decisión del usuario.
- **Dependencia de PLAN-002**: el guardado de nombre encaja en `sessionExercises.overrides`. Si
  PLAN-003 se ejecuta antes que PLAN-002, usar `custom[id].name` y migrar luego.
- **PWA/tema**: actualizar `theme-color` (index.html) y `background_color` del manifest (PLAN-001)
  al crema para coherencia de la PWA instalada.
- **Accesibilidad**: verificar contraste AA del crema con la tinta y que los nuevos tap targets
  no rompan el layout `maxWidth:480`.
- **Sin nuevas dependencias** preferentemente (sin librería de modal/drag); el modal de series
  puede ser un overlay propio para no engordar el bundle.
