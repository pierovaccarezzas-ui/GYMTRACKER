# PLAN-001 — Conversión a PWA real con auto-deploy (GitHub + Vercel)

```yaml
plan_id: PLAN-001
slug: pwa-conversion
status: passing            # Reviewer (Antigravity) verified 2026-06-08
executor: codex            # build/PWA/storage/pipeline → Codex (no UI redesign)
author: Planner (Opus 4.8)
date: 2026-06-08
features_addressed: [pwa-001, pwa-002]
supersedes_deployment_of: [core-003]   # cambia el target de deploy: Apps Script → Vercel
```

---

## Goal

Convertir GymTrack de un build **single-file IIFE para Google Apps Script** a una
**PWA real, instalable y offline**, desplegada en **Vercel**, con el repositorio en
**GitHub**, de modo que **cada `git push` redepliegue automáticamente** la interfaz.

Como la app no tiene backend (estado en `localStorage`/`window.storage`), "sin Apps
Script" se logra sirviendo los archivos estáticos del build en Vercel. La actualización
automática de la UI se consigue combinando:

- **Vercel Git Integration** → cada push a `main` dispara build + deploy.
- **`vite-plugin-pwa` con `registerType: 'autoUpdate'`** → la app instalada detecta el
  nuevo service worker tras el deploy y se refresca sola.

Esto cierra `pwa-001` (manifest + service worker + instalable) y `pwa-002` (offline).

---

## Context & key decision

El build actual (`vite-plugin-singlefile` + plugin `appsScriptCompat`, salida IIFE sin
módulos ES) es **incompatible con un service worker**: una PWA real exige archivos
separados y módulos. Por tanto este plan **reemplaza el target de deploy de `core-003`
(Apps Script) por Vercel**. La configuración antigua de Apps Script se **conserva** en
`vite.config.appsscript.js` como referencia, pero deja de ser el build por defecto.

> ⚠️ **Estado del repo no limpio (divulgación del Planner).** Durante una sesión previa
> se ejecutaron, fuera del rol de Planner, varios cambios que adelantan parte de este
> plan. **Antes de ejecutar, el Executor debe decidir entre (a) revertirlos y empezar
> limpio siguiendo este plan, o (b) auditarlos contra este plan y continuar.** Cambios ya
> presentes en el working tree:
> - `npm install -D vite-plugin-pwa sharp` (modificó `package.json` + `package-lock.json`).
> - Iconos generados: `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/maskable-512x512.png`.
> - `vite.config.js` reescrito a build PWA; copia del original en `vite.config.appsscript.js`.
> - `index.html` editado (quitado `<base target="_top">`, añadidos meta theme-color / apple-*).
>
> Recomendación: `git stash`/revert de esos cambios y re-aplicarlos vía los tasks de abajo,
> para que el commit quede atómico y trazable a `PLAN-001`.

---

## Affected files

| Archivo | Acción |
|---|---|
| `package.json` | Añadir devDep `vite-plugin-pwa` (+ `sharp` solo para generar iconos, dev). Opcional script `preview`. |
| `vite.config.js` | **Reescribir**: quitar singlefile/appsScriptCompat/IIFE; añadir `VitePWA`. |
| `vite.config.appsscript.js` | **Crear** (copia del `vite.config.js` actual, como referencia). |
| `index.html` | Quitar `<base target="_top">`; añadir `theme-color`, icon, meta `apple-*`. |
| `src/main.jsx` | Limpiar el texto de error que menciona "Google Apps Script" (cosmético). |
| `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/maskable-512x512.png` | **Crear** (iconos desde `favicon.svg`). |
| `vercel.json` | **Crear**: framework vite, headers de caché del SW, fallback SPA. |
| `init.sh` | **Actualizar** la verificación: el build ya no es single-file; usar `npm run preview` para abrir, y comprobar `dist/manifest.webmanifest` + `dist/sw.js`. |
| `FEATURE_LIST.json` / `PROGRESS.md` | **No tocar aquí** (los actualiza Executor→`in_progress` y Reviewer→`passing`). |
| `src/GymTracker.jsx` | **Sin cambios** (lógica intacta). |

---

## Step-by-step tasks (Executor: Codex)

1. **Baseline.** `git status` para ver los cambios out-of-role descritos arriba; decidir
   revertir o continuar. Ejecutar `./init.sh` para confirmar punto de partida.
2. **Dependencias.** Asegurar `vite-plugin-pwa` (dev) instalado. `sharp` (dev) solo se usa
   para generar iconos; puede quedar como devDependency.
3. **Iconos.** Generar `pwa-192x192.png`, `pwa-512x512.png` y `maskable-512x512.png` (512
   con ~30% de padding para la safe zone maskable) a partir de `public/favicon.svg`, fondo
   `#111111`. Dejarlos en `public/`.
4. **`vite.config.js`.** Eliminar `viteSingleFile`, `appsScriptCompat`, `format:'iife'`,
   `modulePreload:false`, `target:'es2015'`. Conservar `@vitejs/plugin-react`. Añadir
   `VitePWA({ registerType:'autoUpdate', includeAssets:['favicon.svg','icons.svg'],
   manifest:{…}, workbox:{ globPatterns, navigateFallback:'/index.html',
   cleanupOutdatedCaches:true } })`. Manifest: `name/short_name:'GymTrack'`,
   `display:'standalone'`, `start_url:'/'`, `scope:'/'`, `theme_color`/`background_color:'#111111'`,
   `lang:'es'`, los 3 iconos (192 any, 512 any, 512 maskable).
