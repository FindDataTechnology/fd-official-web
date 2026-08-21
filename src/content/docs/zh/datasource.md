---
title: 接入数据源
order: 3
description: 将任意数据源作为一等提供方接入本体。
---

# 接入数据源

将任意数据源作为一等提供方接入本体。

## 1. 发布清单

构建符合 `fd-open-data-protocol` 清单契约的目录——声明你的 functions、columns、实体定义、关系、概念与绑定（参见[协议概览](/zh/docs/protocol)）。

## 2. 注册

```bash
# 本地清单文件
fd-open-data-mcp register-datasource ./my-manifest.yaml

# 或暴露目录的 Python 模块
fd-open-data-mcp register-datasource my_provider:CATALOG
```

注册会将你的实体、函数、概念与初始绑定摄入本体数据库。

## 3. 提出并确认绑定

```bash
fd-open-data-mcp propose-bindings
fd-open-data-mcp review-bindings     # 查看低于阈值的待审队列
fd-open-data-mcp confirm-binding <id>
```

## 4. 上线

绑定完成后，你的列即在本体概念下解析——语义层可与其它提供方一样对你的数据源进行排序、获取，并复用相同的故障转移与刷新机制。
