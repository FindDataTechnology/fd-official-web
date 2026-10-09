# Tasks — wire-tab-refresh

## 1. 文案与入口

- [x] 1.1 重写 wire 平台入口 CTA 文案（`src/i18n.ts` EN/ZH `wire` 相关键）：覆盖我的数据/上传物化/产物/自助注册，不携带手写量级数字；`npm run build` 过 content:check
- [x] 1.2 `ProductCatalog.astro` wire 入口块加「查看定价 / See pricing」次级 CTA，指向 `https://wire.finddatatech.cloud/#/pricing`，描边样式不新增薄荷强调；本地构建后人工核对两语言渲染
- [x] 1.3 校准两张 wire 卡（`src/content/apps/{en,zh}/open-data-mcp.md`、`cloud-federation.md`）：tagline/正文与新服务口径对齐、双语对等、能力可验证；`npm run build` 通过（含 line 校验与 slug 无冲突）
- [x] 1.4 处置 `line.wire.desc` 无消费遗留键：grep 确认零引用后删除 EN/ZH 两处；i18n 相关测试通过

## 2. 发布与验收

- [x] 2.1 发布顺序确认：fd-wire 主 change（定价四卡/登录）已滚生产后再发布本 change；push main → GHA 镜像 success
- [x] 2.2 bump `deploy/k8s/fd-web.yaml` 镜像 tag 双推（gitee+github），ArgoCD 滚动完成
- [x] 2.3 验收：带 `?v=<sha>` 打开 `/products/wire` 与 `/zh/products/wire`——新文案、定价 CTA 可达平台定价页、全站无 wire 价格数字（EN/ZH 各查一遍）；截图存 `reports/`
- [x] 2.4 `openspec validate wire-tab-refresh --strict` 通过
