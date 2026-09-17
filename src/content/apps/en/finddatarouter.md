---
name: "FindDataRouter"
tagline: "One gateway entry for multiple LLM providers, with per-user tokens, quota management, and automatic failover across channels."
kind: "AI API gateway"
demoUrl: "https://token.finddatatech.cloud"
line: token
order: 10
---

FindDataRouter is our AI API gateway. It places multiple model providers
behind a single entry point, and it is also the model-calling backbone of
FindData Technology's own product matrix — Platform and LawBench both route
their model calls through this gateway.

## One entry, many providers

Applications do not integrate each model provider separately; they talk to
one gateway entry. The gateway sits in front of multiple model providers and
forwards each request to the model it asks for.

## Tokens issued per user

Every user has their own key. Tokens are issued and managed per user, each
with its own quota, so usage stays attributable to the individual user.

## Failover across channels

The same model can be served by multiple channels. When a channel fails or
its quota is exhausted, the request automatically escalates to an available
channel instead of failing outright.

Gateway entry: [token.finddatatech.cloud](https://token.finddatatech.cloud)
