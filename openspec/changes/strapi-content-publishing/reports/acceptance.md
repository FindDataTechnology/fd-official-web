# strapi-content-publishing 验收报告（2026-10-16）

主会话横切复核 + 三轮子代理交付 + 线上实测。所有断言均有当次实跑证据。

## 一、交付物总览

| 件 | 位置 | 证据 |
|---|---|---|
| Strapi 服务 | cheap-1 compose（strapi + postgres，限 512m/192m） | `docker compose ps` 双 healthy；`/_health` 204 |
| 镜像 | `ccr.ccs.tencentyun.com/yizuo/fd-strapi:sha-c6fde18` | 构建池 run success（test 22s + build-push + 冒烟门过） |
| fd-strapi 仓 | finddata 工作区（本地 git，e488959…） | tsc 0；rules:sync 42 条；content:import 幂等 |
| 官网拉取管线 | `scripts/fetch-strapi.mjs` + build 链前置（4985b9d/df570fb/4f22d4c） | fixture round-trip diff=0；负测试三组 exit 1 |
| 发布侧机检 | document middleware（src/rules/） | 三类型脏发布 400（分类/slug/字段/片段）；空清单全拦 |
| 触发链 | Strapi webhook→cheap-1:8125 接收器→flock 构建部署 | 6h cron 已重新启用（/etc/cron.d/fd-web-deploy） |
| 线上切换 | www vhost 由 Pod 反代（30442）翻回静态 root | `.bak-pod-20261016` 备份在案；nginx -t 过 + reload |
| 备份 | 每夜 03:23 pg_dump + uploads（14 份滚动） | 手动真跑 64K+4K；恢复演练入临时库条目齐后清场 |
| 快照档案 | /opt/fd-strapi/content-archive（本地 git 仓） | `44046d8 [content-snapshot]` 16 篇全档 |

## 二、关键验收判据（逐条）

### 1. E2E 发布到上线（任务 6.2）✓

- 04:56:49 发布 e2e-smoke-briefing（zh）+ 04:57:11（en）→ webhook → 构建 → rsync → **公网 feed + 详情页可见**（feed 命中；`<title>E2E Smoke Test Entry — FindData Technology`）。
- 稳态延迟实测：触发 05:14:05 → 部署完成 05:17:23 = **3 分 18 秒**（+EdgeOne TTL ≤300s），15 分钟线内。
- 反向链：05:27:43 删除（zh/en 各 200）→ 重建 → 公网 feed 归零、源站详情目录只剩 4 篇真目录。
- 全链三次真失败被正确处理（见 §四），线上从未出现半成品内容。

### 2. 双语成对门 ✓（生产实证）

- fixture 负测试：缺 en → exit 1 报文指明 slug 与语言；zh/en slug 不一致、同名覆盖冲突两条附加预检同样生效。
- 生产：拉取预检在构建首步执行，双语不完整的集合会使构建即红（spec 场景在管线层落实）。

### 3. fail-closed（任务 6.3）✓ 生产实证

- 05:37:43 停 Strapi → 触发构建 → **秒级红在 strapi:fetch**（"拉取失败（fail-closed，未改动任何内容文件）"），线上 homepage 200 不动。
- 另有两起自然发生实证：容器内 127.0.0.1 打不通（构建红，线上不动）；此前量级护栏对 6<8 的拒绝。
- 恢复：start → health 204 → 再触发 → 05:42:16 deploy done 837b3332。

### 4. 发布侧机检（任务 6.4）✓ 生产实证

- 05:33 含 `cheap-3`/`fd-craw-private` 的草稿发布 → **400**：报文含分类【节点与主机】【私有仓库】、slug、字段 body、命中原句。探针草稿已删净。
- 构建侧兜底：content-integrity（136 文件 0 hits）、schema、双语门均对拉取产物跑（fixture round-trip diff=0 证明产物与手写时代逐字节同构）。

### 5. 备份与恢复（任务 5.5）✓

