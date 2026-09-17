---
name: "开放数据 MCP 与 DAAS"
tagline: "把 akshare、yfinance、EDGAR 等多个数据库统一进单一语义 schema，AI 智能体按概念与实体查询金融经济数据；DAAS 让整个平台在本地运行。"
kind: "开源数据平台"
demoUrl: "https://www.finddatatech.cloud/demo"
line: data
order: 10
---

fd-open-data-mcp 与 DAAS 构成寻数科技的数据条线。核心是一个开放数据本体 MCP：把多个 Python 数据库统一进单一语义 schema，让 AI 智能体以概念和实体的方式查询金融与经济数据，而不是逐个适配各家数据源的 API。

## 一个语义 schema，多个数据源

akshare、yfinance、EDGAR、World Bank、CNStats 等 Python 数据库被映射进同一个语义 schema——`semantic_observations`。智能体按概念和实体提问：茅台的 `price.close`、中国的 GDP。系统在多源之间解析查询，按质量排序，某一源不可用时故障转移，并定时刷新。

## 开源的 fd-* 包家族

fd-* 系列包全部开源：可从 PyPI 安装，代码在 GitHub 的 FindDataOfficial 组织下。

## DAAS：整个平台，本地运行

DAAS 把数据条线打包成一个本地平台。一条 curl 命令完成安装；所有数据落在单个 SQLite 文件里，由合并后的 fd-daas-mcp 服务器统一对外——161 个 MCP 工具、18 个 Claude Code 技能。它在你自己的机器上运行，数据始终在你手里。

## 进一步了解

- [文档](/zh/docs)
- [在线演示](/zh/demo)
- [指标目录](/zh/indicators)
- [fd-open-data-mcp 旗舰介绍](/zh/fd-open-data-mcp)
