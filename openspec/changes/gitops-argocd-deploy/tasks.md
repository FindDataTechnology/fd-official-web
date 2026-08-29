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
