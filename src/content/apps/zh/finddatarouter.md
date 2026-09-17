---
name: "FindDataRouter"
tagline: "一个入口接入多家模型提供方：按用户发放 token、配额管理、渠道故障自动转移。"
kind: "AI API 网关"
demoUrl: "https://token.finddatatech.cloud"
line: token
order: 10
---

FindDataRouter 是寻数科技的 AI API 网关。它把多家模型提供方统一在一个入口后面，同时也是寻数科技自有产品矩阵的模型调用底座——Platform 与 LawBench 的模型调用都经由这个网关。

## 多家模型，一个入口

应用无需逐一对接每家模型提供方，只需接入唯一的网关入口。网关位于多家模型提供方之前，把每个请求转发到所请求的模型。

## 按用户发放 token

每个用户有自己的密钥。token 按用户发放与管理，各自带有独立的配额，用量可归属到具体用户。

## 多渠道故障转移

同一模型可由多个渠道服务。某个渠道失败或配额耗尽时，请求会自动升级到可用渠道，而不是直接报错。

入口：[token.finddatatech.cloud](https://token.finddatatech.cloud)
