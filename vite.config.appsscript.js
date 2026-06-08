import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Custom plugin: after build + singlefile inlining, fix for Google Apps Script:
 *
 * 1. Remove `type="module" crossorigin` from the main <script> tag
 * 2. Move the <script> from <head> to end of <body>
 *
 * Why? Apps Script sandbox doesn't support ES modules, and without
 * type="module" the script runs synchronously — before <div id="root"> exists.
 */
function appsScriptCompat() {
  return {
    name: 'apps-script-compat',
    closeBundle() {
      const outPath = resolve('dist', 'index.html')
      let html = readFileSync(outPath, 'utf-8')

      // Find the FIRST <script...> tag (the real one, not one inside JS strings)
      const scriptOpenIdx = html.indexOf('<script')
      if (scriptOpenIdx === -1) return

      // Find where that opening tag ends
      const scriptOpenEnd = html.indexOf('>', scriptOpenIdx) + 1

      // Find the LAST </script> (the real closing tag)
      const scriptCloseIdx = html.lastIndexOf('</script>')
      const scriptCloseEnd = scriptCloseIdx + '</script>'.length

      // Extract the full script block
      const openTag = html.substring(scriptOpenIdx, scriptOpenEnd)
      const scriptContent = html.substring(scriptOpenEnd, scriptCloseIdx)
      // Clean the opening tag
      const cleanOpenTag = openTag
        .replace(/ type="module"/g, '')
        .replace(/ crossorigin/g, '')

      // Remove the script from its original position
      html = html.substring(0, scriptOpenIdx) + html.substring(scriptCloseEnd)

      // Build the clean script block (escaping double slashes to prevent Google Apps Script parser comment bugs)
      const safeScriptContent = scriptContent.replace(/\/\//g, '\\/\\/')
      const cleanScript = cleanOpenTag + safeScriptContent + '</script>'

      // Insert right before </body>
      html = html.replace('</body>', () => cleanScript + '\n</body>')

      writeFileSync(outPath, html)
      console.log('[apps-script-compat] ✓ Moved script to <body>, removed type="module"')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    appsScriptCompat(),
  ],
  build: {
    target: 'es2015',
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
      },
    },
  },
})
