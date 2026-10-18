## Context

动机见 proposal.md。设计需要落地的现状约束：

- `scripts/fetch-repos.mjs` 的结构是：先 `rm -rf src/content/repos/` 清空，再 for 循环逐个抓 README；单个失败只 `console.warn`，`repo.hasReadme = false`，继续。最后写 `repos.json`（含 `hasReadme` 标记）并打印一行统计。
- 消费侧分两路，互不依赖：列表页 `src/pages/repos.astro` 读 `src/data/repos.json`；详情页 `src/pages/repos/[name].astro` 走 `getCollection('repos')`，即只有抓到 README 的仓才有页面。`RepoCard.astro` 里 `hasReadme=false` 时链接直跳 GitHub。
- spec 现有「A failed README fetch degrades that repo only」正是这个行为，是认可的语义，不是要修的东西。
- 线上 nginx 对不存在路径返回兜底页且状态码 200（`404.html` 存在但该路径走的是兜底而非 404 状态码），所以状态码无法用于验收。
- 构建链：`build` = `strapi:fetch && content:check && repos:fetch && indicators:fetch && …`，`repos:fetch` 非零退出会让整条链停下。

## Goals / Non-Goals

**Goals:**

- 成规模 README 失败时构建红掉，不再静默上线残缺仓库面。
- 个别 README 失败保持现有降级语义（该仓无详情页、列表照常）。
- 补构建 token，从源头降低触发概率。
- 验收手段固化：不再用状态码判断页面是否存在。

**Non-Goals:**

- 不改变「API 完全不可达时保留上次快照」的既有行为（那条是对的，spec 已规定）。
- 不做重试队列、不做多 token 轮换——额度问题是配置问题，不是需要工程方案的问题。
- 不改造列表页或详情页的渲染。
- 不追求「README 永远抓得到」。

## Decisions

### D1 阈值取「多数」，不是固定数量

README 失败数 > 仓总数的一半时 fail-closed。

理由：固定数量（如「少于 3 个就红」）在仓数增长后会失真。比例阈值与规模无关，且「多数仓都没详情页」在任何规模下都明显是故障而非降级。反过来，少数失败（如 17 个里挂 2 个）确实是可接受的降级，spec 已认可，不该红。

代价：恰好一半失败时放行。可接受——那是边界，日志结论行会把它写清楚。

### D2 阈值判定放在抓取循环结束后、写 repos.json 之前

先抓完所有仓、统计失败数，再决定是否退出。

理由：提前退出会让 `repos.json` 停留在上次内容（外层 catch 又会「保留上次快照」），表现为站点没更新但也不报错——正是要消灭的现象。抓完再判，能保证「红的时候日志里有完整统计」。

### D3 结论行包含三个数字：仓数 / README 成功数 / 失败数

```
[repos] fetched 17 repos, 5 READMEs (12 failed) — majority of READMEs missing, build aborted
```

理由：现有那行只有前两个数字，看不出失败规模。三个数字让人不用回去数 warn 行。

### D4 token 只加进构建环境，不进仓、不进任何构建产物

`/opt/fd/fd-web-build.env`（cheap-1，权限 600）补 `GITHUB_TOKEN`；`scripts/build-deploy.sh` 已经把这个 env 文件 source 进来并传给 docker run 的 `-e GITHUB_TOKEN`，**无需改脚本的透传部分**。

理由：脚本侧早就留好了入口（`build-deploy.sh` 第 55 行 `-e GITHUB_TOKEN="${GITHUB_TOKEN:-}"`），缺的只是 env 文件里的值。

**但补值本身不够**——10-16 那次编辑已经证明这个值会丢，而且丢了没有任何提示。所以本变更同时加 D6 的必需键自检。补 token 是止血，自检才是防止复发。

代价：token 需要有人提供并定期轮换；失效时表现为构建红（403 → 阈值判定 → 中止），方向正确但需要知道去哪换。

### D6 构建前自检 env 必需键，缺键即中止

