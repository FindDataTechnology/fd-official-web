# 验证留痕 — official-web-content-truth

时间：2026-10-06（本地实施与核验）

## 入口可达性探针（任务 1.3）

| 目标 | 方式 | 结果 | 处置 |
|---|---|---|---|
| `http://23.144.68.246:30830`（law-bench 旧演示址） | `curl -s -o /dev/null -m 12 -w "%{http_code}"` | `000`（连接失败，两次独立探测一致） | 死链移除 |
| `https://lex.finddatatech.cloud`（识律平台入口） | 同上 | `200` | 接管 `demoUrl` 与「在线体验」CTA（双语） |
| `https://facet.finddatatech.cloud` / `platform.` / `router.` / `wanxing.` / `wire.` / `mcp.` | 同上 | 均 200（platform 302→登录，正常） | 无需改动 |

## npm scope 核验（任务 1.5）

- `registry.npmjs.org/@finddatatechonology/facet` → 200；`@finddatatechnology/facet` → 404。
- 包元数据：maintainer `finddatatechonology`，repository 指向
  `git+https://github.com/FindDataTechnology/platform.git`（directory `facet/cli`），
  latest 0.1.0，bin `facet`。
- 结论：**站点文档与实际发布一致**，错在已发布的 scope 名本身。重新发布正确 scope +
  老包退役 = 独立待办（`repo-descriptions.md`）。

## content-integrity 门（任务 2.4，反向验证）

```
$ node scripts/check-content-integrity.mjs --self-test
  ok   detect: FindDataOfficial
  ok   detect: craw.finddatatech.cloud
  ok   detect: Scrapyd
  ok   clean: negative control          exit=0

$ # 用 git show HEAD: 取改前文件重放（/tmp/ct-prefix）
[content-integrity] 4 retired-identifier hit(s):
  .../en/contract-templates.md:16  [Scrapyd]  Scrapyd crawl stack (with Redis and PostgreSQL)...
  .../en/open-data-mcp.md:27       [FindDataOfficial]  on the FindDataOfficial GitHub org.
  .../zh/contract-templates.md:13  [Scrapyd]  专用爬虫（`scraw-law-contracts`）以定时 CronJob 跑在 Scrapyd 采集栈上...
  .../zh/open-data-mcp.md:18       [FindDataOfficial]  fd-* 系列包全部开源：可从 PyPI 安装，代码在 GitHub 的 FindDataOfficial 组织下。
exit=1

$ node scripts/check-content-integrity.mjs          # 修复后现树
[content-integrity] clean — 93 file(s) scanned against 3 retired identifiers, 0 hits
```

首轮实现曾发现排除逻辑只作用于扫描第一层（`src/content/repos/` 镜像 8 处误报），
已修为按路径后缀排除并复测通过。

## 构建与产物（任务 4.2 / 4.3）

- `npm run build`：102 页构建成功（`content:check` 已前置为构建门）。
- 旗舰页构建产物（双语）：
  - `dist/fd-open-data-mcp/`：`452 indicator concepts · 53 MCP tools · from this build's indicator export`
  - `dist/zh/fd-open-data-mcp/`：`452 个指标概念 · 53 个 MCP 工具 · 来自本次构建的指标导出`
- 旧数字残留检查：`15 个指标概念 / 45 个 MCP 工具 / 15 indicator concepts / 45 MCP tools`
  在旗舰页与两版首页均为 0 命中。
- `openspec validate official-web-content-truth --strict`：valid。

## 遗留给用户裁决

- 蝉蜕（roadmap 第一阶段）四条交付物已全部改写为「已上线」，但阶段状态仍是 in-progress、
  周期保持「2–3 个月」。**是否补在途项（如 wire/lex 平台工程）或宣告阶段完成**，属路线图
  主权，未擅自决定。
