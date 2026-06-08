import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    throw new Error("No se encontró el elemento con id 'root' en el HTML.");
  }
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error("Error al renderizar la aplicación:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; color: #ff5252; background: #111; font-family: monospace; font-size: 14px; border: 1px solid #ff5252; margin: 20px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #ff5252;">⚠️ Error al iniciar la aplicación</h3>
      <p>Ocurrió un error al cargar React. Esto puede deberse a que el script se ejecutó antes de que la página se cargara por completo o a un problema del entorno de ejecución del navegador.</p>
      <pre style="background: #222; padding: 10px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; color: #eee;">${error.message}\n${error.stack || ''}</pre>
    </div>
  `;
}
