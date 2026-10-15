import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Runs the /api functions (normally Vercel serverless) inside `npm run dev` too.
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      // /admin → the dashboard page (Vercel does this with cleanUrls in production)
      server.middlewares.use((req, res, next) => {
        if (/^\/admin\/?(\?.*)?$/.test(req.url)) req.url = req.url.replace(/^\/admin\/?/, '/admin.html')
        next()
      })
      server.middlewares.use('/api/registrations', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/registrations.js')
        handler(req, res)
      })
    },
  }
}

// One request per visit: JS, CSS, fonts and photos are all inlined into index.html.
// public/admin.html (the hidden dashboard) is copied as-is and is not part of that bundle.
export default defineConfig(({ mode }) => {
  // expose non-VITE_ env (admin login, Supabase secret key) to the dev API only
  for (const [k, v] of Object.entries(loadEnv(mode, process.cwd(), ''))) process.env[k] ??= v
  return {
    plugins: [react(), viteSingleFile(), devApi()],
  }
})
