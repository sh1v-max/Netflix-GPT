# gpt-proxy-worker

A standalone [Cloudflare Worker](https://workers.cloudflare.com/) that
proxies AI search requests from Cinegraph to the [Gemini API](https://ai.google.dev/).
It exists so the Gemini API key never ships to the browser — Gemini
doesn't send CORS headers for browser-origin requests anyway, and
shipping a paid API key to every client would be a real security risk
even if it did.

Not part of the Vite build — deployed and versioned independently of
the main app.

## What it does

- Accepts `{ query, profileSummary, history, category }` from the
  frontend, builds a system prompt (personalization + multi-turn
  history + optional category constraint), and forwards it to Gemini's
  OpenAI-compatible chat completions endpoint.
- Asks for — and validates/parses — a strict JSON array response
  (`[{name, mediaType, reason}, ...]`), so a malformed model response
  502s with a clear error instead of reaching the client as garbage.
- Enforces a CORS allowlist (`ALLOWED_ORIGINS`) so only the app's own
  deployed origins (and local dev) can call it.

## Setup

```bash
cd gpt-proxy-worker
npm install
```

Set the Gemini key as a Worker secret (never in a `.env` file, never
committed):

```bash
npx wrangler secret put GEMINI_KEY
```

Paste your key at the prompt (from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).

## Local dev

```bash
npm run dev
```

## Deploy

```bash
npm run deploy
```

Prints the live Worker URL — set that as `VITE_GPT_PROXY_URL` in the
main app's `.env`.

## Adding a new origin

If you deploy the frontend to a new domain, add it to
`ALLOWED_ORIGINS` in `src/index.js` before redeploying — otherwise AI
search will silently fail with a CORS error on that domain.
