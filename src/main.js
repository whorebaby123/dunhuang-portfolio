import './styles.css'
import { renderMarkdown, esc } from './markdown.js'

const base = import.meta.env.BASE_URL

const ui = {
  zh: {
    menu: '打开菜单',
    close: '关闭菜单',
    projectsLede: '每件事情按同一条路径来写：问题、判断、我做的部分、可以核对的材料。',
    certificatesLede: '能公开的证明放在这里。原件还没放进仓库的，标题上会标成占位。',
    backProjects: '← 全部项目',
    backCertificates: '← 全部证书',
    missing: '没有这一页',
    missingLede: '链接可能写错了，或是这篇内容已经从仓库里拿走。',
    backHome: '回到首页',
    city: '城市',
    availability: '当前',
    email: '邮箱',
    year: '年份',
    issuer: '签发',
    creditsBefore: '结构参考',
    creditsMid: '。壁画资产来自',
    creditsAfter: '。版式节奏参考歸藏设计的公开指南文字，未收入其 AGPL 代码。',
  },
  en: {
    menu: 'Open menu',
    close: 'Close menu',
    projectsLede: 'Each piece follows the same path: the problem, the decision, my part, and material you can check.',
    certificatesLede: 'Certificates that can be public live here. If the scan is not in the repo yet, the title stays a placeholder.',
    backProjects: '← All work',
    backCertificates: '← All certificates',
    missing: 'This page is not here',
    missingLede: 'The link may be wrong, or the piece has been removed from the repo.',
    backHome: 'Back to the front page',
    city: 'City',
    availability: 'Now',
    email: 'Email',
    year: 'Year',
    issuer: 'Issuer',
    creditsBefore: 'Structure informed by ',
    creditsMid: '. Mural from ',
    creditsAfter: '. Layout pacing follows the Guizang design guidelines as published text; their AGPL files are not included.',
  },
}

const requested = new URLSearchParams(location.search).get('lang')
let lang = requested === 'en' || requested === 'zh'
  ? requested
  : (localStorage.getItem('dh-lang') === 'en' ? 'en' : 'zh')
let content = null
let menuOpen = false

function t(field) {
  if (field == null) return ''
  if (typeof field === 'string') return field
  return field[lang] || field.zh || ''
}

function u(path) {
  return base + String(path || '').replace(/^\//, '')
}

function currentPath() {
  let path = decodeURIComponent(location.pathname)
  const prefix = base.replace(/\/$/, '')
  if (path.startsWith(prefix)) path = path.slice(prefix.length)
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/index\.html$/, '').replace(/\/$/, '')
  return path || '/'
}

async function loadJson(name) {
  const res = await fetch(u(`content/${name}.json`), { cache: 'no-store' })
  if (!res.ok) throw new Error(name)
  return res.json()
}

async function loadText(path) {
  const res = await fetch(u(path), { cache: 'no-store' })
  if (!res.ok) return ''
  return res.text()
}

async function loadContent() {
  const [site, modules, projects, certificates, taxonomy, media, resume] = await Promise.all([
    loadJson('site'),
    loadJson('modules'),
    loadJson('projects'),
    loadJson('certificates'),
    loadJson('taxonomy'),
    loadJson('media'),
    loadJson('resume'),
  ])
  const bodies = {}
  await Promise.all([
    ...projects.flatMap((item) => ['zh', 'en'].map(async (code) => {
      bodies[`projects/${item.slug}.${code}`] = await loadText(`content/projects/${item.slug}.${code}.md`)
    })),
    ...certificates.flatMap((item) => ['zh', 'en'].map(async (code) => {
      bodies[`certificates/${item.slug}.${code}`] = await loadText(`content/certificates/${item.slug}.${code}.md`)
    })),
    ...['zh', 'en'].map(async (code) => {
      bodies[`resume.${code}`] = await loadText(`content/resume.${code}.md`)
    }),
  ])
  content = { site, modules, projects, certificates, taxonomy, media, resume, bodies }
}

function heroModule() {
  return content.modules.find((mod) => mod.type === 'hero' && mod.enabled) || content.modules.find((mod) => mod.type === 'hero')
}

