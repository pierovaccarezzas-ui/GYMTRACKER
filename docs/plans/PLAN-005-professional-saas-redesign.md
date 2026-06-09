# PLAN-005 — Rediseño profesional SaaS/App web compacto

```yaml
plan_id: PLAN-005
slug: professional-saas-redesign
status: in_review
executor: v0
executor_actual: codex
author: Planner (Opus 4.8)
date: 2026-06-09
features_addressed: [ui-010]
supersedes_visual_of: [ui-009]
scope: visual-only
```

> **Aprobación.** El usuario autorizó explícitamente ejecutar este plan de inmediato. Está
> aprobado para V0, pero el Executor igualmente debe respetar el flujo de inicio, trabajar solo
> sobre `ui-010` y no marcarla `passing`.

> **Dirección seleccionada.** El usuario eligió la opción 2: consola deportiva premium oscura,
> con fondo carbón/azul, acento cian y un único menú de tres puntos por ejercicio para mover,
> editar y borrar. Codex ejecuta el plan por solicitud explícita del usuario.

---

## Goal

Reemplazar visualmente el diseño Swiss Neo-Brutalist editorial de `ui-009` por una interfaz
profesional de producto **SaaS/App web**, compacta, sobria y eficiente, manteniendo intacta toda la
lógica y comportamiento ya verificados.

La nueva dirección debe sentirse como una aplicación de uso diario, no como una landing editorial:
jerarquía clara, densidad controlada, superficies limpias, bordes sutiles, radios moderados,
tipografía legible, acciones proporcionadas y uso disciplinado del color. Debe aprovechar mejor el
viewport móvil sin sacrificar accesibilidad ni claridad.

`ui-010` **reemplaza únicamente el resultado visual de `ui-009`**. No elimina ni cambia el estado
`passing` ni la evidencia histórica de `ui-009`, y tampoco modifica las funcionalidades verificadas
de `ui-001`, `ui-006`, `ui-007` o `ui-008`.

### Principios visuales

- **SaaS profesional**: superficies neutras, tarjetas contenidas, bordes suaves, sombras discretas,
  estados claros y consistencia entre Hoy, Semana y Correr.
- **Compacto, no diminuto**: reducir titulares sobredimensionados, whitespace editorial, barras
  altas y bloques excesivos; mantener legibilidad y separación funcional.
- **Acciones proporcionadas**: controles de acción visibles de aproximadamente **36–40 px** de
  alto/ancho. Cuando un icono o botón visible sea menor de 44 px, ampliar su objetivo táctil
  razonablemente mediante padding, wrapper o pseudo-elemento sin inflar su apariencia ni provocar
  solapamientos.
- **Navegación móvil contenida**: barra inferior visible de **56–60 px** de alto, más
  `env(safe-area-inset-bottom)`, con objetivos táctiles claros; no debe parecer una segunda cabecera.
- **Jerarquía práctica**: títulos de pantalla y sesión más contenidos, métricas escaneables, labels
  breves y tarjetas/listas optimizadas para completar entrenamientos rápidamente.
- **Color funcional**: base neutra clara u oscura coherente, un acento primario y colores de estado
  reservados para progreso, categorías, éxito, advertencia y acciones destructivas.

---

## Scope guard — visual only

El Executor puede cambiar estilos inline, CSS, composición visual y wrappers presentacionales
necesarios para objetivos táctiles. Debe preservar exactamente:

- Constantes y datos de rutinas (`MAIN`, `MANT`, categorías y tipos de carrera).
- Estado React, efectos, migraciones, almacenamiento y claves persistidas.
- Helpers de progreso, resolución de sesiones, cálculo de pace y semana.
- Handlers y resultados de todas las acciones: completar series, editar, agregar, borrar, ordenar,
  cambiar rutina/pestaña, calcular/guardar/borrar carreras.
- Props, ids, valores, orden funcional, formularios, modales y condiciones de renderizado.
- Tipografías auto-alojadas y funcionamiento offline; no añadir fuentes o assets remotos.

No añadir dependencias, funcionalidades, nuevas rutas, animaciones complejas, cambios de copy
funcional ni refactors de lógica. Si una decisión visual exige cambiar comportamiento, detener esa
parte y devolverla al Planner.

---

## Current design assessment

La implementación vigente está concentrada principalmente en estilos inline de
`src/GymTracker.jsx`:

- Paleta papel/ink y sistema editorial en los tokens `BG`, `C1`, `C2`, `C3`, `BR`, `PINK`,
  `PANEL`, `INPUT`, `ACTION` y `MONO`.
- Titulares de sesión de hasta `68px`, tracking muy cerrado, numeración técnica y labels mono.
- Header sticky, tarjetas/listas con hairlines, rings, formularios, modal de series y nav inferior
  de aproximadamente `72px` más safe area.
- Regla global `button{min-height:48px}` que hace que incluso acciones secundarias se vean grandes.
- Botones de reordenar/editar/borrar de `42px`, botón principal de ejercicio de `48px` y múltiples
  acciones de formulario de `48px` o más.
