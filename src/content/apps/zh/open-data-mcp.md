---
name: "开放数据 MCP"
tagline: "把 akshare、yfinance、EDGAR 等多个数据库统一进单一语义 schema，AI 智能体按概念与实体查询金融经济数据——百方信源，一个入口。"
kind: "开源数据平台"
demoUrl: "https://www.finddatatech.cloud/demo"
line: wire
order: 10
---

fd-open-data-mcp 是「寻数·柏讯」线的核心——让 AI 替你读世界。它是一个开放数据本体 MCP：把多个 Python 数据库统一进单一语义 schema，让 AI 智能体以概念和实体的方式查询金融与经济数据，而不是逐个适配各家数据源的 API。背后是一条爬虫平台，从百方信源持续供给这个本体。

## 一个语义 schema，多个数据源

akshare、yfinance、EDGAR、World Bank、CNStats 等 Python 数据库被映射进同一个语义 schema——`semantic_observations`。智能体按概念和实体提问：茅台的 `price.close`、中国的 GDP。系统在多源之间解析查询，按质量排序，某一源不可用时故障转移，并定时刷新。

## 开源的 fd-* 包家族

fd-* 系列包全部开源：可从 PyPI 安装，代码在 GitHub 的 FindDataOfficial 组织下。

## 进一步了解

- [文档](/zh/docs)
- [在线演示](/zh/demo)
- [指标目录](/zh/indicators)
- [fd-open-data-mcp 旗舰介绍](/zh/fd-open-data-mcp)
