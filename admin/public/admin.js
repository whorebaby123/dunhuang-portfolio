const app = document.getElementById('app')
let data = null
let statusText = '已是最新'
let dirty = false

const NAV = [
  ['modules', '首页模块'],
  ['projects', '项目'],
  ['certificates', '证书'],
  ['resume', '简历'],
  ['taxonomy', '分类与标签'],
  ['media', '媒体'],
  ['site', '站点与联系'],
  ['publish', '发布'],
]

function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ))
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '')
  const parts = hash.split('/').filter(Boolean)
  return { name: parts[0] || 'modules', parts }
}

function bi(value) {
  return { zh: value?.zh || '', en: value?.en || '' }
}

async function api(url, options) {
  const res = await fetch(url, options)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || res.statusText)
  return body
}

async function load() {
  const raw = await api('/api/content')
  data = {
    site: JSON.parse(raw.files['content/site.json']),
    modules: JSON.parse(raw.files['content/modules.json']),
    projects: JSON.parse(raw.files['content/projects.json']),
    certificates: JSON.parse(raw.files['content/certificates.json']),
    taxonomy: JSON.parse(raw.files['content/taxonomy.json']),
    media: JSON.parse(raw.files['content/media.json']),
    resume: JSON.parse(raw.files['content/resume.json']),
    bodies: raw.bodies,
    previewUrl: raw.previewUrl,
  }
  dirty = false
  statusText = '已是最新'
}

async function saveJson(file, value) {
  await api('/api/json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, data: value }),
  })
}

async function saveText(file, text) {
  await api('/api/text', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, text }),
  })
}

async function deleteText(file) {
  await api('/api/text', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file }),
  })
}

function shell(section, inner) {
  const links = NAV.map(([id, label]) => (
    `<a href="#/${id}" ${section === id ? 'aria-current="page"' : ''}>${label}</a>`
  )).join('')
  app.innerHTML = `
    <div class="layout">
      <aside class="side">
        <h1>本机编辑</h1>
        <p class="note">只在这台电脑上运行。公开站点不包含这些页面。</p>
        <nav>
          ${links}
          <a class="preview" href="${esc(data.previewUrl)}" target="_blank" rel="noopener">打开预览</a>
        </nav>
      </aside>
      <div class="main">${inner}</div>
    </div>
  `
}

function field(label, key, value, kind = 'text') {
  const pair = bi(value)
  const control = (code, text) => (
    kind === 'area'
      ? `<textarea data-key="${key}" data-lang="${code}" rows="4">${esc(text)}</textarea>`
      : `<input type="text" data-key="${key}" data-lang="${code}" value="${esc(text)}" />`
  )
  return `
    <label class="field">
      <span class="field-label">${esc(label)}</span>
      <span class="cols">
        <span><span class="col-label">中文</span>${control('zh', pair.zh)}</span>
        <span><span class="col-label">English</span>${control('en', pair.en)}</span>
      </span>
    </label>
  `
}

function readBi(key) {
  const zh = app.querySelector(`[data-key="${key}"][data-lang="zh"]`)
  const en = app.querySelector(`[data-key="${key}"][data-lang="en"]`)
  return { zh: zh.value, en: en.value }
}

function footer(extra = '') {
  return `
    <div class="editor-footer">
      <span class="status ${dirty ? 'dirty' : ''}">${esc(statusText)}</span>
      <span class="inline">${extra}<button class="save" type="button" data-save>保存</button></span>
    </div>
  `
}

function markDirty() {
  dirty = true
  statusText = '有未保存的修改'
  const node = app.querySelector('.status')
  if (node) {
    node.textContent = statusText
    node.classList.add('dirty')
  }
}

