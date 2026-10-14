---
name: "萬星连接器"
tagline: "连一次账户，agent 得到千只手——1500+ 外部服务、万级预置动作，统一凭据库，可控可审计。"
kind: "Agent 连接网关"
demoUrl: "https://connector.finddatatech.cloud"
line: constellation
order: 15
---

外部 SaaS 的账户和凭据散落在各个工具里，agent 想代你操作它们，缺的是一个统一的
连接层。萬星连接器就是这个层：用 OAuth 或 API key 把 GitHub、飞书、钉钉、Gmail、
Notion、Slack、企查查、高德、小红书、Airtable 等 1500+ 外部服务连一次，agent
从此获得万级预置动作——发消息、查工商信息、读表格、抓物流，直接可执行。

## 它是什么

一个多租户连接网关：每用户连接凭证库 + MCP/HTTP 执行面。凭据、授权 scope、
动作 schema、执行策略、脱敏运行日志，全部收在一个可检视的运行时里，而不是
散落在 prompt 或各处脚本中。动作是预置的——每个动作带请求/响应 schema 和所需
权限声明，agent 调用前可先查指南（手册即工具），不用猜接口。

## 怎么用

三条路，按你所在的平台自然接上：

- **壹座（platform.finddatatech.cloud）**：在壹座里零粘贴连接——页面直接拉起
  连接器控制台授权，完成后凭据自动回流壹座 agent 的凭据轨道，对话里让 agent
  调用即可，全程不复制粘贴任何密钥。
- **柏讯（wire.finddatatech.cloud）**：柏讯平台的「连接器取数」用同一套连接，
  把外部服务的数据接进数据集，走上传数据同一条加工链路。
- **控制台（connector.finddatatech.cloud）**：统一寻数账号登录，管理连接、
  查看每个动作的执行日志。

## 安全与可控

凭证加密存储，运行日志脱敏后才落盘；动作级允许/阻断策略控制 agent 能执行
什么，执行面不对公网暴露——外部调用一律经壹座或柏讯的准入轨道进来。

## 在线体验

[打开萬星连接器控制台](https://connector.finddatatech.cloud)，用寻数账号登录
后即可连接你的第一个外部服务。
