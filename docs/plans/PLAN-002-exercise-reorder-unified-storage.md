# PLAN-002 — Reordenamiento de ejercicios + guardado unificado en `sessionExercises`

```yaml
plan_id: PLAN-002
slug: exercise-reorder-unified-storage
status: passing            # Reviewer (Antigravity) verified 2026-06-08
executor: codex            # state management + storage refactor + reorder logic (no UI redesign)
author: Planner (Opus 4.8)
date: 2026-06-08
features_addressed: [ui-001]
design_source: Planner (Opus 4.8) — no se encontró artefacto previo de Antigravity en el repo;
               esquema diseñado desde el código actual y validado contra GymTracker.jsx.
```

---

## Goal

Permitir **reordenar** los ejercicios dentro de una sesión (subir/bajar) y **persistir** ese
orden, consolidando además el estado fragmentado actual (`custom`, `addedEx`, `deletedEx` +
orden implícito) en **una única estructura por sesión: `sessionExercises`**. El resultado debe
ser equivalente en comportamiento al actual (editar/añadir/borrar siguen funcionando), pero con
orden persistente y un modelo de datos único y mantenible. Cierra `ui-001`.

---

## Context

Hoy `src/GymTracker.jsx` mantiene el estado de ejercicios en **4 piezas independientes**, cada
una con su propia clave de almacenamiento (vía el helper `store` en líneas 4–14):

| Estado | Clave store | Forma | Rol |
|---|---|---|---|
| `custom` | `"custom"` | `{ [exId]: {sets,reps,target} }` | Overrides de ejercicios base. |
| `addedEx` | `"addedEx"` | `{ [sessionId]: [exObj,…] }` | Ejercicios añadidos por el usuario. |
| `deletedEx` | `"deletedEx"` | `[exId,…]` | Tombstones globales de borrado. |
| (orden) | — | implícito | `session.exercises` (base) y luego `addedEx`; **no editable**. |

El render ocurre en `SessionView` (líneas 275–320): `visDefault` = base − borrados, `visAdded` =
añadidos − borrados. No hay forma de cambiar el orden. Los ejercicios base viven hardcodeados en
`MAIN`/`MANT` (líneas 30–87), por lo que **el esquema no debe duplicar las definiciones base**
(para que futuras ediciones del código sigan propagándose), solo referenciarlas por `id` y
guardar overrides/orden/tombstones.

`done` (progreso semanal por `exId`), `runs`, `routine` y `week` quedan **fuera de scope**: son
ortogonales y se siguen guardando como hoy.

---

## Diseño: estructura unificada `sessionExercises`

Una sola clave de store `"sessionExercises"`, mapa por `sessionId`:

```js
sessionExercises = {
  [sessionId]: {
    order:    ["ua1", "ua3", "cx-1717...", "ua2"],   // orden visible (base + añadidos)
    overrides:{ "ua3": { sets:5, reps:"5", target:"40 kg" } },  // reemplaza `custom`
    added:    { "cx-1717...": { name, type, sets, reps, target } }, // reemplaza `addedEx`
    deleted:  ["ua4"]                                 // tombstones (reemplaza `deletedEx`)
  },
  // …una entrada por cada sesión tocada por el usuario
}
```

**Reglas de resolución (en un helper puro, p. ej. `resolveSession(session, se)`):**
1. Partir del `order` guardado para la sesión (si no existe, `order = [...base ids, ...added ids]`).
2. **Reconciliar con el código** (clave para que actualizaciones de `MAIN`/`MANT` no se pierdan):
   - Añadir al final de `order` cualquier `id` base presente en `session.exercises` que **no**
     esté en `order` y **no** esté en `deleted` (ejercicios nuevos introducidos por código).
   - Añadir cualquier `id` de `added` que no esté en `order`.
   - Filtrar de `order` los `id` que ya no resuelven (base eliminado del código y no está en `added`).
3. Excluir del render los `id` presentes en `deleted`.
4. Para cada `id` visible, construir el ejercicio efectivo: base (`session.exercises`) **o**
   `added[id]`, fusionado con `overrides[id]`.

Esto unifica **orden + overrides + añadidos + borrados** en una estructura por sesión, sin
snapshot de las definiciones base.

**Migración (retrocompatibilidad).** En la carga, si `"sessionExercises"` no existe pero hay
claves legacy (`custom`/`addedEx`/`deletedEx`), construir `sessionExercises` una vez:
- `order` por sesión = ids base (en orden de `session.exercises`) seguidos de los ids de `addedEx[sessionId]`.
- `overrides` = `custom` filtrado a los ids de esa sesión.
- `added` = `addedEx[sessionId]` convertido a `{ [id]: obj }`.
- `deleted` = `deletedEx` filtrado a ids de esa sesión.
Persistir el resultado en `"sessionExercises"` y dejar de escribir las claves legacy (se pueden
conservar como solo-lectura para no romper datos viejos; no se borran).

---

## Affected files

| Archivo | Acción |
|---|---|
| `src/GymTracker.jsx` | **Refactor central**: nuevo estado `sessionExercises`, helpers de resolución/migración, handlers `move/add/delete/override`, y wiring en `SessionView`/`ExCard`/`SemanaView`/`sessProgress`. |
| `init.sh` | **Sin cambios** (sigue siendo la ruta de verificación). |
| `FEATURE_LIST.json` / `PROGRESS.md` | **No tocar aquí** (Executor→`in_progress`, Reviewer→`passing`). |

> Solo se modifica `GymTracker.jsx`. No se añaden dependencias (el reordenamiento se hace con
> botones ↑/↓; **sin** librería de drag-and-drop).