function tagLabel(id) {
  const tag = content.taxonomy.tags.find((item) => item.id === id)
  return tag ? t(tag) : id
}

function metaLine(item) {
  return [t(item.kicker), item.year, t(item.status)].filter(Boolean).join(' ')
}

function nav(active) {
  const name = t(heroModule()?.fields?.name) || t(content.site.emailLabel)
  const links = content.site.nav.map((item) => {
    const current = item.href === '/'
      ? active === '/'
      : active === item.href || active.startsWith(`${item.href}/`)
    return `<a href="${u(item.href)}" ${current ? 'aria-current="page"' : ''}>${esc(t(item))}</a>`
  }).join('')
  return `
    <header class="nav">
      <a class="brand" href="${u('/')}">
        <span class="seal">${esc(content.site.mark || '名')}</span>
        <span class="brand-name">${esc(name)}</span>
      </a>
      <nav class="nav-links" aria-label="primary">${links}</nav>
      <div class="lang">
        <button type="button" data-set-lang="zh" aria-pressed="${lang === 'zh'}">中</button>
        <span class="slash">/</span>
        <button type="button" data-set-lang="en" aria-pressed="${lang === 'en'}">EN</button>
      </div>
      <button class="nav-toggle" type="button" data-menu aria-expanded="${menuOpen}" aria-label="${esc(menuOpen ? ui[lang].close : ui[lang].menu)}">
        <span></span><span></span><span></span>
      </button>
    </header>
    <div class="nav-panel">${links}</div>
  `
}

function footer() {
  const copy = ui[lang]
  return `
    <footer class="site-footer">
      ${esc(copy.creditsBefore)}
      <a href="https://github.com/gmkrxb/evidentfolio">EvidentFolio</a>（MIT）
      ${esc(copy.creditsMid)}
      <a href="https://github.com/whorebaby123/design-dunhuang-vault-websites">深青穹顶</a>
      ${esc(copy.creditsAfter)}
      <a href="https://github.com/op7418/dsh-guizang-design">歸藏设计</a>
    </footer>
  `
}

function shell(active, inner) {
  return `<div class="frame">${nav(active)}<div class="shell"><main>${inner}</main>${footer()}</div></div>`
}

function eyebrow(text) {
  return `<p class="eyebrow"><i class="rule"></i><span>${esc(text)}</span></p>`
}

function lines(text) {
  return esc(text).replace(/\n/g, '<br />')
}

function coverSrc(item) {
  const path = item.cover || 'assets/approved-mural.png'
  return u(path)
}

function projectCard(item) {
  return `
    <a class="card" href="${u(`projects/${item.slug}`)}">
      <img src="${coverSrc(item)}" alt="" style="object-position:${esc(item.coverPosition || '70% 40%')}" />
      <div class="card-body">
        <p class="kicker">${esc(metaLine(item))}</p>
        <h3 class="card-title">${esc(t(item.title))}</h3>
      </div>
    </a>
  `
}

function renderHero(mod) {
  const fields = mod.fields || {}
  const eyebrowText = t(fields.eyebrow) || t(fields.name)
  const roles = content.taxonomy.tags.filter((tag) => tag.home).map((tag) => t(tag))
  const resumeFile = lang === 'en' ? 'content/resume.en.md' : 'content/resume.zh.md'
  const downloadName = t(content.resume.filename) || 'resume.md'
  return `
    <section class="hero">
      ${eyebrow(eyebrowText)}
      <h1>${lines(t(fields.headline))}</h1>
      <p class="lede">${esc(t(fields.lede))}</p>
      <div class="actions">
        <a class="btn" href="${u('projects')}">${esc(t(fields.primaryCta))}</a>
        <a class="btn" href="${u(resumeFile)}" download="${esc(downloadName)}">${esc(t(fields.secondaryCta))}</a>
      </div>
      ${roles.length ? `<p class="roles">${esc(roles.join(' · '))}</p>` : ''}
    </section>
  `
}

function renderFeatured(mod) {
  const items = content.projects.filter((item) => item.featured)
  if (!items.length) return ''
  return `
    <section class="block" id="featured">
      <h2>${esc(t(mod.fields?.title) || (lang === 'en' ? 'Selected work' : '精选项目'))}</h2>
      <div class="cards">${items.map(projectCard).join('')}</div>
    </section>
  `
}

