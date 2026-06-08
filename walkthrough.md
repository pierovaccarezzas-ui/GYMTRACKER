# Walkthrough: Despliegue de Gym Tracker en Google Apps Script

¡Ya hemos realizado la preparación de tu código y la compilación local! En este documento te explicamos detalladamente qué hicimos tras bambalinas en tu computador y cómo realizar el despliegue final en la nube paso a paso.

---

## 1. ¿Qué hicimos en tu computador?

1. **Reorganizamos el código**: Copiamos el código original de `gym_tracker.jsx` dentro de `src/GymTracker.jsx` para seguir la estructura estándar de React. El archivo temporal en la raíz fue eliminado.
2. **Conectamos la App**: Editamos `src/App.jsx` para que, en lugar de mostrar la pantalla de bienvenida de Vite, cargue directamente tu aplicación `GymTracker`.
3. **Instalamos el Empaquetador Único (`vite-plugin-singlefile`)**: Instalamos esta herramienta en tu proyecto.
4. **Configuramos Vite**: Editamos `vite.config.js` para habilitar el plugin.
5. **Compilamos la App (`npm run build`)**: Ejecutamos el compilador. Vite procesó tu código React, la lógica de los iconos (`lucide-react`) y los estilos, y generó **un único archivo HTML autocontenido** en la ruta:
   [dist/index.html](file:///Users/pierovaccarezza/Downloads/PWA%20gym%20tracker/dist/index.html) (pesa solo 230 KB).

---

## 2. Conceptos Técnicos Claves (Explicados de forma simple)

* **Compilación (Build)**: El código en React (`.jsx`) utiliza sintaxis moderna que los navegadores no entienden directamente. La compilación toma todo ese código, lo simplifica y genera archivos estándar (`.html`, `.js`, `.css`) optimizados.
* **Single-File Bundling**: En lugar de generar varios archivos enlazados, unificamos todo el JavaScript y CSS dentro del mismo archivo `index.html`. Esto es necesario porque Google Apps Script no aloja carpetas ni assets tradicionales de forma sencilla.
* **doGet() en Apps Script**: Es una función especial del servidor de Google. Cada vez que alguien entra al enlace de tu aplicación web, Google ejecuta `doGet()` en sus servidores. Esta función se encarga de leer tu archivo de interfaz (`Index.html`) y enviárselo al navegador de quien lo solicita.
* **Viewport**: Es una configuración de HTML que le dice al navegador móvil cómo ajustar el tamaño de la página. Usamos `width=device-width, initial-scale=1` para que los botones y textos tengan el tamaño correcto y no se vean diminutos en la pantalla del celular.
* **A2HS (Add to Home Screen)**: Es una funcionalidad de los navegadores móviles. Al no subir la app a Google Play o App Store, creamos un "acceso directo" en el escritorio del teléfono que se comporta exactamente como una aplicación nativa (abre a pantalla completa sin la barra de direcciones del navegador).

---

## 3. Tutorial de Despliegue: Paso a Paso

Sigue estas sencillas instrucciones para subir tu aplicación a la nube:

### Paso 3.1: Crear el proyecto en Google Apps Script
1. Abre tu navegador e ingresa a: **[script.google.com](https://script.google.com)**
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en el botón **"Nuevo proyecto"** (arriba a la izquierda).
4. Cámbiale el nombre al proyecto (haz clic en "Proyecto sin título" arriba) y ponle algo como `GYMTRACK PWA`.

### Paso 3.2: Configurar el archivo de Servidor (`Code.gs`)
1. Verás que ya existe un archivo llamado `Code.gs` en el panel izquierdo con una función vacía llamada `myFunction()`.
2. Borra todo lo que tiene ese archivo y pega este código:

```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('GYMTRACK')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, user-scalable=no');
}
```

3. Guarda los cambios haciendo clic en el icono del **Disco** de guardar (o presiona `Cmd+S` en Mac / `Ctrl+S` en Windows).

### Paso 3.3: Crear el archivo de Interfaz (`Index.html`)
1. En el panel izquierdo de Apps Script, haz clic en el botón **"+" (Agregar un archivo)** que está al lado de "Archivos".
2. Selecciona **HTML**.
3. Nómbralo exactamente como **`Index`** (Google le añadirá automáticamente la extensión `.html`, quedando `Index.html`).
4. Borra todo el contenido por defecto que trae el archivo en el editor.

### Paso 3.4: Pegar tu código compilado
1. Abre el archivo compilado local en tu editor de código (VS Code):
   👉 [index.html en dist/](file:///Users/pierovaccarezza/Downloads/PWA%20gym%20tracker/dist/index.html)
2. Selecciona todo el texto (`Cmd+A` en Mac o `Ctrl+A` en Windows) y **cópialo**.
3. Vuelve al editor de Google Apps Script, abre tu archivo `Index.html` recién creado, y **pega todo el código ahí**.
4. Guarda el archivo usando el icono del **Disco**.

### Paso 3.5: Publicar y Desplegar (Deploy)
1. En la esquina superior derecha del editor de Apps Script, haz clic en el botón azul **"Implementar" (Deploy)** y selecciona **"Nueva implementación" (New deployment)**.
2. En la ventana que aparece, haz clic en el icono de **engranaje** al lado de "Seleccionar tipo" y elige **"Aplicación web" (Web app)**.
3. Configura los siguientes campos:
   - **Descripción**: `Versión 1`
   - **Ejecutar como**: `Yo (tu_correo@gmail.com)` *(Esto permite que la app acceda a tus recursos con tus permisos)*.
   - **Quién tiene acceso**: `Solo yo` *(Recomendado para apps personales)* o `Cualquier persona con una cuenta de Google` *(si deseas compartirla con alguien más)*.
4. Haz clic en el botón azul **"Implementar"**.
5. Si Google te pide autorizar accesos (por ser un script propio), haz clic en **"Autorizar acceso"**, selecciona tu cuenta de Google, luego haz clic en **"Configuración avanzada"** (abajo a la izquierda en texto pequeño) y finalmente en **"Ir a GYMTRACK PWA (no seguro)"**. Esto es normal en scripts creados por uno mismo.
6. Una vez completado, Google te mostrará una pantalla con la **URL de la aplicación web**. Copia esa URL (termina en `/exec`).

---

## 4. Instalación en tu Celular (Efecto PWA)

Envía la URL copiada a tu celular (por WhatsApp, correo, etc.) y sigue estos pasos según tu sistema:

### En iPhone (Safari):
1. Abre la URL en **Safari**.
2. Presiona el botón de **Compartir** (el cuadro con una flecha hacia arriba en la barra inferior).
3. Selecciona la opción **"Agregar a pantalla de inicio"**.
4. Listo, tendrás el icono en tu escritorio móvil y abrirá a pantalla completa.

### En Android (Chrome):
1. Abre la URL en **Google Chrome**.
2. Toca los **tres puntos** de la esquina superior derecha.
3. Elige la opción **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
4. Listo, la app se agregará a tu cajón de aplicaciones.
