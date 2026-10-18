## 1. 构建环境（先做，含一次真实事故的复盘）

- [ ] 1.1 由仓库 owner 提供一个新的 GitHub token（`public_repo` 读权限即可），写入 cheap-1 的 `/opt/fd/fd-web-build.env`（权限 600，不入仓）。**注意：原有 token 已于 2026-10-16 丢失**——那天为 strapi-content-publishing 切换编辑同一 env 文件（同时段落下 `.deploy_key` 与 `fd-content-snapshot.sh`），`GITHUB_TOKEN` 被挤掉；归档 change `official-web-live-data-refresh` 的任务 1.3 记录过它当时已加并通过 403 验证。所以这不是首次遗漏，需新建而非恢复。验证：`sudo grep -c '^GITHUB_TOKEN=' /opt/fd/fd-web-build.env` 为 1 且值非空。
- [ ] 1.2 跑一次构建，确认日志出现 `fetched 17 repos, 17 READMEs`。验证：`/var/log/fd-web-deploy.log` 末次构建的 fetched 行 README 数等于仓数。
- [ ] 1.3 实测 token 有效性并记录排查方法（403 有两种成因：额度耗尽 / token 无效，结论行只报数量不报成因）。验证：`curl -H "Authorization: Bearer $TOKEN" https://api.github.com/rate_limit` 返回 `limit: 5000`。

## 2. build-deploy.sh 必需键自检（本次事故真正该修的一条）

- [ ] 2.1 在 source env 文件之后、启动 docker 之前加自检：必需键（`GITHUB_TOKEN`、`FD_WEB_DEPLOY_PASS`、`STRAPI_URL`、`STRAPI_READ_TOKEN`）存在且非空，缺键即退出非零并指名缺哪个。验证：临时从 env 文件注释掉 `GITHUB_TOKEN`，跑 `fd-web-deploy.sh` 应立即退出且报文含该键名，不进入构建。
- [ ] 2.2 可选键（`FD_INDICATORS_MCP_TOKEN`、`FD_CALIBERS_MCP_TOKEN`）缺失只 warn 不阻断（它们有仓内快照的安全降级路径）。验证：注释掉其中一个，构建仍继续且日志有 warn。
- [ ] 2.3 自检恢复后跑一次完整构建确认通过。验证：`fd-web-deploy.sh` exit 0，fetched 行 17/17。

## 3. fetch-repos.mjs 失败分级

- [ ] 3.1 在抓取循环结束后、写 `repos.json` 之前统计 README 失败数；失败数超过仓总数一半时 `process.exit(1)` 并打印结论行。验证：用无效 token 跑 `npm run repos:fetch`，退出码非零，日志含「majority of READMEs missing」与三个数字。
- [ ] 3.2 结论行格式固定为「仓数 / README 成功数 / 失败数 + 判定」，成功时也打印（通过态）。验证：正常跑一次，末行含 `fetched 17 repos, 17 READMEs (0 failed)`。
- [ ] 3.3 确认个别失败仍按原语义降级（不触发退出）。验证：构造 17 个仓中 2 个 README 失败的场景，退出码 0，`repos.json` 里那 2 个 `hasReadme=false`，其余 15 个正常。
- [ ] 3.4 确认「API 完全不可达」仍走保留快照的既有路径，不被新阈值干扰。验证：把 API 域名指向不可达地址跑一次，日志含「keeping last-good data」，退出码 0，`repos.json` 内容不变。

## 4. 验收脚本

- [ ] 4.1 新增脚本（放 `scripts/` 下）：对仓清单里每个仓请求 `/repos/<name>/` 与 `/zh/repos/<name>/`，用页面 `<title>` 是否含仓名判别真实存在；另取一个确定不存在的 slug 作对照，对照必须判负，否则脚本自身报错退出。验证：对线上跑一次，17 个仓全部判正、对照判负。
- [ ] 4.2 脚本对 `fd-open-data-mcp` 特例放行（其卡片指向专属产品页 `/fd-open-data-mcp`，不是 `/repos/fd-open-data-mcp`，这是 `RepoCard.astro` 里写死的特例）。验证：脚本输出里该仓标记为「产品页特例」而非缺失。
- [ ] 4.3 在 `docs/` 记录本次事故与判别法（状态码骗人、要比对标题、用对照 slug 防规则失效），含日志证据 `fetched 17 repos, 5 READMEs` 与 10-16 丢键的时间线。验证：记录里三项证据都在。

## 5. 文档对账与上线

- [ ] 5.1 重写 `OPS.md` 里 env 文件键清单那段：按实际文件读取后写入，注明每个键缺失时的行为（必需键缺即构建中止 / 可选键缺则用快照）。验证：OPS.md 的键清单与 `grep -oE '^[A-Z_]+=' /opt/fd/fd-web-build.env` 的实际输出一致。
- [ ] 5.2 `openspec validate repos-fetch-resilience --strict` 通过。验证：命令输出 valid。
- [ ] 5.3 提交推 gitee `main` + `master`，走既有发布链上线。验证：构建日志显示本次提交号，fetched 行 17/17。
- [ ] 5.4 上线后跑验收脚本，线上 17 个仓全绿。验证：脚本输出无缺失。

## 6. 归档前

- [ ] 6.1 归档后确认 `repo-showcase` 含两条新场景。验证：`openspec show repo-showcase --type spec` 含「Widespread README failure」与「Missing required key aborts the build」。