- `src/index.css` ya contiene Inter e IBM Plex Mono auto-alojadas; deben conservarse.

El Executor debe transformar ese lenguaje visual, no sustituir el componente ni reimplementar sus
flujos.

---

## Affected files

| Archivo | Acción prevista |
|---|---|
| `src/GymTracker.jsx` | Archivo principal del rediseño: actualizar tokens y estilos inline; compactar header, vistas, tarjetas, formularios, modal y nav; añadir solo wrappers/padding presentacionales necesarios para objetivos táctiles. **No modificar lógica.** |
| `src/index.css` | Ajustar reset/base, fondo, tipografía y reglas globales de interacción para el nuevo sistema compacto. Conservar fuentes locales y soporte offline. |
| `index.html` | Solo si es necesario, alinear `theme-color` con el fondo final. Sin otros cambios. |
| `vite.config.js` | Solo si cambia el fondo final, alinear `theme_color` y `background_color` del manifest. Sin tocar configuración de build/PWA. |
| `FEATURE_LIST.json` | Al cierre del Executor: mover únicamente `ui-010` de `approved` a `in_progress`; nunca a `passing`. |
| `PROGRESS.md` | Al cierre del Executor: registrar implementación, verificación y siguiente paso de Reviewer. |

No se esperan archivos nuevos, dependencias nuevas ni cambios en `public/fonts/`.

---

## Step-by-step tasks

1. **Verificar baseline antes de editar.**
   - Ejecutar `./init.sh` y `npm run build`.
   - Abrir el build actual en viewport móvil y registrar visualmente los flujos Hoy, Semana,
     detalle de sesión, Correr, formulario de ejercicio, edición y modal de series.
   - Si el baseline funcional falla, detener la ejecución y documentar el bloqueo.

2. **Definir el sistema visual SaaS compacto.**
   - Reemplazar los tokens editoriales por un sistema coherente de fondo, superficies, texto,
     bordes, acento, estados, radios y sombras discretas.
   - Mantener Inter como fuente principal; reservar IBM Plex Mono solo para datos donde aporte
     legibilidad, sin usarlo como decoración dominante.
   - Reducir la escala tipográfica extrema y normalizar títulos, subtítulos, metadatos y métricas.
   - Evitar estética neo-brutalista: sin grandes numeraciones decorativas, reglas dominantes,
     titulares tipo póster ni bloques que consuman espacio sin función.

3. **Compactar el shell de aplicación.**
   - Reducir padding y altura del header sticky manteniendo wordmark, semana, progreso y selector de
     rutina claramente legibles.
   - Convertir el selector de rutina en un control segmentado compacto y reconocible.
   - Mantener el ancho móvil actual y asegurar que el contenido no quede oculto bajo header/nav.
   - Rediseñar la nav inferior con altura visual de **56–60px** más safe area, tres destinos claros
     y estado activo inequívoco, sin altura excesiva.

4. **Rediseñar Hoy y detalle de sesión.**
   - Convertir la cabecera de sesión en un resumen compacto con nombre, contexto, progreso y
     métricas, evitando el titular editorial gigante.
   - Presentar ejercicios como filas/tarjetas SaaS densas pero respirables, con nombre, categoría,
     series/reps, objetivo y progreso fácilmente escaneables.
   - Mantener visibles y comprensibles completar/series, mover, editar y borrar.
   - Establecer acciones visibles de **36–40px**; ampliar área táctil cuando corresponda sin
     solapamientos, cambios de layout inesperados ni controles visualmente enormes.
   - Conservar estados completo, parcial, editado, disabled, confirmación de borrado y cualquier
     opción de sesión.

5. **Rediseñar formularios y modal de series.**
   - Compactar campos, selectores de categoría y acciones manteniendo labels y estados de foco.
   - Mantener inputs suficientemente cómodos y legibles; no reducir campos de entrada por debajo de
     una altura práctica para móvil.
   - Rehacer el modal/sheet de series como panel SaaS compacto, con jerarquía clara, cierre evidente
     y cada serie seleccionable sin ambigüedad.
   - Diferenciar visualmente acciones primaria, secundaria, destructiva y disabled.

6. **Rediseñar Semana, descanso y Correr.**
   - Aplicar el mismo sistema a resumen semanal, filas de sesión, estado de descanso, recuperación,
     métricas de carrera, calculadora, resultados e historial.
   - Reducir adornos y alturas innecesarias sin ocultar datos ni acciones existentes.
   - Mantener progreso, categorías y estados con semántica cromática consistente.

7. **Accesibilidad, responsive y estados.**
   - Validar contraste AA para texto y acciones relevantes.
   - Añadir estados visuales coherentes de focus-visible, active, selected, disabled, completed y
     destructive.
   - Revisar viewports de **320px, 390px y 480px**: sin overflow horizontal, recortes, objetivos
     táctiles solapados ni contenido tapado por la nav/safe area.
   - Respetar `prefers-reduced-motion`; usar transiciones breves y funcionales únicamente.

