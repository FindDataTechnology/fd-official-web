## 1. 构建环境（含一次真实事故的复盘）

- [x] 1.1 由仓库 owner 提供 GitHub token 写入 cheap-1 的 `/opt/fd/fd-web-build.env`。**已完成（2026-10-19）**：fine-grained token，resource owner `law-ai-official`（备用组织，用户指定），Repository access = Public repositories（只读公开仓），零权限，90 天有效期（2027-01-17 到期）。**原 token 已于 2026-10-16 丢失**——那天为 strapi-content-publishing 切换编辑同一 env 文件（同时段落下 `.deploy_key` 与 `fd-content-snapshot.sh`），`GITHUB_TOKEN` 被挤掉；归档 change `official-web-live-data-refresh` 的任务 1.3 记录过它当时已加并通过 403 验证。env 写入前已备份为 `.bak-before-github-token`，权限保持 600。
- [x] 1.2 跑一次构建，确认 `fetched 17 repos, 17 READMEs`。**已完成**：构建日志 `[repos] fetched 17 repos, 17 READMEs (0 failed)`，`deploy done: 2146cc6d`。
- [x] 1.3 实测 token 有效性并记录排查方法。**已完成**：构建箱上 `rate_limit` 返回 `limit: 5000`，17 个目标仓 README 逐个 200。排查方法（403 两种成因）已写入 `docs/official-web-repos-outage-20261018.md` 第六节。

## 2. build-deploy.sh 必需键自检（本次事故真正该修的一条）

- [x] 2.1 在 source env 文件之后、启动 docker 之前加自检：必需键（`GITHUB_TOKEN`、`FD_WEB_DEPLOY_PASS`、`STRAPI_URL`、`STRAPI_READ_TOKEN`）存在且非空，缺键即退出非零并指名缺哪个。**已完成**，三场景实测：缺 `GITHUB_TOKEN` 正确退出并指名、全齐放行、可选键缺失只 warn。上线后构建日志无自检报错（放行）。
- [x] 2.2 可选键（`FD_INDICATORS_MCP_TOKEN`、`FD_CALIBERS_MCP_TOKEN`）缺失只 warn 不阻断。**已完成**：实测注释掉后构建继续且日志有 warn。
- [x] 2.3 自检恢复后跑一次完整构建确认通过。**已完成**：`fd-web-deploy.sh` exit 0，fetched 行 17/17。

## 3. fetch-repos.mjs 失败分级

- [x] 3.1 抓取循环结束后、写 `repos.json` 之前统计失败数；失败数超过仓总数一半时 `process.exit(1)` 并打印结论行。**已完成**，构建箱容器内实测：模拟 17/17 README 失败，输出 `majority missing, build aborted` + 完整失败名单，`exit=1`。
- [x] 3.2 结论行格式固定为「仓数 / README 成功数 / 失败数 + 判定」。**已完成**：线上构建日志为 `fetched 17 repos, 17 READMEs (0 failed)`。
- [x] 3.3 确认个别失败仍按原语义降级。**已完成**：阈值边界单测（17 挂 8 仍降级、挂 9 中止）；spec 既有语义未改。
- [x] 3.4 确认「API 完全不可达」仍走保留快照的既有路径。**已完成**：构建箱实测无效 token 走 `fetch failed (HTTP 401); keeping last-good data`，exit 0，`repos.json` 不变。两条路径（org 清单失败 vs README 逐个失败）互不干扰。

## 4. 验收脚本

- [x] 4.1 新增 `scripts/check-repos-online.mjs`：按页面 `<title>` 是否含仓名判别真实存在，另取不存在的 slug 作对照，对照必须判负否则脚本报错退出。**已完成**：线上跑通，16 个 `/repos/*` 路径全判正、对照判负。
- [x] 4.2 脚本对 `fd-open-data-mcp` 特例放行。**已完成**：输出标记为「产品页特例（卡片指向专属页，非缺失）」，与 `RepoCard.astro` 里写死的特例一致。
- [x] 4.3 在 `docs/` 记录本次事故与判别法。**已完成**：`docs/official-web-repos-outage-20261018.md`，含日志证据 `fetched 17 repos, 5 READMEs`、10-16 丢键时间线、状态码骗人的判别法、排查方法。

## 5. 文档对账与上线

- [x] 5.1 重写 `OPS.md` 的 env 键清单：按实际文件读取后写入，注明每个键缺失时的行为。**已完成**：键清单与 `grep -oE '^[A-Z_]+=' /opt/fd/fd-web-build.env` 实际输出一致；`GITHUB_TOKEN` 一行记录已设置、组织、到期日。
- [x] 5.2 `openspec validate repos-fetch-resilience --strict` 通过。**已完成**：输出 valid。
- [x] 5.3 提交推 gitee `main` + `master`，走既有发布链上线。**已完成**：`509dd37`（防护）+ `2146cc6`（OPS.md），构建 17/17，`deploy done: 2146cc6d`。
- [x] 5.4 上线后跑验收脚本，线上 17 个仓全绿。**已完成**：16 个 `/repos/*` 路径逐个标题比对全 ok，加 `fd-open-data-mcp` 产品页特例共 17 个，与构建日志 17/17 一致。

## 6. 归档前

- [ ] 6.1 归档后确认 `repo-showcase` 含两条新场景。验证：`openspec show repo-showcase --type spec` 含「Widespread README failure」与「Missing required key aborts the build」。
