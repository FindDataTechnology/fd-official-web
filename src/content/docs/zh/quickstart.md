---
title: 快速开始
order: 1
description: 安装并运行开放数据本体 MCP——以概念与实体的方式查询数据，获得按质量排序、故障转移并定时刷新的答案。
---

# 快速开始

安装并运行开放数据本体 MCP——以概念与实体的方式查询数据，获得按质量排序、故障转移并定时刷新的答案。

## 安装

```bash
uv sync                  # 基础安装

# 如需完整数据源支持（akshare、yfinance、edgar、世界银行等）
uv sync --extra data
```

设置 `FINDDATA_ROOT`（默认为上级 `finddata/` 目录）以定位 `fd-*` 提供方；使用 SEC EDGAR 数据前需设置 `EDGAR_IDENTITY="your_email@example.com"`。

## 初始化本体

```bash
# 1. 创建本体数据表
fd-open-data-mcp migrate

# 2. 导入目录（akshare、yfinance、cn-gov、cn-report、edgar 等）
fd-open-data-mcp import-catalog
# 或单个提供方：  fd-open-data-mcp import-catalog akshare

# 3. 将 indicator_defs 消费为概念，并提出列→概念绑定
fd-open-data-mcp consume-concepts
fd-open-data-mcp propose-bindings

# 4. 为各数据源播种实体标识（股票、国家等）
fd-open-data-mcp seed-entities

# 5. 按概念频率生成刷新调度
fd-open-data-mcp generate-schedules
```

## 读取数据

```bash
fd-open-data-mcp read --concept-id 234 --entity-type stock --entity-id 1 --date 2024-07-26
```

## 以 MCP 服务方式运行

```bash
fd-open-data-mcp serve        # stdio 传输
```

也可以使用 AI 搜索工具（`ai_search`）直接以自然语言完成 查询 → 概念 → 实体 → 数值 的完整链路。

## 远程访问

站点已完成 HTTPS 切换，可将远程 MCP 地址 `https://www.finddatatech.cloud/mcp` 配合组织提供的 bearer token 供智能体客户端接入。网页演示与远程 MCP 端点均已通过 HTTPS 提供。
