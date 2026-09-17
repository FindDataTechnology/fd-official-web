---
name: "Platform"
tagline: "基于 DeepSeek Harness 运行时的本地优先 AI 助手平台：流式智能体对话、文档 RAG、MCP 扩展，网页与桌面双端同一 UI。"
kind: "AI 助手平台"
demoUrl: "https://craw.finddatatech.cloud"
line: paas
order: 10
---

Platform（v1.3.0）是构建在 DeepSeek Harness（dsh）运行时之上的 AI 助手，同时提供网页端与 Electron 桌面客户端（macOS .dmg / Windows .exe），双端界面完全一致。

## 流式智能体对话

对话以流式方式实时呈现完整的智能体执行过程：思维链、工具调用、技能执行一目了然。每场对话都可以自选模型与智能体。

## 自有文档 RAG

导入你自己的 PDF、Markdown、纯文本文件，或直接填入网页 URL。Platform 在本地建立索引，并在对话中据此检索，让回答立足于你的文档。

## 智能体、MCP 与定时任务

对话之外，平台还内置一整套能力：

- MCP 扩展运行时管理
- 智能体/应用目录，支持云端刷新
- 定时任务（cron）
- 会话与聊天历史持久化
- 系统状态面板

## 本地优先

单条命令即可启动，所有数据存于本地 SQLite；密钥与令牌只留在服务端，不进浏览器。界面中文优先，另提供 en/es/fr/ja 四种语言。

## 在线体验

[打开演示](https://craw.finddatatech.cloud)。
