---
name: "萬星服务平台"
tagline: "Agent 服务的对外运行与服务平台——部署、驻留、门面、计费与机群观测；标准 A2A 端点，按时长计费。"
kind: "Agent 服务平台"
demoUrl: "https://wanxing.finddatatech.cloud"
line: constellation
order: 5
---

寻数·萬星线的方向是「人与人经由各自的智能体相连——自主采集信息、深度协作」，FindDataRouter 是第一颗星。萬星服务平台是让这些智能体真正上线的那一层：把 agent 部署到机群、驻留运行、以标准端点对外供调用，并按用量结算——万星各就各位。公开目录人人可浏览；部署者用寻数账号登录控制台管理机群。

## 部署与驻留

智能体被部署到机群上并持续驻留运行，每个部署以 slug 标识、获得稳定的对外地址。部署者控制台管理部署清单（暂停 / 恢复），以及私有 agent 的调用者允许清单。

## 标准 A2A 门面

外部调用走原生 A2A——JSON-RPC 2.0 over HTTP，`message/send` 同步返回、`message/stream` SSE 流式；鉴权用调用键（Bearer 头）。`Idempotency-Key` 保证重放安全：24 小时重放窗内同键重放返回首次完整应答，不跑第二个回合、不产生第二条计费。端点形状：`POST /api/wanxing/v1/a2a/<agentSlug>`。

## 计量与计费

按时长计费、分钟向上取整，回合结束即时结算；agent 回合的实际消耗由部署者承担，平台按时长向调用者的键结算。失败回合（平台侧 / 上游错误）不计费但会记账；余额或消费窗不足即拒付（fail-closed）。

## 机群观测

控制台给部署者完整的机群视图：各 runner 的部署水位、24 小时回合计数、队列与滞后，以及单个 agent 的生命周期时间线——从请求准入、回合开始、唤醒到结算，一条因果链可下钻。身份使用寻数账号（Logto）登录，私有数据不外泄。

## 在线体验

[打开萬星](https://wanxing.finddatatech.cloud)。