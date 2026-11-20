---
name: "fd-bot"
tagline: "A self-hosted IM transport layer: it understands platform protocols and connections, not rooms, seats or billing. Seven legs, one contract, credentials that never leave the service."
kind: "IM transport service"
line: base
order: 30
---

fd-bot is the layer left behind when we moved IM integration out of each
application process. It holds platform credentials and connections, does
signature verification and decryption, normalizes each platform's native payload
into one envelope, and returns a classified delivery verdict. It does not do
rooms, seats, billing or copy — those belong to the caller.

The boundary in one line: **fd-bot knows what a platform lets you do, not what
you want to do with it.**

## Why this layer exists

Protocol code used to live inside application images. That carried three
measurable costs:

- Changing one sentence of group copy or one timeout meant running the image
  pipeline end to end (snapshot → build → push → manifest → roll).
- The contract, the implementation and the capability gate sat in three places:
  a new platform could ship without declaring its outbound shape and nothing went
  red — the panel simply reported that leg as unable to send.
- Every application instance dialled the platforms itself, so N instances meant
  N long connections, N credential copies and N reconnect state machines.

After the move: adding a platform is one module and one restart.

## The one piece of semantics it owns

Exactly one: **the capability declaration**. Every platform adapter must state
its outbound shape:

| `outbound.mode` | Meaning |
|---|---|
| `url-keyed` | Credential travels in the URL / body / header; no caller-IP allowlist — an egress change cannot break it |
| `proactive-ip-gated` | Can send unprompted, but only from an allowlisted IP |
| `passive-window` | Can only reply inside a window a recent inbound opened |
| `none` | No outbound path at all |

The declaration lives in the same file as the code that sends, and the service
validates it at startup: **a missing declaration stops the process**, not a
warning. The reason is measured, not theoretical — one leg once shipped without
one, and the panel reported a working bot as unable to send.

## Seven legs

| Platform | Inbound | Outbound capability |
|---|---|---|
| WeCom intelligent robot | Long connection (we dial; no public callback) | `url-keyed` (measured) |
| WeCom self-built app | Callback | `proactive-ip-gated` |
| WeCom group robot | None (push-only) | `url-keyed` |
| WeChat official account | Callback | `proactive-ip-gated` |
| Feishu / Lark | Long connection or callback | `url-keyed` |
| Slack | Callback | `url-keyed` |
| Telegram | Polling or callback | `url-keyed` |

The WeCom robot leg deserves its own line: after moving to the official SDK's
long connection it is no longer bound by the trusted-IP allowlist, and it no
longer has only a one-hour passive reply window. Sending proactively with **no
prior inbound** was measured working, so its capability is the honest
`url-keyed` — the first WeCom leg that survives an egress change.

## The contract

```
POST   /v1/bindings          create a leg; returns capability + callback URL
GET    /v1/bindings          list, with connection health
DELETE /v1/bindings/:id      stop the connection, then retire
POST   /v1/send              send; failures classified, never 5xx
POST   /v1/callbacks/:p/:s   platform callback (POST and the GET handshake)
GET    /v1/media/:ticket     short-lived address for one media item
```

The envelope is fixed, so a consumer never branches on platform:

```json
{
  "platform": "wecom-bot",
  "bindingId": "b_...",
  "chatKey": "wr...",
  "chatType": "group",
  "senderId": "...",
  "senderName": "...",
  "text": "...",
  "media": [{ "kind": "image", "url": "/v1/media/..." }],
  "platformMessageId": "...",
  "receivedAt": 1795180975208
}
```

## Three questions that come up

**Why does a failed send return 200?** Because "the egress address is not
accepted" and "the passive reply window closed" are the **platform's** verdicts,
not this service's failure. Answering 5xx would make a generic retry layer hammer
a call that can never succeed. They travel as `200 {ok:false, failure}`, and the
classification is ours to decide — never a substring match on vendor prose, which
a platform can reword any day.

**Why does media arrive as an address, not bytes?** Bytes in the envelope would
turn a transport layer into a storage service with a quota problem. The envelope
carries an HMAC-signed ticket (five minutes by default); the bytes are fetched
and decrypted on demand. A caller-supplied URL is never fetched — the SSRF
surface is closed inside the service.

**What happens when the service is down?** The caller gets a decidable failure
(connection refused, timeout, non-2xx) and decides whether to queue or alert. The
service never masks its own unavailability behind an empty set or a success
status — "the transport is down" and "nobody is messaging" must stay
distinguishable.

## Source

Open source on GitHub, MIT:

- [fd-bot repository](https://github.com/FindDataTechnology/fd-bot)
- [Operations manual](https://github.com/FindDataTechnology/fd-bot/blob/main/docs/OPERATIONS.md)

Single-replica deployment, bindings in Postgres, an acceptance queue on disk
(persist before acking the platform; replay on restart). The image is built on
our own registry chain, so it never depends on an upstream registry being
reachable.
