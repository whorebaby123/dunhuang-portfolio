function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ))
}

function inline(text) {
  let s = esc(text)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  return s
}

export function renderMarkdown(src) {
  const lines = String(src ?? '').replace(/\r\n/g, '\n').split('\n')
  let html = ''
  let list = false
  const flush = () => {
    if (list) {
      html += '</ul>'
      list = false
    }
  }
  for (const line of lines) {
    if (!line.trim()) {
      flush()
      continue
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      flush()
      const level = heading[1].length + 1
      html += `<h${level}>${inline(heading[2])}</h${level}>`
      continue
    }
    const item = /^[-*]\s+(.+)$/.exec(line)
    if (item) {
      if (!list) {
        html += '<ul>'
        list = true
      }
      html += `<li>${inline(item[1])}</li>`
      continue
    }
    flush()
    html += `<p>${inline(line)}</p>`
  }
  flush()
  return html
}

export { esc }