function move(list, index, dir) {
  const next = index + dir
  if (next < 0 || next >= list.length) return list
  const copy = list.slice()
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

function listPage(title, help, items, actions) {
  shell(route().name, `
    <h2 class="page-title">${esc(title)}</h2>
    <p class="help">${help}</p>
    <div class="list">${items}</div>
    ${actions || ''}
  `)
}

function renderModules() {
  const { parts } = route()
  if (parts[1]) return renderModule(parts[1])
  const items = data.modules.map((mod, index) => `
    <article class="item">
      <div class="row-actions">
        <button class="ghost" type="button" data-move="modules" data-index="${index}" data-dir="-1">上移</button>
        <button class="ghost" type="button" data-move="modules" data-index="${index}" data-dir="1">下移</button>
      </div>
      <div>
        <h3>${esc(mod.label?.zh || mod.id)}</h3>
        <p>${esc(mod.id)} · ${mod.enabled ? '在首页显示' : '已从首页隐藏'}</p>
      </div>
      <div class="row-actions">
        <a class="ghost" href="#/modules/${esc(mod.id)}">编辑</a>
        <button class="danger" type="button" data-remove-module="${esc(mod.id)}">删除</button>
      </div>
    </article>
  `).join('')
  listPage('全部模块', '首页按这里的顺序往下排。添加、删除和排序都会直接写入 <code>content/modules.json</code>。', items, `
    <div class="add-row">
      <select id="module-type">
        <option value="prose">一段文字</option>
        <option value="hero">首屏 / 身份</option>
        <option value="featured">精选项目</option>
        <option value="certificates">证书摘录</option>
      </select>
      <button class="save" type="button" data-add-module>添加模块</button>
    </div>
  `)
}

function renderModule(id) {
  const mod = data.modules.find((item) => item.id === id)
  if (!mod) {
    shell('modules', `<p class="error">没有这个模块。</p>`)
    return
  }
  const fields = mod.fields || {}
  let form = ''
  if (mod.type === 'hero') {
    form = [
      field('页眉和首屏上的名字', 'name', fields.name),
      field('城市', 'city', fields.city),
      field('当前是否接受合作', 'availability', fields.availability),
      field('眉题', 'eyebrow', fields.eyebrow),
      field('大标题', 'headline', fields.headline, 'area'),
      field('导语', 'lede', fields.lede, 'area'),
      field('主按钮', 'primaryCta', fields.primaryCta),
      field('次按钮', 'secondaryCta', fields.secondaryCta),
    ].join('')
  } else if (mod.type === 'featured' || mod.type === 'certificates') {
    form = field('标题', 'title', fields.title)
  } else {
    form = [
      field('标题', 'title', fields.title),
      field('正文', 'body', fields.body, 'area'),
    ].join('')
  }
  shell('modules', `
    <a class="back" href="#/modules">← 全部模块</a>
    <h2 class="page-title">${esc(mod.label?.zh || mod.id)}</h2>
    <p class="help">${esc(mod.id)}。保存后写入仓库里的 JSON，预览页刷新即可看到。</p>
    <label class="check"><input type="checkbox" data-enabled ${mod.enabled ? 'checked' : ''} /> 在首页显示</label>
    ${form}
    ${footer()}
  `)
}

function collectionList(kind, title, help, file) {
  const items = data[kind].map((item, index) => `
    <article class="item">
      <div class="row-actions">
        <button class="ghost" type="button" data-move="${kind}" data-index="${index}" data-dir="-1">上移</button>
        <button class="ghost" type="button" data-move="${kind}" data-index="${index}" data-dir="1">下移</button>
      </div>
      <div>
        <h3>${esc(item.title?.zh || item.slug)}</h3>
        <p>${esc(item.slug)}${item.year ? ` · ${esc(item.year)}` : ''}${item.featured ? ' · 精选' : ''}</p>
      </div>
      <div class="row-actions">
        <a class="ghost" href="#/${kind}/${esc(item.slug)}">编辑</a>
        <button class="danger" type="button" data-remove="${kind}" data-slug="${esc(item.slug)}">删除</button>
      </div>
    </article>
  `).join('')
  listPage(title, `${help} 顺序写入 <code>${file}</code>。`, items, `
    <div class="add-row">
      <input id="new-slug" class="single" type="text" placeholder="slug，例如 field-notes" />
      <button class="save" type="button" data-add="${kind}">添加</button>
    </div>
  `)
}

function renderProjects() {
  if (route().parts[1]) return renderProject(route().parts[1])
  collectionList('projects', '项目', '精选项目出现在首页。正文是 Markdown。', 'content/projects.json')
}

function renderCertificates() {
  if (route().parts[1]) return renderCertificate(route().parts[1])
  collectionList('certificates', '证书', '证书页按这个顺序排列。', 'content/certificates.json')
}

function tagChecks(selected) {
  return data.taxonomy.tags.map((tag) => `
    <label class="check">
      <input type="checkbox" data-tag="${esc(tag.id)}" ${(selected || []).includes(tag.id) ? 'checked' : ''} />
      ${esc(tag.zh)}
    </label>
  `).join('')
}

function renderProject(slug) {
  const item = data.projects.find((entry) => entry.slug === slug)
  if (!item) {
    shell('projects', `<p class="error">没有这个项目。</p>`)
    return
  }
  shell('projects', `
    <a class="back" href="#/projects">← 全部项目</a>
    <h2 class="page-title">${esc(item.title?.zh || slug)}</h2>
    <p class="help">${esc(slug)}。字段写入 content/projects.json，正文写入 content/projects/${esc(slug)}.zh.md 与 .en.md。</p>
    <label class="check"><input type="checkbox" data-featured ${item.featured ? 'checked' : ''} /> 放进首页精选</label>
    <label class="field"><span class="field-label">年份</span><input class="single" data-plain="year" type="text" value="${esc(item.year || '')}" /></label>
    ${field('眉题', 'kicker', item.kicker)}
    ${field('状态', 'status', item.status)}
    ${field('标题', 'title', item.title)}
    ${field('摘要', 'summary', item.summary, 'area')}
    <label class="field"><span class="field-label">封面路径</span><input class="single" data-plain="cover" type="text" value="${esc(item.cover || 'assets/approved-mural.png')}" /></label>
    <label class="field"><span class="field-label">封面裁切（object-position）</span><input class="single" data-plain="coverPosition" type="text" value="${esc(item.coverPosition || '70% 40%')}" /></label>
    <div class="field"><span class="field-label">标签</span>${tagChecks(item.tags)}</div>
    <label class="field">
      <span class="field-label">正文 · 中文 Markdown</span>
      <textarea class="code" data-body="zh">${esc(data.bodies[`content/projects/${slug}.zh.md`] || '')}</textarea>
    </label>
    <label class="field">
      <span class="field-label">正文 · English Markdown</span>
      <textarea class="code" data-body="en">${esc(data.bodies[`content/projects/${slug}.en.md`] || '')}</textarea>
    </label>
    ${footer()}
  `)
}

function renderCertificate(slug) {
  const item = data.certificates.find((entry) => entry.slug === slug)
  if (!item) {
    shell('certificates', `<p class="error">没有这个证书。</p>`)
    return
  }
  shell('certificates', `
    <a class="back" href="#/certificates">← 全部证书</a>
    <h2 class="page-title">${esc(item.title?.zh || slug)}</h2>
    <p class="help">${esc(slug)}。保存后写入 content/certificates.json 和对应的 Markdown。</p>
    <label class="field"><span class="field-label">年份</span><input class="single" data-plain="year" type="text" value="${esc(item.year || '')}" /></label>
    ${field('标题', 'title', item.title)}
    ${field('签发方', 'issuer', item.issuer)}
    ${field('摘要', 'summary', item.summary, 'area')}
    <label class="field">
      <span class="field-label">说明 · 中文</span>
      <textarea class="code" data-body="zh">${esc(data.bodies[`content/certificates/${slug}.zh.md`] || '')}</textarea>
    </label>
    <label class="field">
      <span class="field-label">说明 · English</span>
      <textarea class="code" data-body="en">${esc(data.bodies[`content/certificates/${slug}.en.md`] || '')}</textarea>
    </label>
    ${footer()}
  `)
}

function renderResume() {
  shell('resume', `
    <h2 class="page-title">简历</h2>
    <p class="help">页眉写入 content/resume.json。正文是 content/resume.zh.md 与 content/resume.en.md，也是首页「下载简历」拿到的文件。</p>
    ${field('标题', 'title', data.resume.title)}
    ${field('导语', 'lede', data.resume.lede, 'area')}
    ${field('下载文件名', 'filename', data.resume.filename)}
    <label class="field">
      <span class="field-label">正文 · 中文</span>
      <textarea class="code" data-body="zh">${esc(data.bodies['content/resume.zh.md'] || '')}</textarea>
    </label>
    <label class="field">
      <span class="field-label">正文 · English</span>
      <textarea class="code" data-body="en">${esc(data.bodies['content/resume.en.md'] || '')}</textarea>
    </label>
    ${footer()}
  `)
}

function renderTaxonomy() {
  const rows = data.taxonomy.tags.map((tag, index) => `
    <tr>
      <td><input data-tag-id="${index}" type="text" value="${esc(tag.id)}" /></td>
      <td><input data-tag-zh="${index}" type="text" value="${esc(tag.zh)}" /></td>
      <td><input data-tag-en="${index}" type="text" value="${esc(tag.en)}" /></td>
      <td><input data-tag-home="${index}" type="checkbox" ${tag.home ? 'checked' : ''} /></td>
      <td class="row-actions">
        <button class="ghost" type="button" data-move="tags" data-index="${index}" data-dir="-1">上移</button>
        <button class="ghost" type="button" data-move="tags" data-index="${index}" data-dir="1">下移</button>
        <button class="danger" type="button" data-remove-tag="${index}">删除</button>
      </td>
    </tr>
  `).join('')
  shell('taxonomy', `
    <h2 class="page-title">分类与标签</h2>
    <p class="help">勾选「首页」的标签会用间隔号排在首屏按钮下面。保存写入 content/taxonomy.json。</p>
    <table class="tag-table">
      <thead><tr><th>id</th><th>中文</th><th>English</th><th>首页</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="add-row" style="margin-top:14px">
      <button class="ghost" type="button" data-add-tag>添加标签</button>
    </div>
    ${footer()}
  `)
}

function renderMedia() {
  const cards = data.media.items.map((item, index) => `
    <article class="media-card">
      <img src="/${esc(item.path)}" alt="" />
      <div>
        <label class="field"><span class="field-label">路径</span><input data-media-path="${index}" type="text" value="${esc(item.path)}" /></label>
        ${field('替代文字', `alt-${index}`, item.alt)}
        ${field('来源说明', `credit-${index}`, item.credit)}
        <button class="danger" type="button" data-remove-media="${index}">从列表移除</button>
      </div>
    </article>
  `).join('')
  shell('media', `
    <h2 class="page-title">媒体</h2>
    <p class="help">公开页使用仓库里的 <code>assets/approved-mural.png</code>。把新文件放进 <code>assets/</code> 后，在这里登记路径。列表写入 content/media.json。</p>
    ${cards || '<p class="help">还没有登记文件。</p>'}
    <button class="ghost" type="button" data-add-media>登记一条</button>
    ${footer()}
  `)
}

function renderSite() {
  const navFields = data.site.nav.map((item, index) => field(item.href, `nav-${index}`, item)).join('')
  shell('site', `
    <h2 class="page-title">站点与联系</h2>
    <p class="help">名字、城市和是否合作写在「首页模块 / 首屏」。这里管标志字、邮箱、联系页导语和导航用词。写入 content/site.json。</p>
    <label class="field"><span class="field-label">标志字</span><input class="single" data-plain="mark" type="text" value="${esc(data.site.mark || '')}" /></label>
    <label class="field"><span class="field-label">邮箱</span><input class="single" data-plain="email" type="text" value="${esc(data.site.email || '')}" /></label>
    ${field('邮箱显示', 'emailLabel', data.site.emailLabel)}
    ${field('联系页标题', 'contactTitle', data.site.contactTitle)}
    ${field('联系页导语', 'contactLede', data.site.contactLede, 'area')}
    <p class="field-label">导航</p>
    ${navFields}
    ${footer()}
  `)
}

function renderPublish() {
  shell('publish', `
    <h2 class="page-title">发布</h2>
    <p class="help">公开构建只有静态页。后台不会被打进 dist/。</p>
    <ol class="steps">
      <li>在本机确认预览：<a href="${esc(data.previewUrl)}" target="_blank" rel="noopener">${esc(data.previewUrl)}</a></li>
      <li>在仓库根目录运行 <code>npm run publish</code></li>
      <li>脚本会构建 <code>dist/</code>，并把它推到 <code>gh-pages</code> 分支的根目录。</li>
      <li>Pages 站点路径是 <code>/dunhuang-portfolio/</code>。</li>
    </ol>
  `)
}

function paint() {
  const { name } = route()
  if (name === 'modules') renderModules()
  else if (name === 'projects') renderProjects()
  else if (name === 'certificates') renderCertificates()
  else if (name === 'resume') renderResume()
  else if (name === 'taxonomy') renderTaxonomy()
  else if (name === 'media') renderMedia()
  else if (name === 'site') renderSite()
  else if (name === 'publish') renderPublish()
  else renderModules()
}

async function refresh() {
  await load()
  paint()
}

app.addEventListener('input', (event) => {
  if (event.target.matches('input, textarea, select')) markDirty()
})

app.addEventListener('click', async (event) => {
  const button = event.target.closest('button')
  if (!button) return
  try {
    if (button.dataset.move) {
      const dir = Number(button.dataset.dir)
      const index = Number(button.dataset.index)
      if (button.dataset.move === 'modules') {
        data.modules = move(data.modules, index, dir)
        await saveJson('content/modules.json', data.modules)
      } else if (button.dataset.move === 'tags') {
        data.taxonomy.tags = move(data.taxonomy.tags, index, dir)
        await saveJson('content/taxonomy.json', data.taxonomy)
      } else {
        const key = button.dataset.move
        data[key] = move(data[key], index, dir)
        await saveJson(`content/${key}.json`, data[key])
      }
      await refresh()
      return
    }
    if (button.dataset.addModule != null) {
      const type = document.getElementById('module-type').value
      await api('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      await refresh()
      return
    }
    if (button.dataset.removeModule) {
      if (!confirm('从首页模块里删除这一条？')) return
      data.modules = data.modules.filter((item) => item.id !== button.dataset.removeModule)
      await saveJson('content/modules.json', data.modules)
      location.hash = '#/modules'
      await refresh()
      return
    }
    if (button.dataset.add === 'projects' || button.dataset.add === 'certificates') {
      const kind = button.dataset.add
      const slug = document.getElementById('new-slug').value.trim()
      if (!/^[a-z0-9-]{1,64}$/.test(slug)) {
        alert('slug 只能用小写字母、数字和连字符。')
        return
      }
      if (data[kind].some((item) => item.slug === slug)) {
        alert('这个 slug 已经有了。')
        return
      }
      const blank = kind === 'projects'
        ? {
          slug, featured: false, year: '', kicker: { zh: '', en: '' }, status: { zh: '', en: '' },
          title: { zh: '【占位】新项目', en: '[Placeholder] New project' },
          summary: { zh: '', en: '' }, tags: [], cover: 'assets/approved-mural.png', coverPosition: '70% 40%',
        }
        : {
          slug, year: '', title: { zh: '【占位】新证书', en: '[Placeholder] New certificate' },
          issuer: { zh: '', en: '' }, summary: { zh: '', en: '' },
        }
      data[kind].push(blank)
      await saveJson(`content/${kind}.json`, data[kind])
      const folder = kind === 'projects' ? 'projects' : 'certificates'
      await saveText(`content/${folder}/${slug}.zh.md`, '')
      await saveText(`content/${folder}/${slug}.en.md`, '')
      location.hash = `#/${kind}/${slug}`
      await refresh()
      return
    }
    if (button.dataset.remove) {
      const kind = button.dataset.remove
      const slug = button.dataset.slug
      if (!confirm(`删除 ${slug}？`)) return
      data[kind] = data[kind].filter((item) => item.slug !== slug)
      await saveJson(`content/${kind}.json`, data[kind])
      const folder = kind === 'projects' ? 'projects' : 'certificates'
      await deleteText(`content/${folder}/${slug}.zh.md`)
      await deleteText(`content/${folder}/${slug}.en.md`)
      location.hash = `#/${kind}`
      await refresh()
      return
    }
    if (button.dataset.addTag != null) {
      data.taxonomy.tags.push({ id: 'tag', zh: '新标签', en: 'New tag', home: false })
      markDirty()
      paint()
      return
    }
    if (button.dataset.removeTag != null) {
      data.taxonomy.tags.splice(Number(button.dataset.removeTag), 1)
      await saveJson('content/taxonomy.json', data.taxonomy)
      await refresh()
      return
    }
    if (button.dataset.addMedia != null) {
      data.media.items.push({
        path: 'assets/approved-mural.png',
        alt: { zh: '', en: '' },
        credit: { zh: '', en: '' },
      })
      markDirty()
      paint()
      return
    }
    if (button.dataset.removeMedia != null) {
      data.media.items.splice(Number(button.dataset.removeMedia), 1)
      markDirty()
      paint()
      return
    }
    if (button.dataset.save != null) await saveCurrent()
  } catch (error) {
    alert(error.message)
  }
})

async function saveCurrent() {
  const { name, parts } = route()
  if (name === 'modules' && parts[1]) {
    const mod = data.modules.find((item) => item.id === parts[1])
    mod.enabled = Boolean(app.querySelector('[data-enabled]')?.checked)
    const keys = [...app.querySelectorAll('[data-key]')].map((node) => node.dataset.key)
    for (const key of new Set(keys)) mod.fields[key] = readBi(key)
    await saveJson('content/modules.json', data.modules)
  } else if (name === 'projects' && parts[1]) {
    const item = data.projects.find((entry) => entry.slug === parts[1])
    item.featured = Boolean(app.querySelector('[data-featured]')?.checked)
    item.year = app.querySelector('[data-plain="year"]').value
    item.cover = app.querySelector('[data-plain="cover"]').value.trim() || 'assets/approved-mural.png'
    item.coverPosition = app.querySelector('[data-plain="coverPosition"]').value
    for (const key of ['kicker', 'status', 'title', 'summary']) item[key] = readBi(key)
    item.tags = [...app.querySelectorAll('[data-tag]:checked')].map((node) => node.dataset.tag)
    await saveJson('content/projects.json', data.projects)
    await saveText(`content/projects/${item.slug}.zh.md`, app.querySelector('[data-body="zh"]').value)
    await saveText(`content/projects/${item.slug}.en.md`, app.querySelector('[data-body="en"]').value)
  } else if (name === 'certificates' && parts[1]) {
    const item = data.certificates.find((entry) => entry.slug === parts[1])
    item.year = app.querySelector('[data-plain="year"]').value
    for (const key of ['title', 'issuer', 'summary']) item[key] = readBi(key)
    await saveJson('content/certificates.json', data.certificates)
    await saveText(`content/certificates/${item.slug}.zh.md`, app.querySelector('[data-body="zh"]').value)
    await saveText(`content/certificates/${item.slug}.en.md`, app.querySelector('[data-body="en"]').value)
  } else if (name === 'resume') {
    for (const key of ['title', 'lede', 'filename']) data.resume[key] = readBi(key)
    await saveJson('content/resume.json', data.resume)
    await saveText('content/resume.zh.md', app.querySelector('[data-body="zh"]').value)
    await saveText('content/resume.en.md', app.querySelector('[data-body="en"]').value)
  } else if (name === 'taxonomy') {
    data.taxonomy.tags = data.taxonomy.tags.map((tag, index) => ({
      id: app.querySelector(`[data-tag-id="${index}"]`).value.trim(),
      zh: app.querySelector(`[data-tag-zh="${index}"]`).value,
      en: app.querySelector(`[data-tag-en="${index}"]`).value,
      home: app.querySelector(`[data-tag-home="${index}"]`).checked,
    })).filter((tag) => /^[a-z0-9-]{1,64}$/.test(tag.id))
    await saveJson('content/taxonomy.json', data.taxonomy)
  } else if (name === 'media') {
    data.media.items = data.media.items.map((item, index) => ({
      path: app.querySelector(`[data-media-path="${index}"]`).value.trim(),
      alt: readBi(`alt-${index}`),
      credit: readBi(`credit-${index}`),
    })).filter((item) => item.path && !item.path.includes('..'))
    await saveJson('content/media.json', data.media)
  } else if (name === 'site') {
    data.site.mark = app.querySelector('[data-plain="mark"]').value
    data.site.email = app.querySelector('[data-plain="email"]').value.trim()
    data.site.emailLabel = readBi('emailLabel')
    data.site.contactTitle = readBi('contactTitle')
    data.site.contactLede = readBi('contactLede')
    data.site.nav = data.site.nav.map((item, index) => ({
      ...item,
      ...readBi(`nav-${index}`),
    }))
    await saveJson('content/site.json', data.site)
  }
  statusText = '已写入仓库'
  dirty = false
  paint()
  statusText = '已是最新'
}

window.addEventListener('hashchange', paint)

refresh().catch((error) => {
  app.innerHTML = `<p class="error">${esc(error.message)}</p>`
})
