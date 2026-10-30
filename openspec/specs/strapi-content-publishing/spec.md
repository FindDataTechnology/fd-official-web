# strapi-content-publishing Specification

## Purpose
编辑性内容（星研内参 briefings / 学院 academy / 研究 research）的投稿、评审与发布统一收口到自托管 Strapi：全球研究员浏览器投稿、主编发布即上线；站点保持纯静态输出，全部文件级机检门继续生效，发布内容有备份与仓内快照档案可回溯。

## Requirements

### Requirement: Strapi 是编辑性内容的唯一投稿与发布面

内参、学院、研究三个集合的内容 SHALL 只通过 Strapi 后台创建、编辑与发布；站点仓库中的对应集合文件 SHALL 为构建拉取的生成产物，不再手写。线上站点 SHALL NOT 对 Strapi 有任何运行时依赖。

#### Scenario: 草稿不外漏

- **WHEN** 一位研究员在 Strapi 后台保存了一篇草稿（未发布）
- **THEN** 该内容不出现在线上站点的任何页面与 feed 中

#### Scenario: 发布后下一次构建生效

- **WHEN** 编辑发布了一篇条目，随后构建管线运行
- **THEN** 该条目出现在对应集合的列表页、详情页与 feed 中

#### Scenario: CMS 下线不影响线上

- **WHEN** Strapi 服务停止
- **THEN** 线上站点所有页面继续正常服务，行为与 CMS 在线时完全一致

### Requirement: 投稿与审发角色分离

Strapi 后台 SHALL 区分作者与编辑两类角色：作者可以创建和编辑自己的草稿但 SHALL NOT 能发布；发布权限 SHALL 仅属于编辑及以上角色。发布动作即本内容线的人审闸。

#### Scenario: 作者不能发布

- **WHEN** 持作者角色的研究员对一篇就绪草稿点击发布
- **THEN** 发布被拒绝，条目保持草稿状态

#### Scenario: 编辑可以发布

- **WHEN** 持编辑角色者对同一草稿点击发布
- **THEN** 条目进入已发布状态，并触发发布事件

### Requirement: 条目双语成对

每个编辑性条目 SHALL 以 zh 与 en 两个语言版本关联为同一文档；构建 SHALL 在任一已发布条目缺少另一语言版本时失败，并指明条目标识与缺失语言。

#### Scenario: 缺语言版本构建失败

- **WHEN** 一篇条目只发布了 zh 版本而 en 版本缺失，站点构建运行
- **THEN** 构建以非零退出失败，错误信息指明该条目缺少 en 版本

#### Scenario: 成对完整正常渲染

- **WHEN** 一篇条目的 zh 与 en 版本均已发布
- **THEN** 两种语言的详情页与列表项均正常渲染，feed 携带两种语言条目

### Requirement: 发布前内部标识符拦截

Strapi SHALL 在发布动作上执行内部标识符检查（覆盖内部坐标、凭据形制、内部代号等类别清单）：命中时发布 SHALL 被阻止，提示 SHALL 指明命中的类别与位置；清单 SHALL 可由维护者扩充而无需改动检查逻辑。构建期 SHALL 对拉取内容执行同类检查作为兜底。

#### Scenario: 发布被拦

- **WHEN** 研究员发布一篇正文包含内部节点坐标的草稿
- **THEN** 发布被阻止，提示指明内部标识类别，草稿保持可编辑

#### Scenario: 修正后可发布

- **WHEN** 研究员移除命中的内部标识后再次发布
- **THEN** 发布成功

#### Scenario: 构建期兜底

- **WHEN** 一篇已发布内容包含内部标识（发布侧拦截被绕过或清单滞后），构建管线运行
- **THEN** 构建以非零退出失败，指出文件与命中的标识

### Requirement: 构建期拉取内容且失败即断

站点构建 SHALL 在内容检查之前从 Strapi 拉取全部已发布条目并写入内容集合；拉取失败（服务不可达、鉴权失败、应答畸形）SHALL 使构建以非零退出失败并可见，线上保持上一次良好部署；既有全部文件级门（退役标识、schema 校验、双语成对）SHALL 对拉取产物原样生效。

#### Scenario: CMS 不可达构建失败

- **WHEN** 构建运行而 Strapi 不可达
- **THEN** 构建失败且失败对运维可见，线上站点保持上一次部署不变

#### Scenario: 拉取产物过既有门

- **WHEN** 拉取的某篇内容字段不符合集合 schema
- **THEN** 构建在校验步骤失败并指明该篇内容

### Requirement: 发布到上线的延迟

一次发布事件 SHALL 在分钟级内触发站点构建管线（在既有 push 与定时触发之外的第三触发源）；定时重建 SHALL 保留为兜底，使漏掉的发布事件最迟在下个周期生效。

#### Scenario: 发布后分钟级上线

- **WHEN** 编辑发布一篇新内参
- **THEN** 该内参在 15 分钟内可在线上站点访问

#### Scenario: 触发丢失由定时兜底

- **WHEN** 发布 webhook 丢失
- **THEN** 最迟在下一次定时重建后该条目上线

### Requirement: 备份与仓内快照档案

Strapi 数据库与媒体文件 SHALL 有每夜备份且可恢复；已发布内容 SHALL 以 markdown 快照形式回存站点仓库作为审计档案；本地开发 SHALL 能在不访问 Strapi 的情况下用仓内快照完成构建。

#### Scenario: 灾备恢复

- **WHEN** Strapi 数据丢失
- **THEN** 可从每夜备份恢复数据库与媒体文件

#### Scenario: 离线本地构建

- **WHEN** 开发者未配置 Strapi 访问参数而运行本地构建
- **THEN** 构建使用仓内快照成功完成，并提示内容为快照

### Requirement: 范围围栏——仅编辑性集合走 CMS

只有内参、学院、研究三个集合 SHALL 由 Strapi 托管；apps、docs、releases、roadmap 等工程与营销集合 SHALL 继续以仓库为事实源，走既有 push 触发构建。

#### Scenario: 工程集合不受影响

- **WHEN** 工程师向仓库提交一篇新的 release note 并推送
- **THEN** 该内容经既有 push 触发的构建上线，与本变更引入的机制无关