function renderProse(mod) {
  const body = t(mod.fields?.body)
  return `
    <section class="block prose">
      ${t(mod.fields?.title) ? `<h2>${esc(t(mod.fields.title))}</h2>` : ''}
      ${renderMarkdown(body)}
    </section>
  `
}

function renderCertStrip(mod) {
  const items = content.certificates.slice(0, 3)
  if (!items.length) return ''
  return `
    <section class="block">
      <h2>${esc(t(mod.fields?.title))}</h2>
      ${items.map((item) => `
        <a class="plain-row" href="${u(`certificates/${item.slug}`)}">
          <p class="meta-line">${esc(item.year)}</p>
          <h3 class="card-title">${esc(t(item.title))}</h3>
        </a>
      `).join('')}
    </section>
  `
}

function renderHome() {
  const parts = content.modules.map((mod) => {
    if (!mod.enabled) return ''
    if (mod.type === 'hero') return renderHero(mod)
    if (mod.type === 'featured') return renderFeatured(mod)
    if (mod.type === 'prose') return renderProse(mod)
    if (mod.type === 'certificates') return renderCertStrip(mod)
    return ''
  }).join('')
  return shell('/', parts)
}

function renderProjects() {
  const list = content.projects.map((item) => `
    <a class="row" href="${u(`projects/${item.slug}`)}">
      <img src="${coverSrc(item)}" alt="" style="object-position:${esc(item.coverPosition || '70% 40%')}" />
      <div>
        <p class="kicker">${esc(metaLine(item))}</p>
        <h2>${esc(t(item.title))}</h2>
        <p>${esc(t(item.summary))}</p>
      </div>
    </a>
  `).join('')
  return shell('/projects', `
    <header class="page-head">
      ${eyebrow(lang === 'en' ? 'Work' : '项目')}
      <h1>${lang === 'en' ? 'Work' : '项目'}</h1>
      <p class="lede">${esc(ui[lang].projectsLede)}</p>
    </header>
    <div class="stack block">${list}</div>
  `)
}

function renderProject(slug) {
  const item = content.projects.find((entry) => entry.slug === slug)
  if (!item) return renderMissing()
  const body = content.bodies[`projects/${slug}.${lang}`] || content.bodies[`projects/${slug}.zh`] || ''
  const tags = (item.tags || []).map((id) => `<li>${esc(tagLabel(id))}</li>`).join('')
  return shell('/projects', `
    <a class="back" href="${u('projects')}">${esc(ui[lang].backProjects)}</a>
    <header class="page-head">
      <p class="kicker">${esc(metaLine(item))}</p>
      <h1>${esc(t(item.title))}</h1>
      <p class="lede">${esc(t(item.summary))}</p>
      ${tags ? `<ul class="tags">${tags}</ul>` : ''}
    </header>
    <article class="prose">${renderMarkdown(body)}</article>
  `)
}

function renderCertificates() {
  const list = content.certificates.map((item) => `
    <a class="plain-row" href="${u(`certificates/${item.slug}`)}">
      <p class="meta-line">${esc(item.year)} · ${esc(t(item.issuer))}</p>
      <h2>${esc(t(item.title))}</h2>
      <p class="lede">${esc(t(item.summary))}</p>
    </a>
  `).join('')
  return shell('/certificates', `
    <header class="page-head">
      ${eyebrow(lang === 'en' ? 'Certificates' : '证书')}
      <h1>${lang === 'en' ? 'Certificates' : '证书'}</h1>
      <p class="lede">${esc(ui[lang].certificatesLede)}</p>
    </header>
    <div class="block">${list}</div>
  `)
}

