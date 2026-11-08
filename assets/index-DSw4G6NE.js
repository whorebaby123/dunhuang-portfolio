(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function r(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(a){if(a.ep)return;a.ep=!0;const o=r(a);fetch(a.href,o)}})();function s(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function w(e){let t=s(e);return t=t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" rel="noopener noreferrer">$1</a>'),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/(^|[^*])\*([^*]+)\*/g,"$1<em>$2</em>"),t}function j(e){const t=String(e??"").replace(/\r\n/g,`
`).split(`
`);let r="",i=!1;const a=()=>{i&&(r+="</ul>",i=!1)};for(const o of t){if(!o.trim()){a();continue}const d=/^(#{1,3})\s+(.+)$/.exec(o);if(d){a();const p=d[1].length+1;r+=`<h${p}>${w(d[2])}</h${p}>`;continue}const m=/^[-*]\s+(.+)$/.exec(o);if(m){i||(r+="<ul>",i=!0),r+=`<li>${w(m[1])}</li>`;continue}a(),r+=`<p>${w(o)}</p>`}return a(),r}const z="/dunhuang-portfolio/",u={zh:{menu:"打开菜单",close:"关闭菜单",projectsLede:"每件事情按同一条路径来写：问题、判断、我做的部分、可以核对的材料。",certificatesLede:"能公开的证明放在这里。原件还没放进仓库的，标题上会标成占位。",backProjects:"← 全部项目",backCertificates:"← 全部证书",missing:"没有这一页",missingLede:"链接可能写错了，或是这篇内容已经从仓库里拿走。",backHome:"回到首页",city:"城市",availability:"当前",email:"邮箱",year:"年份",issuer:"签发",creditsBefore:"结构参考",creditsMid:"。壁画资产来自",creditsAfter:"。版式节奏参考歸藏设计的公开指南文字，未收入其 AGPL 代码。"},en:{menu:"Open menu",close:"Close menu",projectsLede:"Each piece follows the same path: the problem, the decision, my part, and material you can check.",certificatesLede:"Certificates that can be public live here. If the scan is not in the repo yet, the title stays a placeholder.",backProjects:"← All work",backCertificates:"← All certificates",missing:"This page is not here",missingLede:"The link may be wrong, or the piece has been removed from the repo.",backHome:"Back to the front page",city:"City",availability:"Now",email:"Email",year:"Year",issuer:"Issuer",creditsBefore:"Structure informed by ",creditsMid:". Mural from ",creditsAfter:". Layout pacing follows the Guizang design guidelines as published text; their AGPL files are not included."}},L=new URLSearchParams(location.search).get("lang");let c=L==="en"||L==="zh"?L:localStorage.getItem("dh-lang")==="en"?"en":"zh",l=null,h=!1;function n(e){return e==null?"":typeof e=="string"?e:e[c]||e.zh||""}function f(e){return z+String(e||"").replace(/^\//,"")}function M(){let e=decodeURIComponent(location.pathname);const t=z.replace(/\/$/,"");return e.startsWith(t)&&(e=e.slice(t.length)),e.startsWith("/")||(e=`/${e}`),e=e.replace(/\/index\.html$/,"").replace(/\/$/,""),e||"/"}async function g(e){const t=await fetch(f(`content/${e}.json`),{cache:"no-store"});if(!t.ok)throw new Error(e);return t.json()}async function C(e){const t=await fetch(f(e),{cache:"no-store"});return t.ok?t.text():""}async function S(){const[e,t,r,i,a,o,d]=await Promise.all([g("site"),g("modules"),g("projects"),g("certificates"),g("taxonomy"),g("media"),g("resume")]),m={};await Promise.all([...r.flatMap(p=>["zh","en"].map(async y=>{m[`projects/${p.slug}.${y}`]=await C(`content/projects/${p.slug}.${y}.md`)})),...i.flatMap(p=>["zh","en"].map(async y=>{m[`certificates/${p.slug}.${y}`]=await C(`content/certificates/${p.slug}.${y}.md`)})),...["zh","en"].map(async p=>{m[`resume.${p}`]=await C(`content/resume.${p}.md`)})]),l={site:e,modules:t,projects:r,certificates:i,taxonomy:a,media:o,resume:d,bodies:m}}function k(){return l.modules.find(e=>e.type==="hero"&&e.enabled)||l.modules.find(e=>e.type==="hero")}function I(e){const t=l.taxonomy.tags.find(r=>r.id===e);return t?n(t):e}function P(e){return[n(e.kicker),e.year,n(e.status)].filter(Boolean).join(" ")}function A(e){var i,a;const t=n((a=(i=k())==null?void 0:i.fields)==null?void 0:a.name)||n(l.site.emailLabel),r=l.site.nav.map(o=>{const d=o.href==="/"?e==="/":e===o.href||e.startsWith(`${o.href}/`);return`<a href="${f(o.href)}" ${d?'aria-current="page"':""}>${s(n(o))}</a>`}).join("");return`
    <header class="nav">
      <a class="brand" href="${f("/")}">
        <span class="seal">${s(l.site.mark||"名")}</span>
        <span class="brand-name">${s(t)}</span>
      </a>
      <nav class="nav-links" aria-label="primary">${r}</nav>
      <div class="lang">
        <button type="button" data-set-lang="zh" aria-pressed="${c==="zh"}">中</button>
        <span class="slash">/</span>
        <button type="button" data-set-lang="en" aria-pressed="${c==="en"}">EN</button>
      </div>
      <button class="nav-toggle" type="button" data-menu aria-expanded="${h}" aria-label="${s(h?u[c].close:u[c].menu)}">
        <span></span><span></span><span></span>
      </button>
    </header>
    <div class="nav-panel">${r}</div>
  `}function B(){const e=u[c];return`
    <footer class="site-footer">
      ${s(e.creditsBefore)}
      <a href="https://github.com/gmkrxb/evidentfolio">EvidentFolio</a>（MIT）
      ${s(e.creditsMid)}
      <a href="https://github.com/whorebaby123/design-dunhuang-vault-websites">深青穹顶</a>
      ${s(e.creditsAfter)}
      <a href="https://github.com/op7418/dsh-guizang-design">歸藏设计</a>
    </footer>
  `}function $(e,t){return`<div class="frame">${A(e)}<div class="shell"><main>${t}</main>${B()}</div></div>`}function b(e){return`<p class="eyebrow"><i class="rule"></i><span>${s(e)}</span></p>`}function O(e){return s(e).replace(/\n/g,"<br />")}function E(e){const t=e.cover||"assets/approved-mural.png";return f(t)}function T(e){return`
    <a class="card" href="${f(`projects/${e.slug}`)}">
      <img src="${E(e)}" alt="" style="object-position:${s(e.coverPosition||"70% 40%")}" />
      <div class="card-body">
        <p class="kicker">${s(P(e))}</p>
        <h3 class="card-title">${s(n(e.title))}</h3>
      </div>
    </a>
  `}function H(e){const t=e.fields||{},r=n(t.eyebrow)||n(t.name),i=l.taxonomy.tags.filter(d=>d.home).map(d=>n(d)),a=c==="en"?"content/resume.en.md":"content/resume.zh.md",o=n(l.resume.filename)||"resume.md";return`
    <section class="hero">
      ${b(r)}
      <h1>${O(n(t.headline))}</h1>
      <p class="lede">${s(n(t.lede))}</p>
      <div class="actions">
        <a class="btn" href="${f("projects")}">${s(n(t.primaryCta))}</a>
        <a class="btn" href="${f(a)}" download="${s(o)}">${s(n(t.secondaryCta))}</a>
      </div>
      ${i.length?`<p class="roles">${s(i.join(" · "))}</p>`:""}
    </section>
  `}function N(e){var r;const t=l.projects.filter(i=>i.featured);return t.length?`
    <section class="block" id="featured">
      <h2>${s(n((r=e.fields)==null?void 0:r.title)||(c==="en"?"Selected work":"精选项目"))}</h2>
      <div class="cards">${t.map(T).join("")}</div>
    </section>
  `:""}function W(e){var r,i;const t=n((r=e.fields)==null?void 0:r.body);return`
    <section class="block prose">
      ${n((i=e.fields)==null?void 0:i.title)?`<h2>${s(n(e.fields.title))}</h2>`:""}
      ${j(t)}
    </section>
  `}function F(e){var r;const t=l.certificates.slice(0,3);return t.length?`
    <section class="block">
      <h2>${s(n((r=e.fields)==null?void 0:r.title))}</h2>
      ${t.map(i=>`
        <a class="plain-row" href="${f(`certificates/${i.slug}`)}">
          <p class="meta-line">${s(i.year)}</p>
          <h3 class="card-title">${s(n(i.title))}</h3>
        </a>
      `).join("")}
    </section>
  `:""}function R(){const e=l.modules.map(t=>t.enabled?t.type==="hero"?H(t):t.type==="featured"?N(t):t.type==="prose"?W(t):t.type==="certificates"?F(t):"":"").join("");return $("/",e)}function q(){const e=l.projects.map(t=>`
    <a class="row" href="${f(`projects/${t.slug}`)}">
      <img src="${E(t)}" alt="" style="object-position:${s(t.coverPosition||"70% 40%")}" />
      <div>
        <p class="kicker">${s(P(t))}</p>
        <h2>${s(n(t.title))}</h2>
        <p>${s(n(t.summary))}</p>
      </div>
    </a>
  `).join("");return $("/projects",`
    <header class="page-head">
      ${b(c==="en"?"Work":"项目")}
      <h1>${c==="en"?"Work":"项目"}</h1>
      <p class="lede">${s(u[c].projectsLede)}</p>
    </header>
    <div class="stack block">${e}</div>
  `)}function G(e){const t=l.projects.find(a=>a.slug===e);if(!t)return x();const r=l.bodies[`projects/${e}.${c}`]||l.bodies[`projects/${e}.zh`]||"",i=(t.tags||[]).map(a=>`<li>${s(I(a))}</li>`).join("");return $("/projects",`
    <a class="back" href="${f("projects")}">${s(u[c].backProjects)}</a>
    <header class="page-head">
      <p class="kicker">${s(P(t))}</p>
      <h1>${s(n(t.title))}</h1>
      <p class="lede">${s(n(t.summary))}</p>
      ${i?`<ul class="tags">${i}</ul>`:""}
    </header>
    <article class="prose">${j(r)}</article>
  `)}function U(){const e=l.certificates.map(t=>`
    <a class="plain-row" href="${f(`certificates/${t.slug}`)}">
      <p class="meta-line">${s(t.year)} · ${s(n(t.issuer))}</p>
      <h2>${s(n(t.title))}</h2>
      <p class="lede">${s(n(t.summary))}</p>
    </a>
  `).join("");return $("/certificates",`
    <header class="page-head">
      ${b(c==="en"?"Certificates":"证书")}
      <h1>${c==="en"?"Certificates":"证书"}</h1>
      <p class="lede">${s(u[c].certificatesLede)}</p>
    </header>
    <div class="block">${e}</div>
  `)}function D(e){const t=l.certificates.find(i=>i.slug===e);if(!t)return x();const r=l.bodies[`certificates/${e}.${c}`]||"";return $("/certificates",`
    <a class="back" href="${f("certificates")}">${s(u[c].backCertificates)}</a>
    <header class="page-head">
      <p class="kicker">${s(t.year)}</p>
      <h1>${s(n(t.title))}</h1>
      <p class="lede">${s(n(t.summary))}</p>
    </header>
    <dl class="facts">
      <div><dt>${s(u[c].year)}</dt><dd>${s(t.year)}</dd></div>
      <div><dt>${s(u[c].issuer)}</dt><dd>${s(n(t.issuer))}</dd></div>
    </dl>
    <article class="prose">${j(r)}</article>
  `)}function J(){var i,a;const e=k(),t=l.bodies[`resume.${c}`]||"",r=c==="en"?"content/resume.en.md":"content/resume.zh.md";return $("/resume",`
    <header class="page-head">
      ${b(n((i=e==null?void 0:e.fields)==null?void 0:i.name))}
      <h1>${s(n(l.resume.title))}</h1>
      <p class="lede">${s(n(l.resume.lede))}</p>
      <div class="actions">
        <a class="btn" href="${f(r)}" download="${s(n(l.resume.filename))}">${s(n((a=e==null?void 0:e.fields)==null?void 0:a.secondaryCta)||(c==="en"?"Download résumé":"下载简历"))}</a>
      </div>
    </header>
    <article class="prose">${j(t)}</article>
  `)}function K(){const e=k(),t=(e==null?void 0:e.fields)||{},r=l.site.email||"",i=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r),a=n(l.site.emailLabel)||r;return $("/contact",`
    <header class="page-head">
      ${b(n(t.name))}
      <h1>${s(n(l.site.contactTitle))}</h1>
      <p class="lede">${s(n(l.site.contactLede))}</p>
    </header>
    <dl class="facts">
      <div><dt>${s(u[c].city)}</dt><dd>${s(n(t.city))}</dd></div>
      <div><dt>${s(u[c].availability)}</dt><dd>${s(n(t.availability))}</dd></div>
      <div><dt>${s(u[c].email)}</dt><dd>${i?`<a href="mailto:${s(r)}">${s(a)}</a>`:s(a)}</dd></div>
    </dl>
  `)}function x(){return $("",`
    <header class="page-head missing">
      <h1>${s(u[c].missing)}</h1>
      <p class="lede">${s(u[c].missingLede)}</p>
      <div class="actions"><a class="btn" href="${f("/")}">${s(u[c].backHome)}</a></div>
    </header>
  `)}function Y(){const e=M(),t=/^\/projects\/([^/]+)$/.exec(e),r=/^\/certificates\/([^/]+)$/.exec(e);return e==="/"?R():e==="/projects"?q():t?G(t[1]):e==="/certificates"?U():r?D(r[1]):e==="/resume"?J():e==="/contact"?K():x()}function v(){var a;const e=k(),t=n((a=e==null?void 0:e.fields)==null?void 0:a.name)||"",r=M(),i=l.site.nav.find(o=>o.href!=="/"&&(r===o.href||r.startsWith(`${o.href}/`)));document.title=i?`${n(i)} · ${t}`:t||"Portfolio",document.documentElement.lang=c==="en"?"en":"zh-CN",document.body.classList.toggle("menu-open",h),document.getElementById("app").innerHTML=Y()}document.addEventListener("click",e=>{const t=e.target.closest("[data-set-lang]");if(t){c=t.dataset.setLang==="en"?"en":"zh",localStorage.setItem("dh-lang",c),v();return}if(e.target.closest("[data-menu]")){h=!h,v();return}e.target.closest(".nav-panel a")&&(h=!1)});document.addEventListener("keydown",e=>{e.key==="Escape"&&h&&(h=!1,v())});S().then(v).catch(e=>{document.getElementById("app").innerHTML=`<p class="noscript">内容没有读出来（${s(e.message)}）。</p>`});
