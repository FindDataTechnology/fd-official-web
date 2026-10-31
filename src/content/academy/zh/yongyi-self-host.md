---
title: "永忆自部署入门：把长期记忆装进你自己的服务器"
summary: "永忆（YongYi）是一套 MIT 开源的 agent 长期记忆服务。本课带你从零把它部署到自己的机器或集群上——单机起服务、发第一枚令牌问记忆、把运维面挡在公网之外，并按可复现的纪律做备份与验收。"
order: 3
level: build
updated: "2026-10-29"
source_material: "永忆公开仓 FindDataTechnology/fd-memory：docs/DEPLOYMENT.md（部署教程）、README.md（配置与快速起跑）、docs/federation-recipe.md（多节点接入）"
pack_url: ''
---


## 学完你能做什么

在一台自己的机器（或自己的集群）上跑起永忆记忆服务，走通「铸令牌 → 写记忆 → 问记忆」的最小闭环，并把它的运维面（令牌铸造、指标、重建）安全地挡在公网之外，留下可复现的备份与验收习惯。

## 前置条件

- 一台能跑 Node 22 或 Docker 的机器（Linux / macOS 均可）。
- 一个终端与 `curl`；若走容器，需本机有 Docker。
- 可选：一个 OpenAI 兼容的 LLM 车道凭据，用于开启「蒸馏」旁挂服务（不开也能用只读记忆面）。
- 源码与镜像均为公开：`github.com/FindDataTechnology/fd-memory`，MIT 许可。

## 步骤

### 1. 认清它的形态：一个进程，两类文件

永忆是**单进程 Node 服务**，无外部数据库依赖。全部状态只有两样：`owners/` 下的 markdown 文件（真源，可直接读可 diff）与派生的 SQLite 索引（丢了可重建）。所以备份只备 markdown，索引随时能重算。

### 2. 起服务

最快的本地验证（绑定只走本机回环，不对外）：

```bash
git clone https://github.com/FindDataTechnology/fd-memory
cd fd-memory && npm ci && npm run build
node dist/index.js serve --port 4000
curl http://127.0.0.1:4000/healthz   # → {"status":"ok"}
```

要对外服务，容器是最省心的起点（仓库自带 `Dockerfile`）：

```bash
docker build -t fd-memory .
docker run -d -v fdmm-data:/data \
  -e FD_MEMORY_PEPPER='<生产必改的令牌散列密钥>' \
  -p 127.0.0.1:49375:49375 fd-memory
```

把端口映射钉在 `127.0.0.1:`，让前面的反向代理去接管对外暴露——不要让容器直接吃公网。

### 3. 发第一枚令牌，问一次记忆

永忆的权限是一棵树：`platform → person → deployment`。全新实例用 CLI 在受信任主机上铸第一枚 platform 根，再经它派人根令牌：

```bash
# 1) 受信任主机上铸 platform 根（习惯上打 bootstrap 标签）
node dist/index.js token mint --kind platform --namespace '*' --label bootstrap
# 2) 用它派一枚人根令牌（只在内网调用）
curl -X POST http://127.0.0.1:49375/admin/mint \
  -H "authorization: Bearer $BOOT" -H 'content-type: application/json' \
  -d '{"namespace":"u/demo","label":"first"}'
# 3) 拿人根令牌读记忆
curl -H "authorization: Bearer <person-token>" \
  'http://127.0.0.1:49375/digest?q=最近做什么&k=5'
```

### 4. 用反向代理把运维面挡在公网外（关键）

这是部署最容易漏、也最不该漏的一步。服务侧对 `/admin/*` 有鉴权，但边缘还必须在**路径层**封掉它——鉴权挡住滥用，路径封禁挡住「这个服务存在运维面」这一信息本身。按这张表放行/封禁：

| 路径 | 边缘处置 |
|---|---|
| `/healthz` | 放行（公开只读探针，可做存活检查） |
| `/digest` | 放行（无 token 返回 401） |
| `/mcp` | 放行，且**关闭缓冲**（流式输出否则整段迟到） |
| `/admin/*` | **边缘 404**（令牌铸造/指标/重建，只留内网） |
| `/capture` | 边缘 404（写面走内网或 MCP，不开公网） |

Caddy 一份最小形态（Nginx 概念一致）：

```caddy
memory.example.com {
  handle /healthz { reverse_proxy fd-memory:49375 }
  handle /digest  { reverse_proxy fd-memory:49375 }
  handle /mcp { reverse_proxy fd-memory:49375 { } }
  handle { respond 404 }   # 其余一律 404，含 /admin、/capture
}
```

### 5. 备份：只备真源，恢复先验校验和

```bash
tar czf fdmm-wiki-$(date +%F).tar.gz -C /var/lib/fdmm owners tokens.db
sha256sum fdmm-wiki-*.tar.gz     # 恢复演练前先校验，不过不称「可恢复」
```

令牌密钥 `FD_MEMORY_PEPPER` 单独加密备份——它一旦换掉，旧令牌全部失效。

## 自检

- 从公网打 `curl https://<your-host>/admin/mint`，应拿到 **404**，而不是 401——401 会把「运维面在此」泄露出去。
- `curl https://<your-host>/healthz` 返回 `{"status":"ok"}`，`/digest` 无凭据返回 **401**。
- 换一台机器从 markdown 真源恢复，`/digest` 仍能答出你写入的记忆。

## 如果没成功

- **`/digest` 一直 401**：确认带上 `Authorization: Bearer <token>`，且令牌命名空间与写入端一致。
- **中文短查询召回差**：把派生索引按 trigram 分词器重建一次，向量车道需补跑 reembed。
- **蒸馏臂不产出**：`FD_MEMORY_DISTILLER_URL` 与 `FD_MEMORY_DISTILL_ENABLED=1` 两门都要过，只设一个不启动。

## 下一步

需要多个节点共享同一份记忆时，看公开仓 `docs/federation-recipe.md`——本地节点注册为远端 profile，hook 落本地 spool、定时投递到服务，两边同时可见、零数据损失。
