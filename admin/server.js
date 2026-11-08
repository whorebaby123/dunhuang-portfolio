import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'admin', 'public')
const host = '127.0.0.1'
const port = 4317
const previewUrl = 'http://127.0.0.1:5173/dunhuang-portfolio/'
const MAX = 1_500_000

const JSON_FILES = new Set([
  'content/site.json',
  'content/modules.json',
  'content/projects.json',
  'content/certificates.json',
  'content/taxonomy.json',
  'content/media.json',
  'content/resume.json',
])

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX) {
        reject(new Error('too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function safeRel(rel) {
  const normal = path.posix.normalize(String(rel || '').replace(/\\/g, '/'))
  if (normal.startsWith('..') || path.isAbsolute(normal)) throw new Error('bad path')
  return normal
}

function abs(rel) {
  const full = path.resolve(root, safeRel(rel))
  if (!full.startsWith(root + path.sep)) throw new Error('bad path')
  return full
}

function write(rel, text) {
  const file = abs(rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, text)
  fs.renameSync(tmp, file)
}

function read(rel) {
  return fs.readFileSync(abs(rel), 'utf8')
}

function allowedMarkdown(rel) {
  return /^content\/(?:projects|certificates)\/[a-z0-9-]+\.(?:zh|en)\.md$/.test(rel)
    || /^content\/resume\.(?:zh|en)\.md$/.test(rel)
}

function slugOk(slug) {
  return /^[a-z0-9-]{1,64}$/.test(slug)
}

function bundle() {
  const files = {}
  for (const rel of JSON_FILES) files[rel] = read(rel)
  const bodies = {}
  for (const dir of ['projects', 'certificates']) {
    const folder = path.join(root, 'content', dir)
    if (!fs.existsSync(folder)) continue
    for (const name of fs.readdirSync(folder)) {
      if (!/^[a-z0-9-]+\.(zh|en)\.md$/.test(name)) continue
      bodies[`content/${dir}/${name}`] = fs.readFileSync(path.join(folder, name), 'utf8')
    }
  }
  for (const name of ['resume.zh.md', 'resume.en.md']) {
    bodies[`content/${name}`] = read(`content/${name}`)
  }
  return { files, bodies, previewUrl }
}

function uniqueId(list, prefix) {
  let n = 1
  const ids = new Set(list.map((item) => item.id))
  while (ids.has(`${prefix}${n}`)) n += 1
  return `${prefix}${n}`
}

function moduleTemplate(type, modules) {
  if (type === 'hero') {
    return {
      id: 'mod_hero',
      type: 'hero',
      enabled: true,
      label: { zh: '首屏 / 身份', en: 'Hero / Identity' },
      fields: {
        name: { zh: '', en: '' },
        city: { zh: '', en: '' },
        availability: { zh: '', en: '' },
        eyebrow: { zh: '', en: '' },
        headline: { zh: '', en: '' },
        lede: { zh: '', en: '' },
        primaryCta: { zh: '查看项目 →', en: 'View projects →' },
        secondaryCta: { zh: '下载简历', en: 'Download résumé' },
      },
    }
  }
  if (type === 'featured') {
    return {
      id: 'mod_featured',
      type: 'featured',
      enabled: true,
      label: { zh: '精选项目', en: 'Selected work' },
      fields: { title: { zh: '精选项目', en: 'Selected work' } },
    }
  }
  if (type === 'certificates') {
    return {
      id: uniqueId(modules, 'mod_certificates_'),
      type: 'certificates',
      enabled: true,
      label: { zh: '证书摘录', en: 'Certificates' },
      fields: { title: { zh: '证书', en: 'Certificates' } },
    }
  }
  return {
    id: uniqueId(modules, 'mod_prose_'),
    type: 'prose',
    enabled: true,
    label: { zh: '一段文字', en: 'A note' },
    fields: {
      title: { zh: '一段文字', en: 'A note' },
      body: { zh: '', en: '' },
    },
  }
}

function saveJson(rel, value) {
  if (!JSON_FILES.has(rel)) throw new Error('bad file')
  write(rel, `${JSON.stringify(value, null, 2)}\n`)
}

const server = http.createServer(async (req, res) => {
  const remote = req.socket.remoteAddress || ''
  if (remote !== '127.0.0.1' && remote !== '::1' && remote !== '::ffff:127.0.0.1') {
    send(res, 403, JSON.stringify({ error: 'local only' }))
    return
  }
  const url = new URL(req.url || '/', `http://${host}`)
  try {
    if (req.method === 'GET' && url.pathname === '/api/content') {
      send(res, 200, JSON.stringify(bundle()))
      return
    }
    if (req.method === 'PUT' && url.pathname === '/api/json') {
      const body = JSON.parse(await readBody(req))
      saveJson(body.file, body.data)
      send(res, 200, JSON.stringify({ ok: true }))
      return
    }
    if (req.method === 'PUT' && url.pathname === '/api/text') {
      const body = JSON.parse(await readBody(req))
      const rel = safeRel(body.file)
      if (!allowedMarkdown(rel)) throw new Error('bad file')
      write(rel, String(body.text ?? ''))
      send(res, 200, JSON.stringify({ ok: true }))
      return
    }
    if (req.method === 'DELETE' && url.pathname === '/api/text') {
      const body = JSON.parse(await readBody(req))
      const rel = safeRel(body.file)
      if (!allowedMarkdown(rel)) throw new Error('bad file')
      const file = abs(rel)
      if (fs.existsSync(file)) fs.unlinkSync(file)
      send(res, 200, JSON.stringify({ ok: true }))
      return
    }
    if (req.method === 'POST' && url.pathname === '/api/modules') {
      const body = JSON.parse(await readBody(req) || '{}')
      const modules = JSON.parse(read('content/modules.json'))
      const type = ['hero', 'featured', 'prose', 'certificates'].includes(body.type) ? body.type : 'prose'
      if ((type === 'hero' || type === 'featured') && modules.some((item) => item.type === type)) {
        send(res, 400, JSON.stringify({ error: 'already exists' }))
        return
      }
      modules.push(moduleTemplate(type, modules))
      saveJson('content/modules.json', modules)
      send(res, 200, JSON.stringify({ ok: true, modules }))
      return
    }
    if (req.method === 'GET' && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/content/'))) {
      const rel = safeRel(url.pathname.slice(1))
      if (!(rel.startsWith('assets/') || rel.startsWith('content/'))) throw new Error('bad path')
      const file = abs(rel)
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        send(res, 404, JSON.stringify({ error: 'not found' }))
        return
      }
      const types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.json': 'application/json; charset=utf-8',
        '.md': 'text/markdown; charset=utf-8',
      }
      send(res, 200, fs.readFileSync(file), types[path.extname(file)] || 'application/octet-stream')
      return
    }
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      send(res, 200, fs.readFileSync(path.join(publicDir, 'index.html')), 'text/html; charset=utf-8')
      return
    }
    if (req.method === 'GET' && ['/admin.css', '/admin.js'].includes(url.pathname)) {
      const file = path.join(publicDir, path.basename(url.pathname))
      const type = url.pathname.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8'
      send(res, 200, fs.readFileSync(file), type)
      return
    }
    send(res, 404, JSON.stringify({ error: 'not found' }))
  } catch (error) {
    send(res, 400, JSON.stringify({ error: error.message || 'bad request' }))
  }
})

server.listen(port, host, () => {
  console.log(`本机编辑  http://${host}:${port}/`)
  console.log(`公开预览  ${previewUrl}`)
})
