// Same-origin proxy for the /demo playground.
// Translates the browser's {query, date} POST into an MCP `ai_search`
// tool call against the backend, injecting the bearer token server-side.
// The token never reaches the browser (spec: demo-playground → Token never exposed).
//
// Run:  MCP_TOKEN=... node server/demo-proxy.mjs        (default port 8898)
import { createServer } from 'node:http';

const PORT = Number(process.env.PROXY_PORT ?? 8898);
const MCP_URL = process.env.MCP_URL ?? 'http://127.0.0.1:8899/mcp';
const TOKEN = process.env.MCP_TOKEN ?? '';

async function mcpRequest(sessionId, body) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}: ${text.slice(0, 200)}`);
  const ct = res.headers.get('content-type') ?? '';
  const session = res.headers.get('mcp-session-id');
  if (ct.includes('text/event-stream')) {
    // SSE: pick up `data:` lines (a single JSON payload for tool responses).
    const data = text
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .join('');
    return { json: JSON.parse(data || '{}'), sessionId: session };
  }
  return { json: JSON.parse(text || '{}'), sessionId: session };
}

async function handleQuery({ query, date }) {
  if (!query || typeof query !== 'string') throw new Error('missing query');

  // 1. Initialize a session.
  const init = await mcpRequest(null, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'fd-web-demo', version: '1.0.0' },
    },
  });
  const sessionId = init.sessionId;

  // 2. Mark initialized.
  await mcpRequest(sessionId, { jsonrpc: '2.0', method: 'notifications/initialized' });

  // 3. Call ai_search (natural language → concepts + entities + values).
  const args = { query, include_values: true, limit: 10 };
  if (date) args.value_date = date;
  const call = await mcpRequest(sessionId, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { name: 'ai_search', arguments: args },
  });
  const result = call.json.result ?? call.json;
  if (result?.isError) {
    const msg = result.content?.[0]?.text ?? 'MCP tool error';
    throw new Error(msg);
  }
  const text = result?.content?.find((c) => c.type === 'text')?.text ?? JSON.stringify(result);
  return text;
}

createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    return res.end('ok');
  }
  if (req.method === 'POST' && req.url === '/query') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      try {
        const text = await handleQuery(JSON.parse(body || '{}'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(text);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  res.writeHead(404);
  res.end('not found');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`demo-proxy on 127.0.0.1:${PORT} → ${MCP_URL}`);
});