`build-deploy.sh` 在 source env 文件之后、启动 docker 之前，检查一组必需键存在且非空；缺键则打印缺哪个、退出非零，不进入构建。

必需键清单：`GITHUB_TOKEN`、`FD_WEB_DEPLOY_PASS`、`STRAPI_URL`、`STRAPI_READ_TOKEN`。可选键（`FD_INDICATORS_MCP_TOKEN`、`FD_CALIBERS_MCP_TOKEN` 等）缺失只 warn——它们有既有的降级路径（用仓内快照），不该阻断构建。

理由：本次事故的根因不是「额度耗尽」而是「token 不在环境里」，而额度耗尽只是触发器。如果 10-16 编辑丢键时有这个自检，故障会在当场暴露，而不是两天后线上缺 12 个页面才发现。**区分必需与可选的依据是「缺失是否有安全降级路径」**：`GITHUB_TOKEN` 缺失会走匿名请求并可能产出残缺站点（无安全降级），MCP token 缺失则保留仓内快照（有安全降级）。

代价：构建环境多一处硬依赖；换机器部署时若漏配某个键，构建会直接拒绝启动而不是带着降级跑起来。这是有意的——宁可启动失败，不要静默残缺。

### D7 文档记载与实际状态必须能对上账

OPS.md 里「构建箱 env 含 `GITHUB_TOKEN`」这句话在 token 丢失后仍然是错的，且错误持续了两天无人发现。本变更把 env 键清单改为从实际文件读取后写入文档，并注明每个键缺失时的行为。

理由：文档说有三样、实际只有两样，这种偏差本身就是故障源——它让「token 应该在那儿」变成无人核对的假设。自检（D6）让运行时能发现，文档对账让人在排查前就有正确预期。

### D5 验收脚本按标题判别，不按状态码

对每个仓名请求 `/repos/<name>/`，用页面 `<title>` 是否含仓名判断真实存在；兜底页标题是站点默认标题。另取一个确定不存在的 slug 作对照，确保判别规则本身有效。

理由：这是本次事故里唯一真正发现问题的手段。状态码在这里是骗人的——兜底页也返回 200。用「不存在页」作对照是为了防止判别规则本身失效（比如哪天站点改了标题格式），那时脚本会报「所有页面都不存在」而不是 silently 全绿。

## Risks / Trade-offs

- **补 token 后构建从「静默缺页」变成「构建红」**→ 这是有意的方向，但会让一次额度故障从「无人知晓」变成「站点停止更新」。缓解：阈值取多数，个别失败不触发；且 cron 每 6h 重试，额度恢复后下次构建自动恢复。
- **token 失效被误判为额度问题**→ 403 有两种成因（额度耗尽 / token 无效）。结论行只报数量不报成因，排查时需另跑一次 `curl -H "Authorization: Bearer $TOKEN"` 验证 token 本身。写进 docs 的排查步骤。
- **阈值在仓数很少时过于敏感**→ 如只有 2 个仓、挂 1 个即触发。当前 17 个仓不受影响；仓数变少时不加特例，让红出现比静默更好。
- **验收脚本依赖标题格式**→ 站点改标题格式会让脚本误判。用对照 slug 缓解（规则失效时全部判负，不会误报全绿）。

## Migration Plan

1. 先在构建环境加 `GITHUB_TOKEN`，跑一次构建确认 17/17 恢复（不改代码）。
2. 改 `fetch-repos.mjs`：阈值判定 + 结论行。
3. 加验收脚本，对线上跑一次，确认 17 个全绿、对照 slug 正确判负。
4. 本地模拟多数失败（用一个无效 token 跑 `repos:fetch`），确认构建红且日志有结论行。
5. 回滚：`fetch-repos.mjs` 的阈值判定是一处 if，去掉即回到原行为；token 留在 env 里无害。

## Open Questions

- 阈值比例是否要随仓数设下限（如「至少 3 个仓失败才算」）？当前实现不设，若日后仓数收缩到个位数再议。
