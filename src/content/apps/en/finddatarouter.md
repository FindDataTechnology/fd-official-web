---
name: "FindDataRouter"
tagline: "One gateway entry for multiple LLM providers — chat plus speech, rerank, search and video generation, on one key and one ledger."
kind: "AI API gateway"
demoUrl: "https://router.finddatatech.cloud"
line: constellation
order: 10
---

FindDataRouter is our AI API gateway — and the first star of the Constellation
line (寻数·萬星), shipped under the product name **萬星·词元 (Wanxing Ciyuan)**.
That line's direction: people connected through their own agents, agents that
gather information on their own and talk to each other. Before agents can talk,
they need identity and a route to intelligence — this gateway is both. It
places multiple model providers behind a single entry point, and it is also the
model-calling backbone of FindData Technology's own product matrix — Platform
and LawBench both route their model calls through this gateway.

## One entry, many providers

Applications do not integrate each model provider separately; they talk to
one gateway entry. The gateway sits in front of multiple model providers and
forwards each request to the model it asks for. The chat entry speaks both the
OpenAI and the Anthropic wire formats, so existing applications need no change.

## Keys issued per user

Every user has their own key. Keys are issued and managed per user, each with
its own quota, so usage stays attributable to the individual user. Balance and
spending windows are hard financial ceilings — no surprise bills.

## Failover across channels

The same model can be served by multiple channels. When a channel fails or
its quota is exhausted, the request automatically escalates to an available
channel instead of failing outright.

## Model lanes: capabilities beyond chat

Beyond the chat subscription pool, the gateway offers three non-chat model
capabilities — **speech, rerank and search** — plus **video generation**.
They share the same API key, the same balance and spending windows, and the
same usage panel as chat: changing capabilities does not change your identity.

- **Speech** (`/v1/audio/transcriptions`, `/v1/audio/speech`): transcription and
  synthesis in the OpenAI audio wire format, metered by audio duration and by
  synthesized characters.
- **Rerank** (`/v1/rerank`): the Cohere/Jina shape — submit a query and a set
  of documents, get back results ordered by relevance, metered per request.
- **Search** (`/v1/search`): a unified envelope — one engine selector fronts
  multiple search providers, so switching engines requires no caller change,
  metered per call.
- **Video generation** (`/v1/contents/generations/tasks`): an asynchronous task
  protocol — create a task and receive its ID, poll the same path for status,
  then fetch the result once done; the same key and balance as chat, metered by
  generation usage, and failed tasks are not billed.

Upstream providers are pluggable: when the provider behind a model name
changes, the wire format and response semantics stay the same.

Gateway entry: [router.finddatatech.cloud](https://router.finddatatech.cloud)
