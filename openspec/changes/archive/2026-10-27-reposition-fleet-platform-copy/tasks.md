# Tasks

## 1. 文案（src/i18n.ts，en/zh 各一遍）

- [x] 1.1 `hero.title` / `hero.sub`：agent 集群平台定位句（双语）。
- [x] 1.2 `home.lines.sub` / `apps.sub`：「五线=集群的供给域」副口径（双语）。
- [x] 1.3 `line.base.why`：集群平台+四动词语义；`line.lex/wire/facet/constellation.why`：供给域前缀（双语）。
- [x] 1.4 `line.base.landing.kicker` / `line.base.landing.hero.title` / `line.base.landing.hero.sub`：四动词+萬星上线运行分工（双语）。

## 2. 验收

- [x] 2.1 `pnpm build` 构建绿。
- [x] 2.2 本地起的站（astro preview 或 dev）逐点核对 spec Scenario：`/`、`/zh`、`/products`、`/zh/products`、`/products/base`、`/zh/products/base` 六面。
- [x] 2.3 禁词自扫：对 `src/i18n.ts` 本 change 触及行跑诚实口径扫描（与 docs/marketing/audit.py 的 ABSOLUTE_CLAIM_RE 同式），零命中。
- [x] 2.4 `openspec validate reposition-fleet-platform-copy --strict` 全绿；归档时回到 finddata 根主 change 勾 4.x。
