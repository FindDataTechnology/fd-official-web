# content-integrity Specification

## Purpose

让官网对外呈现的数字、名称与链接都与现行实现和真实产物对得上：规模数字必须来自构建期导出，系统名称必须与现行实现一致，入口链接必须可达——避免同一站点自相矛盾，或把访客引向已退役的对象。

## Requirements

### Requirement: Build-sourced numbers

官网对外文案中出现的规模数字（概念数、工具数、覆盖率、数据源数等）SHALL 来自构建期导出或随仓库提交的可溯源数据文件；SHALL NOT 在文案里手写。当某处需要数量而构建期没有来源时，该处 SHALL 改为不含具体数字的定性表述，而不是写一个无法复算的值。

#### Scenario: 旗舰页数字与首页同源

- **WHEN** 访客打开 `/fd-open-data-mcp` 或 `/zh/fd-open-data-mcp`
- **THEN** 页面上的概念数与工具数来自同一次构建的指标导出，并与首页统计一致

#### Scenario: 无来源的数字不出现

- **WHEN** 一段对外文案需要一个没有构建期来源的数量
- **THEN** 该处不出现具体数字，改为定性表述

### Requirement: No retired surfaces in copy

对外文案 SHALL NOT 引用已退役的组织名、域名或基础设施；文案中出现的系统名称 SHALL 与现行实现一致。站点 SHALL 提供一个可在本地与 CI 运行的内容检查，覆盖退役标识清单；命中时检查 SHALL 以非零退出码失败，并指出文件与命中的标识。

#### Scenario: 组织名与现行一致

- **WHEN** 任意对外文案提到 GitHub 组织
- **THEN** 使用的是 `FindDataTechnology`

#### Scenario: 检查捕获退役标识

- **WHEN** 内容检查运行，且某文件出现清单内的退役标识（`FindDataOfficial`、`craw.finddatatech.cloud`、`Scrapyd`）
- **THEN** 检查失败并列出文件路径与命中的标识

#### Scenario: 清单可由维护者扩充

- **WHEN** 又一处组织名、域名或基础设施退役
- **THEN** 将其加入退役标识清单即可被后续检查覆盖，无需改动检查逻辑

### Requirement: Reachable entry points

每个产品条目的演示/入口链接 SHALL 在发布前核验可达；核验不可达的入口 SHALL 在同一变更内被替换为可达入口或移除，SHALL NOT 保留死链对外。

#### Scenario: 不可达入口被替换或移除

- **WHEN** 某产品条目的入口经核验不可达
- **THEN** 该条目不再渲染入口 CTA，或已替换为经核验可达的入口

#### Scenario: 核验结果留痕

- **WHEN** 一个产品条目的入口发生变更
- **THEN** 该变更的记录里带有核验方式与结果（例如探针返回的状态码）
