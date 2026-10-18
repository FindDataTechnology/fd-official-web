## Why

2026-10-18 17:19 那次构建把线上 12 个 `/repos/*` 详情页删掉了。构建箱的 `/opt/fd/fd-web-build.env` 里没有 `GITHUB_TOKEN`，抓取走匿名请求；构建过程中匿名额度（60 次/小时，按出口 IP 计）被同一 IP 上的其他流量耗尽，12 个 README 返回 403。日志是 `[repos] fetched 17 repos, 5 READMEs`，而此前多次构建都是 17/17——这是一次真实回归，不是常态。

**这是同一个故障第二次发生，且第一次已经立项修过。** 归档 change `official-web-live-data-refresh`（2026-09-21）的 proposal 就写着「~60 API calls per build exceeds the unauthenticated 60/h cap — the direct cause of the empty grid」，任务 1.3 记录的验证是「run a full `npm run repos:fetch` with a token and confirm ~60 calls complete without HTTP 403」。token 当时确实加进去了。

它在 2026-10-16 05:12 丢失：那天为 strapi-content-publishing 切换编辑同一个 env 文件（同一时段还落了 `.deploy_key` 与 `fd-content-snapshot.sh`），`GITHUB_TOKEN` 被这次编辑挤掉。文件现有 6 个键，`GITHUB_TOKEN` 不在其中。

也就是说：修过一次的措施没有留存下来，因为**没有任何东西校验构建环境的必需键是否齐全**。OPS.md 里「构建箱 env 含 `GITHUB_TOKEN`」的记载至今仍在，但已经是过期描述——文档说有三样，实际只有两样。

两个特征让这个失败模式比它看起来危险：构建照常 exit 0 并部署（抓取失败只 `console.warn`），且线上对不存在的页面也返回 200（兜底页），所以用状态码验收会以为一切正常——我这次就是这样被骗过一轮，靠比对页面标题是否含仓名才发现。

## What Changes

- **构建环境补 `GITHUB_TOKEN`**，让 GitHub API 调用带授权，把限额从 60/h 提到 5000/h。这直接消掉大部分触发条件。spec `repo-showcase` 早已写明「fetch SHALL send an authenticated request when a GITHUB_TOKEN is configured」——所以缺 token 是配置漏了，不是设计问题。
- **构建环境必需键自检**：`build-deploy.sh` 在启动构建前检查 env 文件的必需键是否齐全且非空，缺键即中止并指名缺哪个。**这是本次事故真正该修的那一条**——10-16 那次编辑丢键时，如果有这个自检，故障会在两天前就暴露，而不是等到线上缺页。
- **README 抓取失败不再静默**：`fetch-repos.mjs` 对「仓清单里有、README 没抓到」的情况分级处置——个别失败保持 spec 既有的「该仓降级为无详情页」行为；但当失败数超过阈值（如一半以上）时 fail-closed 退出，让构建红掉而不是静默上线一个残缺站点。
- **构建日志给出一句话结论**，让人不用逐行 grep 就能判断这次构建的仓库面是否完整（例如「README 缺 12/17，超过阈值，构建中止」）。
- **新增验收脚本**：比对线上 `/repos/*` 页面标题是否含仓名，而不是只看 HTTP 状态码。这是本次事故唯一真正发现问题的手段，应当固化下来。
- **修正 OPS.md 的过期记载**：env 文件的键清单按实际状态重写，并注明必需键缺省会怎样。

## Capabilities

### New Capabilities

（无——本变更不引入新能力，只让既有 `repo-showcase` 的行为在失败时不再静默。）

### Modified Capabilities

- `repo-showcase`：「Build resilience」需求补充 fail-closed 边界——个别 README 失败仍按原语义降级，但成规模失败（达到阈值的多数仓）MUST 中止构建，MUST NOT 静默部署残缺的仓库面。另新增「构建环境凭据自检」需求——构建前校验必需凭据键齐全，缺键即中止并指名，使 env 文件被编辑丢键时当场暴露而非两天后线上缺页。

## Impact

- **`fd-official-web/scripts/fetch-repos.mjs`**：失败分级与阈值判定、日志结论行。
- **`fd-official-web/scripts/build-deploy.sh`**：构建前必需键自检。
- **构建环境 `/opt/fd/fd-web-build.env`**（cheap-1）：补 `GITHUB_TOKEN`（凭据，不入仓；由仓库 owner 提供）。
- **新文件**：线上验收脚本（判别兜底页与真实页）。
- **`docs/` / `OPS.md`**：本次事故、env 键清单按实际状态重写、判别法与排查步骤。
- 无对外 URL 变化；`/repos` 列表页与五线页面不受影响。
- 可能的副作用：构建箱补 token 后若 token 失效或权限不足，会从「静默缺页」变成「构建红」，这是有意的方向。
