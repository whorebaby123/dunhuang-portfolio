import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const base = '/dunhuang-portfolio/'

function repoFiles() {
  return {
    name: 'repo-content-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          const raw = decodeURIComponent((req.url || '').split('?')[0])
          const prefix = base.replace(/\/$/, '')
          if (!raw.startsWith(prefix + '/')) return next()
          const rel = raw.slice(prefix.length + 1)
          if (!(rel.startsWith('content/') || rel.startsWith('assets/'))) return next()
          if (rel.includes('..')) return next()
          const file = path.resolve(root, rel)
          if (!file.startsWith(root + path.sep)) return next()
          if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
          const types = {
            '.json': 'application/json; charset=utf-8',
            '.md': 'text/markdown; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
          }
          res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
          res.setHeader('Cache-Control', 'no-store')
          fs.createReadStream(file).pipe(res)
        } catch {
          next()
        }
      })
    },
    closeBundle() {
      const dist = path.join(root, 'dist')
      fs.cpSync(path.join(root, 'content'), path.join(dist, 'content'), { recursive: true })
      fs.cpSync(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true })
    },
  }
}

export default defineConfig({
  base,
  plugins: [repoFiles()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
})
