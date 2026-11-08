# 敦煌色个人作品集

深青底、右侧大幅裁切的莲瓣云气，左边是可以改写的个人站。内容放在 JSON 和 Markdown 里。本机编辑器只监听 `127.0.0.1`，公开构建里没有后台。

English notes are below.

## 本地

```bash
npm install
npm run dev
```

- 公开页：<http://127.0.0.1:5173/dunhuang-portfolio/>
- 本机编辑：<http://127.0.0.1:4317/>

编辑页可以增删、排序首页模块，并改项目、证书、简历、标签、媒体和联系信息。保存直接写回仓库里的文件。预览页刷新后即可看到。

只开编辑器：`npm run admin`。只构建：`npm run build`，然后 `npm run preview`。

## 内容

| 文件 | 作用 |
| --- | --- |
| `content/modules.json` | 首页模块顺序、显隐和首屏文案 |
| `content/projects.json` 与 `content/projects/*.md` | 项目字段和正文 |
| `content/certificates.json` 与 `content/certificates/*.md` | 证书 |
| `content/resume.json` 与 `content/resume.zh.md` / `resume.en.md` | 简历，也是「下载简历」的文件 |
| `content/taxonomy.json` | 标签；勾选「首页」的会出现在按钮下方 |
| `content/site.json` | 标志字、导航、邮箱、联系页 |
| `content/media.json` | 已登记的图片路径和替代文字 |
| `assets/approved-mural.png` | 首屏与项目卡片使用的壁画 |

中文 / English 都在这些文件里。眉题留空时，首屏短行回退到名字。

## 发布到 GitHub Pages

```bash
npm run publish
```

这会构建 `dist/`，并把它推到 `gh-pages` 分支的根目录。站点基路径是 `/dunhuang-portfolio/`。

构建结果里没有本机编辑器，也没有 `/admin` 路由。

## 致谢

- 栏目结构（首页、项目、证书、简历、联系，以及按模块编辑）参考 [EvidentFolio](https://github.com/gmkrxb/evidentfolio)，该项目以 MIT 许可发布。这里是独立实现，不是它的分支或衍生代码。
- 首屏壁画使用 [design-dunhuang-vault-websites](https://github.com/whorebaby123/design-dunhuang-vault-websites) 中已确认的「深青穹顶」资产 `assets/approved-mural.png`。色面是深青底、杏粉与玉绿矿物色，纹样裁切在右侧。
- 正文的行长、标题层级和留白节奏参考 [歸藏设计 / dsh-guizang-design](https://github.com/op7418/dsh-guizang-design) 公开说明里的文字原则。没有复制其中任何 AGPL 代码、模板或样式文件。

## English

A personal site on a deep-teal ground, with the approved Dunhuang lotus-and-cloud mural cropped on the right. Copy lives in JSON and Markdown. The editor binds to localhost only and is not part of the static build.

```bash
npm install
npm run dev
```

Public page: <http://127.0.0.1:5173/dunhuang-portfolio/>  
Local editor: <http://127.0.0.1:4317/>

`npm run publish` builds `dist/` and pushes that folder to the root of `gh-pages`. The Pages base path is `/dunhuang-portfolio/`.

### Credits

- Information architecture — home, work, certificates, résumé, contact, and editable modules — is informed by [EvidentFolio](https://github.com/gmkrxb/evidentfolio) (MIT). This repository is a separate implementation.
- The mural is `assets/approved-mural.png` from [design-dunhuang-vault-websites](https://github.com/whorebaby123/design-dunhuang-vault-websites), the approved “深青穹顶” study.
- Measure, heading scale, and quiet spacing follow the published text of the [Guizang design guidelines](https://github.com/op7418/dsh-guizang-design). No AGPL source, template, or stylesheet from that project is included.
