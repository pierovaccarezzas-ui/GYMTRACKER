# Activar Firebase para GymTrack

1. En Firebase Console, abre **Build > Firestore Database** y crea una base de datos **Cloud Firestore (Standard)** en modo producción. No uses SQL Connect/Data Connect: esa es la prueba de 90 días que no usamos.
2. En **Authentication > Sign-in method**, deja habilitado **Correo electrónico/contraseña**. Google puede quedar habilitado para una futura opción de acceso, pero la PWA actual usa correo y contraseña.
3. Instala Firebase CLI en un equipo de desarrollo y autentícate:

   ```sh
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project gym-track-71605
   ```

   Esto publica [firestore.rules](../firestore.rules), que permite cada usuario leer y escribir solo `users/<su-uid>/records/*`.
4. En el hosting de la PWA, configura las mismas seis variables de `.env.example` y vuelve a desplegar. La configuración pública enviada por el navegador no es una credencial administrativa.
5. Abre la PWA en un dispositivo, crea o inicia sesión con correo y contraseña. Cuando detecte la copia local recuperada, elige explícitamente **Recuperar datos de este dispositivo**. En el segundo dispositivo, entra con la misma cuenta y espera el estado **Sincronizado**.

## Recuperación

- Antes de importar o adoptar una copia, la app descarga un respaldo JSON.
- En Configuración puedes importar JSON de GymTrack o CSV/JSON con `gymtrack_state.payload` exportado desde Supabase.
- La exportación de Supabase se conservó localmente durante esta migración; no borres la instalación anterior del teléfono hasta comprobar que rutinas, pesos, carreras e historial estén en Firebase.
- Solo una pestaña puede editar en un mismo navegador. Otra pestaña queda en modo de solo lectura para evitar que dos copias locales se pisen. Dos dispositivos distintos sí pueden editar y sincronizar.
