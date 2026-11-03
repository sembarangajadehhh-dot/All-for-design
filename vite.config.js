import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Preview proxies hit the dev server from a different origin/host.
    allowedHosts: true,
    watch: {
      // Skill packs and archives are content, not app code — don't reload on them.
      ignored: ['**/skills/**', '**/archives/**'],
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
