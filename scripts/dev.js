import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vite = path.join(root, 'node_modules', '.bin', 'vite')

const children = [
  spawn(vite, ['--host', '127.0.0.1', '--port', '5173'], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, ['admin/server.js'], { cwd: root, stdio: 'inherit' }),
]

function stop() {
  for (const child of children) child.kill('SIGTERM')
  process.exit(0)
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

for (const child of children) {
  child.on('exit', (code) => {
    if (code) {
      for (const other of children) other.kill('SIGTERM')
      process.exit(code)
    }
  })
}
