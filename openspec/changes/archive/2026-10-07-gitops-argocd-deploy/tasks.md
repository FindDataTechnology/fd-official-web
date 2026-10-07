# Tasks: gitops-argocd-deploy

## 1. 仓库改造

- [x] 1.1 `Dockerfile`（nginx:1.29-alpine 打包 CI 产出的 dist/）+ `deploy/docker/nginx-site.conf`
- [x] 1.2 `deploy/k8s/fd-web.yaml`（ns/Deployment×2 固定 chengsi/Service NodePort 30442）与 `deploy/argocd/app-fd-web.yaml`（Application，auto-sync + prune + selfHeal）
- [x] 1.3 `.github/workflows/build-image.yml`（push/cron/dispatch → build → push Harbor → tag 回写 `[skip ci]`）
- [x] 1.4 GitHub secrets：`HARBOR_USER`/`HARBOR_PASS`（robot$fd-web+gha-push）已录入

## 2. 上线与切换（依赖 finddata 侧 ArgoCD 就绪）

- [ ] 2.1 提交推送本变更文件，手动触发 `build-image` 跑通首镜像 + tag 回写
- [ ] 2.2 apply `deploy/argocd/app-fd-web.yaml`，Application Healthy、双副本就绪、NodePort 验收内容一致
- [ ] 2.3 宿主 nginx `location /` 切 `proxy_pass`，观察一个定时周期
- [ ] 2.4 删除 `deploy.yml` 与 `DEPLOY_SSH_KEY`/`DEPLOY_HOST`/`DEPLOY_USER` secrets；服务器旧公钥移除（finddata 侧任务 5.3/5.4 同步）
- [ ] 2.5 更新 `OPS.md` 部署章节与 `/fd-site-deploy` 技能说明，`deploy.sh` 标注废弃
- [ ] 2.6 `openspec validate gitops-argocd-deploy --strict` 通过并归档

## 归档备注（2026-10-07）

本 change 归档时保留 2.1–2.6 未勾：这批上线切换已由根仓 change `2026-09-09-replace-actions-deploy-with-argocd`（已归档）整体承接完成，产出活主 spec `openspec/specs/argocd-gitops-deploy`（根仓）。归档时复核（2026-10-07）：ArgoCD app `fd-web` Synced/Healthy（最后同步 rev `caf1e8f`，10-07 05:07）；宿主 nginx `/` → pod:30442；`DEPLOY_*` secrets 与旧部署公钥均已撤销（旧私钥登录被拒）；镜像通道已由 `tcr-image-pipeline` 切至 TCR。注：本 delta 的 MODIFIED 块已按当前主 spec 补齐 3 个场景以通过 `--strict`；其正文（GHA→Harbor）为 08-29 时点快照，故本 change 归档不做 spec 同步。
