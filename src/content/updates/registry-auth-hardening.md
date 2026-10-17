---
date: "2026-10-08"
line: facet
kind: fix
title_zh: "MCP 网关鉴权加固"
title_en: "MCP gateway auth hardening"
summary_zh: "修了三处会让使用者困惑的鉴权行为：密钥校验返回生效后的分组而非原始快照、付费档在预检接口上同样生效、401 响应不再重复携带认证头。空分组快照的密钥回落到社区档。"
summary_en: "Three auth behaviours that confused users are fixed: key validation now returns effective groups rather than the raw snapshot, paid tiers gate the pre-check endpoint too, and 401 responses no longer carry duplicate authentication headers. Keys with empty group snapshots fall back to the community tier."
url: "https://github.com/FindDataTechnology/fd-mcp-registry"
---


