import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

/**
 * Dev-only middleware that lets `npm run dev` (plain Vite) serve the same
 * `/api/*` endpoints that run as a single Vercel serverless function in
 * production (api/[...path].js). Without this, any fetch('/api/...') during
 * local development falls through to Vite's SPA fallback and returns this
 * project's index.html with a 200 status — which is exactly the
 * "Server mengembalikan respons yang tidak valid (200, text/html)" error.
 *
 * This plugin never runs during `vite build` (apply: 'serve' + it only
 * touches the api handler inside configureServer, which Vite only invokes
 * for the dev server), so it cannot affect production builds or deploys.
 */
function localApiDevMiddleware(env) {
  return {
    name: 'local-api-dev-middleware',
    apply: 'serve',
    configureServer(server) {
      // Make server-only env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
      // TELEGRAM_BOT_TOKEN, ...) available to the api handlers, the same way
      // Vercel injects them at runtime. Vite normally only exposes VITE_*
      // vars to client code, so this is required for local API calls to work.
      Object.assign(process.env, env)

      const apiHandlerUrl = pathToFileURL(
        path.resolve(import.meta.dirname, 'api/[...path].js')
      ).href

      server.middlewares.use('/api', async (req, res) => {
        try {
          const { default: handler } = await import(apiHandlerUrl)

          const url = new URL(req.url, 'http://localhost')
          const query = Object.fromEntries(url.searchParams.entries())
          // Connect strips the '/api' mount prefix from req.url, so the
          // remaining segments are exactly what Vercel's [...path].js
          // receives as req.query.path in production.
          query.path = url.pathname.split('/').filter(Boolean)
          req.query = query

          if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
            let raw = ''
            req.setEncoding('utf8')
            for await (const chunk of req) raw += chunk
            try {
              req.body = raw ? JSON.parse(raw) : {}
            } catch {
              req.body = {}
            }
          }

          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (payload) => {
            if (!res.getHeader('Content-Type')) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
            }
            res.end(JSON.stringify(payload))
            return res
          }
          res.send = (body) => {
            res.end(typeof body === 'string' ? body : JSON.stringify(body))
            return res
          }

          await handler(req, res)
        } catch (error) {
          console.error('[local api dev]', error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
          }
          res.end(JSON.stringify({ message: error?.message || 'Local API error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApiDevMiddleware(env)],
    build: {
      chunkSizeWarningLimit: 1000,
    },
  }
})