- 首演练抓出两真 bug 并当日修复（`ps -q` 空 exit 0 坑；pg_dump 失败被 gzip 掩盖 → pipefail）。
- 真跑：db-2026-10-16.sql.gz（64K）+ uploads（4K）；恢复入 `strapi_restore_test` 临时库：briefings 17 / courses 8 / research 8 行（含草稿行），核后 drop。

### 6. 迁移与切换判据（任务 3.x/6.1）✓

- 16 篇导入生产（`content:import:prebuilt`，幂等）；token 实拉 8/4/4、slug 集合与仓内文件名 diff=0。
- 本地预演两轮 + 主会话复跑：在线拉取 → **git status 零输出**（D8 判据）。
- 回滚点：tag `strapi-cutover-baseline`（双远端）+ vhost 备份 `.bak-pod-20261016`。

## 三、本次实测抓出的缺陷（全部已修）

1. **v5.58 `?locale=all` 静默空 data**（A 实测发现，主会话在线复现）→ 拉取改 `locale=*`（df570fb）。
2. 构建池变量残留 wanxing 租户 `BUILD_CONTEXT`/`BUILD_DOCKERFILE` → 首构建找不到上下文；已修回根。
3. 镜像 runtime 非 root 而 sqlite 兜底路径多处 mkdir（.tmp、database/migrations）→ 两轮冒烟 EACCES；runtime 整体 chown node 一揽子关闭。
4. hkccr `fd-strapi` 前缀不存在（push DENIED）→ 改用已验证的 `yizuo` 前缀（fd-strapi 镜像名保留）。
5. 构建机 docker.io 直连不通 → postgres/alpine 走 dockerproxy.net 拉取+retag（盒子既定模式）。
6. github.com 从构建机间歇不可达（130s 超时）→ git 配 **仅 github 域**走 mihomo 代理（100.64.0.7:30081），此后 clone/ls-remote 稳定。
7. 构建容器内 `127.0.0.1:1337` 指容器自身 → Strapi 改绑 tailnet `100.64.0.11`（不公网），构建 env 同步。
8. 备份脚本两 bug（见 §二.5）。
9. 部署引导 `exec` 收尾导致后挂脚本不执行 → 改普通调用 + rc 判断。
10. **现役 www 实为 Pod 反代（30442，旧镜像线）**——rsync 静态路径自 9-22 后被翻掉；本变更按 auto-deploy spec 口径翻回静态 root（Pod 保留可回退）。首查时公网陈旧内容即此因。

## 四、已知限制与遗留

- **EdgeOne 对 HTML 缓存长于源站 300s**：feed JSON 按 TTL 刷新，但删除后的详情页公网仍 200（源站已 404）。需在 EdgeOne 控制台调 HTML 缓存规则或 purge（用户侧）。
- **仓内快照推送待凭据**：deploy key 被仓库设置禁用；当前快照落节点本地档案仓（git 历史），夜间 pg_dump 之外第二份内容灾备。若需推回官方仓：开 deploy key 或发细粒度 PAT（建议后者，contents:write 仅限本仓）。
- **cms.finddatatech.cloud 未解析**（DNSPod 无 API token）：研究员后台暂不可达；CI 拉取走 tailnet 不受影响。用户侧加 A 记录 `cms → 103.236.89.212` + nginx vhost + certbot（配方已备）。
- 发布触发器为「运行中即丢」（flock 占用时的触发不排队）：正在构建期间的发布若晚于该构建的 fetch 步，最迟由 6h 定时兜底。研究员体感为「偶发延迟至多 6h」，可后续加单深度队列。
- 管理员凭据在 `/opt/fd-strapi/.admin-credentials`（600）；只读 token `.read-token`（600）已注入构建 env。
- 并发事实：切换期间 release-sync 自动流推了 c45c955/837b333（desktop-releases v1.3.12/13），管线正确构建了最新主线——两流共存无冲突。

## 五、任务完成度

26/26（4.4 节点侧注入完成；5.4 webhook 三事件+delete；6.5 快照=本地档案仓形态，仓内推送待凭据，见 §四）。