---

## Step-by-step tasks (Executor: Codex)

1. **Baseline.** `./init.sh` debe salir 0 antes de empezar.
2. **Helpers puros** (arriba del componente, junto a `sessProgress`):
   - `migrateLegacy(custom, addedEx, deletedEx, allSessions) → sessionExercises`.
   - `resolveSession(session, seForSession) → { items: [effectiveEx…], order }` aplicando las
     reglas 1–4 del diseño.
   - Reescribir `sessProgress(session, done, se)` para contar sobre `resolveSession(...)` en vez
     de `addedEx`/`deletedEx`.
3. **Estado.** Sustituir `custom`/`addedEx`/`deletedEx` por un único `const [sessionExercises,
   setSessionExercises] = useState({})`. Mantener `done`, `runs`, `routine`, `week` igual.
4. **Carga (`useEffect`, líneas ~541–566).** Leer `store.get("sessionExercises")`; si falta,
   leer las claves legacy, migrar con `migrateLegacy`, set + `store.set("sessionExercises", …)`.
5. **Handlers** (reemplazan `saveCustom`/`addEx`/`deleteEx`, líneas ~569–574), todos escribiendo
   `"sessionExercises"`:
   - `saveOverride(sessionId, exId, fields|null)`.
   - `addEx(sessionId, exObj)` → push a `added` y append a `order`; inicializa `done[exId]=false`.
   - `deleteEx(sessionId, exId)` → si base: añadir a `deleted` y quitar de `order`; si añadido:
     quitar de `added` y de `order`.
   - **`moveEx(sessionId, exId, dir)`** → intercambia la posición en `order` (clamp en extremos).
6. **UI de reordenamiento** en `ExCard` (mínima): botones ↑/↓ (lucide `ChevronUp`/`ChevronDown`)
   en la fila de acciones, deshabilitados en el primer/último elemento, que llaman
   `onMove(dir)`. Pasar `onMove`, `isFirst`, `isLast` desde `SessionView` (que ya conoce el orden
   resuelto y el índice).
7. **Wiring de render.** En `SessionView` usar `resolveSession` para obtener la lista ordenada
   única (en lugar de `visDefault` + `visAdded`); pasar índice/onMove a cada `ExCard`. Ajustar
   `HoyView`, `SemanaView` y el cálculo de `activeIds`/`totalEx` (líneas ~583–588) para derivar de
   `sessionExercises` vía los helpers.
8. **Limpieza.** Eliminar referencias a `custom`/`addedEx`/`deletedEx` en props (`sp`, líneas
   ~592) una vez migrado el wiring. No romper `done`.
9. **Verificación local.** `npm run build` + abrir `dist/index.html`; probar reordenar, añadir,
   editar, borrar y recargar.
10. **Cierre de Executor.** `FEATURE_LIST.json` `ui-001` → `in_progress`; registrar sesión en
    `PROGRESS.md`; commit referenciando `PLAN-002`.

---

## Acceptance criteria

- Dentro de una sesión, cada ejercicio muestra controles ↑/↓ que cambian su orden; ↑ está
  deshabilitado en el primero y ↓ en el último.
- El nuevo orden **persiste** tras recargar (clave `"sessionExercises"`).
- Añadir, editar (override) y borrar ejercicios sigue funcionando igual que antes, ahora a través
  de `sessionExercises`.
- Tras borrar un ejercicio base y recargar, no reaparece; un ejercicio base **nuevo introducido en
  el código** sí aparece (reconciliación correcta).
- **Migración**: con datos previos en `custom`/`addedEx`/`deletedEx`, al abrir la app se conserva
  el estado (overrides, añadidos, borrados) y se genera `sessionExercises` sin pérdida.
- El progreso (rings, `dn/tot`, `%` de sesión y semanal) refleja la lista resuelta, incluido el
  reordenamiento.
- `./init.sh` y `npm run build` salen 0; `dist/index.html` renderiza sin errores en consola.
- `ui-001` NO se marca `passing` hasta verificación del Reviewer (Antigravity).

## Verification commands

```bash
./init.sh                      # exit 0
npm run build                  # genera dist/index.html
open dist/index.html           # smoke manual:
# 1) Reordenar con ↑/↓ → recargar → orden persiste.
# 2) Añadir ejercicio → aparece al final → reordenar → recargar.
# 3) Editar sets/reps/target (override) → recargar → persiste.
# 4) Borrar base → recargar → no reaparece.
# 5) (Migración) Con localStorage previo de custom/addedEx/deletedEx, abrir y verificar estado.
```

---

## Risks / notes

- **Reasignación de executor**: `ui-001` figura como `executor: v0` en `FEATURE_LIST.json`, pero
  el núcleo de este plan es **state management + storage** (scope de Codex). Se etiqueta
  `executor: codex`. Un rediseño visual del reordenamiento (drag-and-drop, animaciones) puede ir
  en un plan posterior `executor: v0`.
- **Migración irreversible-suave**: no se borran las claves legacy; se dejan como solo-lectura por
  si hay que diagnosticar. Documentar en `PROGRESS.md`.
- **`done` permanece global por `exId`**: no se mueve a `sessionExercises` (semántica semanal
  distinta). Asegurar que `addEx` siga inicializando `done[exId]=false`.
- **Reconciliación**: es el punto delicado — cubrir con pruebas manuales los casos de base
  nuevo/eliminado en código para no resucitar ni perder ejercicios.
- **Sin nuevas dependencias**: reorden con botones ↑/↓; evita peso extra y mantiene el build
  estable para la PWA de PLAN-001.
