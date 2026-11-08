import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

function walk(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

assert.ok(fs.existsSync(path.join(dist, 'index.html')))
assert.ok(fs.existsSync(path.join(dist, '404.html')))
assert.ok(fs.existsSync(path.join(dist, 'content', 'modules.json')))
assert.ok(fs.existsSync(path.join(dist, 'content', 'projects', 'mural-plates.zh.md')))
assert.ok(fs.statSync(path.join(dist, 'assets', 'approved-mural.png')).size > 1_000_000)
assert.ok(fs.existsSync(path.join(dist, '.nojekyll')))

const banned = ['本机编辑', 'admin/server.js', '127.0.0.1:4317']
for (const file of walk(dist)) {
  if (!/\.(html|js|css|json|svg)$/.test(file)) continue
  const text = fs.readFileSync(file, 'utf8')
  for (const word of banned) {
    assert.ok(!text.includes(word), `${path.relative(dist, file)} contains ${word}`)
  }
}

const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
assert.ok(index.includes('/dunhuang-portfolio/'))
console.log('dist ok')