function renderCertificate(slug) {
  const item = content.certificates.find((entry) => entry.slug === slug)
  if (!item) return renderMissing()
  const body = content.bodies[`certificates/${slug}.${lang}`] || ''
  return shell('/certificates', `
    <a class="back" href="${u('certificates')}">${esc(ui[lang].backCertificates)}</a>
    <header class="page-head">
      <p class="kicker">${esc(item.year)}</p>
      <h1>${esc(t(item.title))}</h1>
      <p class="lede">${esc(t(item.summary))}</p>
    </header>
    <dl class="facts">
      <div><dt>${esc(ui[lang].year)}</dt><dd>${esc(item.year)}</dd></div>
      <div><dt>${esc(ui[lang].issuer)}</dt><dd>${esc(t(item.issuer))}</dd></div>
    </dl>
    <article class="prose">${renderMarkdown(body)}</article>
  `)
}

function renderResume() {
  const hero = heroModule()
  const body = content.bodies[`resume.${lang}`] || ''
  const file = lang === 'en' ? 'content/resume.en.md' : 'content/resume.zh.md'
  return shell('/resume', `
    <header class="page-head">
      ${eyebrow(t(hero?.fields?.name))}
      <h1>${esc(t(content.resume.title))}</h1>
      <p class="lede">${esc(t(content.resume.lede))}</p>
      <div class="actions">
        <a class="btn" href="${u(file)}" download="${esc(t(content.resume.filename))}">${esc(t(hero?.fields?.secondaryCta) || (lang === 'en' ? 'Download résumé' : '下载简历'))}</a>
      </div>
    </header>
    <article class="prose">${renderMarkdown(body)}</article>
  `)
}

function renderContact() {
  const hero = heroModule()
  const fields = hero?.fields || {}
  const email = content.site.email || ''
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const label = t(content.site.emailLabel) || email
  return shell('/contact', `
    <header class="page-head">
      ${eyebrow(t(fields.name))}
      <h1>${esc(t(content.site.contactTitle))}</h1>
      <p class="lede">${esc(t(content.site.contactLede))}</p>
    </header>
    <dl class="facts">
      <div><dt>${esc(ui[lang].city)}</dt><dd>${esc(t(fields.city))}</dd></div>
      <div><dt>${esc(ui[lang].availability)}</dt><dd>${esc(t(fields.availability))}</dd></div>
      <div><dt>${esc(ui[lang].email)}</dt><dd>${valid ? `<a href="mailto:${esc(email)}">${esc(label)}</a>` : esc(label)}</dd></div>
    </dl>
  `)
}

function renderMissing() {
  return shell('', `
    <header class="page-head missing">
      <h1>${esc(ui[lang].missing)}</h1>
      <p class="lede">${esc(ui[lang].missingLede)}</p>
      <div class="actions"><a class="btn" href="${u('/')}">${esc(ui[lang].backHome)}</a></div>
    </header>
  `)
}

function renderRoute() {
  const path = currentPath()
  const project = /^\/projects\/([^/]+)$/.exec(path)
  const certificate = /^\/certificates\/([^/]+)$/.exec(path)
  if (path === '/') return renderHome()
  if (path === '/projects') return renderProjects()
  if (project) return renderProject(project[1])
  if (path === '/certificates') return renderCertificates()
  if (certificate) return renderCertificate(certificate[1])
  if (path === '/resume') return renderResume()
  if (path === '/contact') return renderContact()
  return renderMissing()
}

function paint() {
  const hero = heroModule()
  const name = t(hero?.fields?.name) || ''
  const path = currentPath()
  const page = content.site.nav.find((item) => item.href !== '/' && (path === item.href || path.startsWith(`${item.href}/`)))
  document.title = page ? `${t(page)} · ${name}` : name || 'Portfolio'
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
  document.body.classList.toggle('menu-open', menuOpen)
  document.getElementById('app').innerHTML = renderRoute()
}

document.addEventListener('click', (event) => {
  const langButton = event.target.closest('[data-set-lang]')
  if (langButton) {
    lang = langButton.dataset.setLang === 'en' ? 'en' : 'zh'
    localStorage.setItem('dh-lang', lang)
    paint()
    return
  }
  if (event.target.closest('[data-menu]')) {
    menuOpen = !menuOpen
    paint()
    return
  }
  if (event.target.closest('.nav-panel a')) menuOpen = false
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuOpen) {
    menuOpen = false
    paint()
  }
})

loadContent().then(paint).catch((error) => {
  document.getElementById('app').innerHTML = `<p class="noscript">内容没有读出来（${esc(error.message)}）。</p>`
})
