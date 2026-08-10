---
title: 协议概览
order: 2
---

# 开放数据协议

`fd-open-data-protocol` 是数据源接入 `fd-open-data-mcp` 所需的清单契约。它让「一个 MCP，全源数据」成为可能：任何符合该协议的数据提供方都能成为本体中的一等数据源。

## 数据源清单声明的内容

一个合规数据源需发布描述以下内容的目录：

- **name** —— 提供方的稳定标识
- **functions** —— 支持的查询操作（如：获取日线、获取 GDP）
- **columns** —— 函数的物理输出字段
- **entity definitions** —— 覆盖的实体类型（股票、国家、行业等）
- **relationships** —— 实体间的关系
- **concepts** —— 能够提供的语义指标
- **bindings** —— 从自身列到本体概念的映射

MCP 将这些注册进本体数据库；随后 `propose-bindings` 提出列→概念映射，供语义层用来解析你的自然语言查询。

## 为什么重要

因为契约是显式的，MCP 可以按 质量 × 可达性 × 新鲜度 对候选数据源排序，从最优源获取、故障转移并缓存——无需为每个数据源编写特例逻辑。

完整清单 schema 与校验规则请见 [fd-open-data-protocol](https://github.com/FindDataTechnology/fd-open-data-protocol) 仓库。
