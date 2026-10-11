# Tasks — wire-platform-showcase

## 1. OpenSpec 立项

- [x] 1.1 建 `openspec/changes/wire-platform-showcase/`（proposal.md / tasks.md / specs/apps-showcase delta），delta 每条 Requirement 带 Scenario WHEN/THEN
- [x] 1.2 `openspec validate wire-platform-showcase --strict` 零 ERROR

## 2. 双语 app 页落盘

- [x] 2.1 写 `src/content/apps/zh/wire-platform.md`：按已实证能力清单逐条可验证的营销文；零价格/额度/行配额数字；无未来时态；CTA 指向平台与定价页
- [x] 2.2 写 `src/content/apps/en/wire-platform.md`：克制、具体、如实；与中文页语义对等；同样零价格数字、无未来时态
- [x] 2.3 构建验证：content:check + astro build 通过（line 校验、slug 无冲突、双语详情页生成）；确认 `/products/wire` tab 网格线内排序为 wire-platform → open-data-mcp → cloud-federation

## 3. 发布与验收（主会话统一处理）

- [x] 3.1 入口核验留痕：2026-10-11 curl `https://wire.finddatatech.cloud` 与 `/#/pricing` 均返回 200（content-integrity「可达入口」）
- [x] 3.2 push 528c81a → GHA 47s success；manifest sha-528c81a 双推，ArgoCD（tencent 集群 fd-web ns）自动滚动完成
- [x] 3.3 验收（curl -L 实测 2026-10-11）：四页全通（wire tab 双语 + wire-platform 双语详情 title 实锤）；zh tab 卡序=柏讯平台→开放数据 MCP→云端数据联邦（线内居首）；价格/额度数字扫描零命中。
- [x] 3.4 `openspec archive wire-platform-showcase`（先 `--strict` 复验）
