## 1. 入库长图页（单一真源）

- [x] 1.1 从 `finddata/collateral-2026-10/web/index.html` 复制页面到 `public/intro/index.html`，验证：两文件 `diff` 无差异
- [x] 1.2 在 `public/intro/index.html` 的 `<head>` 补 OG 与不收录元数据：`og:title`、`og:description`、`og:type=website`、`og:image=https://www.finddatatech.cloud/intro/og-hero.png`、`twitter:card=summary_large_image`、`<meta name="robots" content="noindex">`，验证：grep 六项均在 `</head>` 之前
- [x] 1.3 生成 `public/intro/og-hero.png`（从 `collateral-2026-10/web/shots/desktop-hero.png` 裁出首屏 1200×833 比例图），验证：`sips` 宽高比 ≈ 1.44–1.45 且文件 ≤ 1MB
- [x] 1.4 删除 `finddata/collateral-2026-10/web/index.html`，在同址写 `README.md` 一行指针（真源 = `fd-official-web/public/intro/index.html`），验证：`ls` 显示 web/ 只剩 README.md 与 shots/
- [x] 1.5 `git add public/intro/` 并提交（仅显式路径，勿 `git add -A`），验证：`git show --stat` 恰含两个新文件

## 2. 构建校验

- [ ] 2.1 `npm run build`（本地无 CMS/网络凭据时按现有构建降级路径执行），验证：`dist/intro/index.html` 与 `dist/intro/og-hero.png` 存在且与源文件逐字节一致
- [ ] 2.2 grep `dist/sitemap*.xml` 与 `dist/**/*.html`，验证：sitemap 无 `/intro/` 条目、站内内容页无指向 `/intro/` 的 `<a>`

## 3. 发布（在役静态 rsync 线）

- [ ] 3.1 push `fd-official-web` main → 触发 GitHub Actions `image` workflow，验证：Actions 页该 run 为绿色
- [ ] 3.2 从新镜像 pod `kubectl cp /usr/share/nginx/html/intro` 到 web 机（124.220.7.175）`/opt/fd/web/dist/intro/`（目录先建后拷，非覆盖式删除；回滚=删除 `dist/intro` 与 `dist/intro/og-hero.png` 两新路径，不碰其余），验证：宿主机 `ls /opt/fd/web/dist/intro/` 两文件在位
- [ ] 3.3 公网验证（`curl -L`），验证：`https://www.finddatatech.cloud/intro/` 返回 200 + HTML 含 H1 文本；`/intro/og-hero.png` 返回 200 + image content-type；EdgeOne 若命中旧缓存（404）则执行一次 URL 刷新后重测

## 4. 结项

- [ ] 4.1 `openspec validate add-intro-collateral-page --strict` 通过并归档（`openspec archive`），验证：命令退出码 0
