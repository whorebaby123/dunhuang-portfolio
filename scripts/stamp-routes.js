import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const index = path.join(dist, 'index.html')
const html = fs.readFileSync(index, 'utf8')

function writeRoute(rel) {
  const dest = path.join(dist, rel)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, html)
}

const projects = JSON.parse(fs.readFileSync(path.join(root, 'content', 'projects.json'), 'utf8'))
const certificates = JSON.parse(fs.readFileSync(path.join(root, 'content', 'certificates.json'), 'utf8'))

writeRoute('404.html')
for (const route of ['projects/index.html', 'certificates/index.html', 'resume/index.html', 'contact/index.html']) {
  writeRoute(route)
}
for (const item of projects) writeRoute(`projects/${item.slug}/index.html`)
for (const item of certificates) writeRoute(`certificates/${item.slug}/index.html`)