8. **Auditar preservación funcional.**
   - Comparar el diff y confirmar que no cambiaron helpers, estado, almacenamiento, efectos,
     handlers, datos o cálculos.
   - Probar navegación, selector de rutina, progreso por serie, agregar/editar/borrar/reordenar
     ejercicios y flujo completo de carreras.
   - Verificar persistencia después de recargar y restaurar cualquier dato usado en smoke tests.

9. **Cerrar ejecución para revisión.**
   - Ejecutar todos los comandos de verificación.
   - Actualizar únicamente `ui-010` a `in_progress`, registrar evidencia en `PROGRESS.md` y hacer un
     commit descriptivo que mencione `PLAN-005`.
   - No cambiar `ui-009` ni ninguna otra feature y no marcar `ui-010` como `passing`.

---

## Acceptance criteria

- Hoy, Semana, Correr, descanso, detalle de sesión, formularios y modal de series comparten una
  dirección visual profesional SaaS/App web, coherente, sobria y claramente distinta del diseño
  Swiss Neo-Brutalist editorial de `ui-009`.
- La interfaz es visiblemente más compacta: no hay titulares tipo póster, numeración decorativa
  dominante, whitespace editorial excesivo ni controles sobredimensionados.
- Las acciones compactas principales/secundarias tienen una caja visible de aproximadamente
  **36–40px**. Las acciones solo-icono o de caja visible menor a 44px mantienen objetivos táctiles
  razonables mediante área/padding ampliado cuando corresponda, sin solaparse.
- La nav inferior mide visualmente **56–60px** más `env(safe-area-inset-bottom)`, mantiene tres
  destinos claros y no oculta contenido.
- Inputs y controles críticos siguen siendo cómodos en móvil; compactar no implica texto ilegible
  ni interacciones imprecisas.
- No existe overflow horizontal ni contenido oculto/recortado en viewports de 320px, 390px y 480px.
- Los estados selected, focus-visible, active, disabled, completed, partial y destructive son
  claros; el contraste de texto y controles relevantes cumple AA.
- No se añaden dependencias, fuentes remotas ni assets remotos; la PWA mantiene su apariencia
  offline.
- **Cero cambios funcionales**: los datos, cálculos, navegación, persistencia, progreso por series,
  CRUD/reordenamiento de ejercicios, rutinas y carreras se comportan exactamente como antes.
- `./init.sh` y `npm run build` salen 0; `dist/index.html` renderiza sin errores de consola.
- El Executor deja `ui-010` en `in_progress`; solo Reviewer puede marcarla `passing`.

---

## Verification commands

```bash
./init.sh
npm run build
git diff --check
git diff -- src/GymTracker.jsx src/index.css index.html vite.config.js
npm run preview -- --host 127.0.0.1 --port 4173
```

### Manual visual and regression verification

1. Abrir `http://127.0.0.1:4173` en viewports 320px, 390px y 480px.
2. Revisar Hoy, Semana, detalle de cada sesión, descanso, Correr, formulario agregar/editar y modal
   de series; confirmar coherencia SaaS compacta y ausencia de overflow/recortes.
3. Medir en DevTools: acciones visibles 36–40px según su rol y nav visible 56–60px más safe area;
   confirmar que objetivos táctiles compactos siguen siendo razonables y no se solapan.
4. Navegar entre pestañas/rutinas; completar/descompletar series; agregar, editar, mover y borrar un
   ejercicio; recargar y confirmar persistencia; restaurar datos de prueba.
5. Calcular, guardar y borrar una carrera; confirmar que pace, historial y acciones no cambiaron.
6. Revisar consola y Network: cero errores; cero fuentes/assets remotos nuevos; funcionamiento
   offline conserva estilos y fuentes.
7. Auditar el diff: no deben cambiar helpers, estado, efectos, almacenamiento, handlers ni datos.

---

## Risks / notes

- **Compacto vs. táctil**: una caja visible de 36–40px puede ser insuficiente como objetivo táctil.
  V0 debe ampliar el área interactiva de manera invisible o contextual cuando sea necesario, sin
  solapar controles vecinos. Inputs, filas principales y controles críticos pueden conservar una
  zona táctil mayor aunque su apariencia sea compacta.
- **CSS inline centralizado**: gran parte del diseño vive en `src/GymTracker.jsx`; el riesgo mayor es
  mezclar cambios visuales con lógica. El diff funcional es una verificación obligatoria.
- **Supersesión visual**: `ui-009` permanece `passing` como registro histórico. `ui-010` reemplaza
  su apariencia, no su evidencia ni las funcionalidades existentes.
- **Tema PWA**: solo cambiar `index.html`/`vite.config.js` si el fondo final lo exige, manteniendo
  intacta la configuración de build, manifest y service worker.
- **Sin scope creep**: mejoras de navegación, nuevas métricas, nuevas acciones o cambios de copy se
  planifican aparte.
