# Proposal: gitops-argocd-deploy

## Why

现行 auto-deploy 让 GitHub Actions 持有一把可 SSH 登录 124.220.7.175 的私钥（`DEPLOY_SSH_KEY`），每天两次从境外 runner 直接 rsync 进服务器——GitHub 侧长期持有服务器 shell 凭据，属于重大暴露面。改为拉取式 GitOps：GitHub 只产出容器镜像并回写 tag，集群内 ArgoCD（部署于自有 china-cheap 节点，见 finddata 仓库变更 `replace-actions-deploy-with-argocd`）拉取 manifests 完成部署。

## What Changes

- **BREAKING** 删除 `deploy.yml` 与 secrets `DEPLOY_SSH_KEY`/`DEPLOY_HOST`/`DEPLOY_USER`；新增 `build-image.yml`（构建站点 → 推镜像到私有 Harbor `fd-web` 项目 → 回写 `deploy/k8s/fd-web.yaml` 镜像 tag，commit 带 `[skip ci]`）。
- 站点运行体改为集群内 Deployment（`deploy/k8s/fd-web.yaml`，固定 chengsi 节点，宿主 nginx 仅做 TLS 终结与 `/demo-api`、`/mcp` 分流）；`Dockerfile` 只打包 CI 构建好的 `dist/`。
- 新增 `deploy/argocd/app-fd-web.yaml`（ArgoCD Application，bootstrap 手工 apply 一次）。
- `/fd-site-deploy` 手动部署语义改为"本地构建 + 推镜像 + bump tag"或直接触发 ArgoCD 同步。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities
- `auto-deploy`: 部署产物从 rsync 静态目录改为镜像 + GitOps；secrets 边界从"GitHub 持有 SSH 私钥"改为"GitHub 仅持有 Harbor 推送 robot"；服务器不再接收文件级部署操作。

## Impact

- `.github/workflows/`（删 deploy.yml、增 build-image.yml）、`Dockerfile`、`deploy/docker/nginx-site.conf`、`deploy/k8s/fd-web.yaml`、`deploy/argocd/app-fd-web.yaml`、`OPS.md`、`deploy.sh`（废弃标注）
- GitHub secrets：删 3 个 SSH 相关、增 `HARBOR_USER`/`HARBOR_PASS`
- 服务器 `/opt/fd/web/dist` 退役为回退后端（保留一个定时周期）
