import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html is missing. Run npm run build first.')
  process.exit(1)
}

const author = execSync('git log -1 --format=%an', { cwd: root, encoding: 'utf8' }).trim() || 'cursoragent'
const email = execSync('git log -1 --format=%ae', { cwd: root, encoding: 'utf8' }).trim() || 'cursoragent@cursor.com'
const remote = execSync('git remote get-url origin', { cwd: root, encoding: 'utf8' }).trim()
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dh-pages-'))

fs.cpSync(dist, tmp, { recursive: true })
const git = (args) => execSync(`git ${args}`, {
  cwd: tmp,
  stdio: 'inherit',
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
})

git('init -b gh-pages')
git('add -A')
git(`-c user.name=${JSON.stringify(author)} -c user.email=${JSON.stringify(email)} commit -m ${JSON.stringify('Publish dunhuang-portfolio')}`)
git(`push -f ${JSON.stringify(remote)} HEAD:gh-pages`)
console.log('pushed dist/ to gh-pages')