5. **Preservar Apps Script.** Crear `vite.config.appsscript.js` con la config single-file
   anterior (referencia; no es el build por defecto).
6. **`index.html`.** Quitar `<base target="_top">` y su comentario; añadir
   `<meta name="theme-color" content="#111111">`, `<link rel="icon" href="/favicon.svg">`
   y metas `apple-mobile-web-app-*`. (El `<link rel="manifest">` y el registro del SW los
   inyecta el plugin.)
7. **`src/main.jsx`.** Reemplazar la referencia a "Google Apps Script" del fallback de error
   por un mensaje genérico. No cambiar la lógica de render.
8. **`vercel.json`.** `framework:'vite'`, `buildCommand:'npm run build'`,
   `outputDirectory:'dist'`; `headers` → `Cache-Control: no-cache` para `sw.js`,
   `index.html` y `manifest.webmanifest`, e `immutable, max-age=31536000` para `/assets/*`;
   `rewrites` fallback SPA a `/index.html`.
9. **`init.sh`.** Actualizar la sección de verificación: además de `dist/index.html`,
   comprobar que existen `dist/manifest.webmanifest` y `dist/sw.js`. Quitar el mensaje
   "Ready to deploy to Google Apps Script".
10. **Build & smoke local.** `npm run build` y `npm run preview`; confirmar manifest + SW.
11. **Commit.** Mensaje referenciando `PLAN-001`. Actualizar `FEATURE_LIST.json`
    (`pwa-001`/`pwa-002` → `in_progress`) y registrar sesión en `PROGRESS.md`.

### Tareas de deploy (requieren credenciales del usuario — no automatizables sin login)

12. **GitHub.** `git init` (si aún no), commit inicial, crear repo y `git push`. Vía CLI:
    instalar `gh`, `gh auth login`, `gh repo create <name> --source=. --push`. Alternativa:
    crear repo vacío en github.com + `git remote add origin … && git push -u origin main`.
13. **Vercel.** En vercel.com → *Add New → Project → Import* el repo → *Deploy*. Esto activa
    la Git Integration (cada push a `main` redepliega). Alternativa CLI: `vercel` (link +
    deploy) y `vercel git connect`. `.gitignore` ya excluye `node_modules` y `dist`.

> Nota: las tareas 12–13 dependen de cuentas del usuario y no pueden completarse sin su
> autenticación. El Executor las deja documentadas/listas; el usuario las autentica.

---

## Acceptance criteria

- `npm run build` genera en `dist/`: `index.html`, `assets/*.js|css`, `manifest.webmanifest`,
  `sw.js` y los 3 PNG de iconos.
- El `index.html` servido enlaza el manifest y registra el service worker (sin errores en
  consola). DevTools → Application → **Manifest** válido y **Service Worker** activo.
- App **instalable** (criterio PWA cumplido; prompt de instalación en Chrome móvil).
- **Offline**: con la red desconectada en DevTools, recargar y la app sigue cargando con los
  datos en `localStorage` (cierra `pwa-002`).
- `vite.config.appsscript.js` existe y conserva la lógica single-file previa.
- `./init.sh` finaliza con exit 0 bajo las reglas de verificación actualizadas.
- (Deploy) Tras conectar Vercel: un push trivial redepliega solo y la app instalada se
  actualiza por sí misma (`autoUpdate`).
- `pwa-001` y `pwa-002` NO se marcan `passing` hasta que el Reviewer (Antigravity) verifique.

## Verification commands

```bash
./init.sh                       # exit 0 con reglas actualizadas
npm run build                   # genera dist/ multi-archivo
ls dist/manifest.webmanifest dist/sw.js dist/assets   # artefactos PWA presentes
npm run preview                 # servir build; abrir en navegador
# DevTools → Application → Manifest + Service Worker; toggle Offline y recargar.
# (Opcional) Lighthouse → PWA (objetivo del feature: score >= 90, install prompt).
# Post-deploy: editar algo trivial, git push, confirmar redeploy automático en Vercel.
```

---

## Risks / notes

- **Conflicto de targets**: `core-003` (Apps Script) deja de ser el deploy activo. Se
  conserva la config como `vite.config.appsscript.js`; documentar el cambio de target en
  `PROGRESS.md` para no confundir a futuras sesiones.
- **Reglas de verificación**: este plan cambia explícitamente la verificación de `init.sh`
  (single-file → multi-file + artefactos PWA). El Executor NO debe alterarlas en silencio;
  ya quedan definidas aquí.
- **Datos**: el almacenamiento es solo cliente; no hay migración de datos entre el deploy de
  Apps Script y el de Vercel (dominios distintos = `localStorage` independiente).
- **Iconos**: generados desde el SVG existente; si se desea un set maskable más pulido,
  considerar `@vite-pwa/assets-generator` en un plan posterior.
