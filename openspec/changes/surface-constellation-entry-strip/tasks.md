# Tasks

## 1. 快照导出脚本

- [x] 1.1 新增 `scripts/fetch-constellation-status.mjs`：取 `https://wanxing.finddatatech.cloud/api/wanxing/v1/status`，
      校验形状（`agents.value` 与 `turns7d.value` 为有限数），写 `src/data/constellation-status.json`
      （`{agents, turns7d, generated_at}`）。验证：`node scripts/fetch-constellation-status.mjs` 后文件含真实值与新时间戳。
- [x] 1.2 失败路径：端点不可达 / 形状不符 / 缺值 → **不写文件**、打印警告、退出码 0。
      验证：`WANXING_STATUS_URL=http://127.0.0.1:1/ node scripts/fetch-constellation-status.mjs; echo $?`
      输出 0 且既有快照字节未变（`md5` 前后比对）。
- [x] 1.3 committed 一份快照进 `src/data/constellation-status.json`（首次就是真值），作为
      fresh checkout 的回落。验证：`git status` 显示该文件被跟踪。
- [x] 1.4 `package.json` 的 `build` 链在 `calibers:fetch` 之后新增 `constellation:fetch`，并加同名
      独立 script。验证：`npm run build` 全链通过。

## 2. 线页入口带

- [x] 2.1 在 `src/components/ProductCatalog.astro` 加 `line === 'constellation'` 分支，位于 `wire-entry`
      组与 `<ul class="grid">` 之间：三个 `<a>`（目录 / 文档 / 控制台）与两个数字（在役 N · 近 7 天 N 回合
      · 数据取自 {generated_at}）。验证：`npm run dev` 下 `/zh/products/constellation` 渲染出该区块，
      `/products/facet` 与 `/products/wire` 不受影响。
- [x] 2.2 数字缺失时该格整个不渲染（不渲染 0），并保留 `generated_at`。验证：把快照改成 `{}` 后重建，
      页面上没有 `0` 也没有空白块。
- [x] 2.3 样式复用既有 `wire-entry` / `demo-cta` / `button-secondary` 类，不新增 CSS 变量或新组件文件。
      验证：diff 里不出现新的 `<style>` 规则类名（除必要布局微调外为零）。

## 3. 文案

- [x] 3.1 更新 `src/i18n.ts` 的 `line.constellation.desc`（zh 与 en 两处），覆盖四款在售产品
      （服务平台 / 词元 / 连接器 / 行业技能包），保持 `product-portal` 的供给域表述，不改 `tag`。
      验证：两语言页面各看一次；`npm run check:locales` 通过。
- [x] 3.2 新增入口带所需文案键（`constellation.entry.*` / `constellation.status.*`）到两个语言块。
      验证：`npm run check:locales` 通过且页面无裸键名。

## 4. 收口

- [x] 4.1 `npm run build` 全链绿（含 `content:check` / `discoverable:check`）。
- [x] 4.2 双语人工核对：`/zh/products/constellation` 与 `/products/constellation` 的入口带、数字、
      一句话三者一致；其它四条线的线页截图对比无回归。
