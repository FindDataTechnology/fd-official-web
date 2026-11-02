# 官网发布介绍长图页（intro collateral page）

## Why

项目介绍长图（现 `finddata/collateral-2026-10/web/index.html`，单文件 HTML、自带 A4 print 规则）目前只在一个无版本管理的本地目录里，要分享给客户只能传文件或传图，没有可信的公网链接；且页面缺 Open Graph 标签，链接发到微信/飞书只显示裸文字。官网域名是最合适的承载点——物料卖点是「可核」，官方域本身就是背书；而该页零构建（单 HTML 直通），恰好可走 Astro `public/` 透传，不触碰内容树与 i18n。

## What Changes

- 新增 `public/intro/index.html`：介绍长图页作为官网仓库内文件，公网地址 `https://www.finddatatech.cloud/intro/`；Astro 构建零集成（`public/` 原样透传）。
- 页面补分享元数据：`og:title` / `og:description` / `og:image` / `og:type`（+ twitter:card），`og:image` 用随页入库的 `public/intro/og-hero.png`（首屏 hero 截图）。
- 页面声明 `robots: noindex`：公开可达但不进搜索引擎收录、不进 sitemap、不挂官网导航（分享物料，非内容树页面）。
- 单一真源收编：长图正文以官网仓库为唯一真源；原 `collateral-2026-10/web/index.html` 移除，同址留一行指针 README（shots/ 截图工件保留原位）。

## Capabilities

### New Capabilities
- `intro-collateral`: 介绍长图页的公网承载——固定 URL、分享卡片（OG 图入库可解析）、不收录不上导航、零构建直通、单一真源。

### Modified Capabilities

（无——不改动现有 spec 的需求。）

## Impact

- 新增文件：`fd-official-web/public/intro/index.html`、`public/intro/og-hero.png`。
- 删除/降级：`finddata/collateral-2026-10/web/index.html`（改指针 README）。
- 发布链路：现有静态 rsync 线（build-deploy.sh 或新镜像 pod kubectl cp → `/opt/fd/web/dist`）；注意 www 前面还有一层 EdgeOne 缓存，后续更新页面需清缓存或容忍缓存期。
- 不改 `src/`、i18n、Strapi CMS、sitemap 生成面；不涉及构建凭据（`fd-web-build.env`）。
