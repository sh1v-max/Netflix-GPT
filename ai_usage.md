# AI usage in Cinegraph

How Cinegraph's "AI-powered search" feature actually works under the
hood, how we got to the current setup, and everything you need to
operate it (add/rotate keys, redeploy, debug, extend). This doc covers
the LLM integration only — TMDB (movie/show data) and Firebase (auth,
Firestore, Storage) are documented in `OVERVIEW.md`.

---

## 1. What the feature does

On `/home`, a user types a natural-language query ("something like
Inception, but shorter"). That query goes to an LLM, which returns 10
comma-separated movie names. Cinegraph then looks each of those names
up on TMDB (`searchMovieTMDB` in `GptSearch.jsx`) to get posters,
ratings, and IDs, and renders the results as movie cards.

The LLM's only job is: given a query, produce 10 relevant movie titles
in a specific comma-separated format. It does not know about TMDB, it
does not return posters or metadata — that's a separate step.

---

## 2. The history: three providers in one week

### 2a. OpenAI, direct (original)
The project started as a Netflix-clone tutorial and originally called
OpenAI's API directly. Cost money per request — not viable for a
learning project with no revenue.

### 2b. OpenRouter (first migration)
Switched to [OpenRouter](https://openrouter.ai) — an API that
aggregates many LLM providers behind one key and one OpenAI-compatible
endpoint, with a rotating selection of completely free (`:free`
suffix) models. This worked for a while using
`src/utils/openaiConfig.jsx`, pointed at `openrouter.ai/api/v1` with
`dangerouslyAllowBrowser: true` (explicitly opts into calling the API
directly from browser JS — OpenRouter is one of the few providers that
allows this for free-tier use).

**Why we moved off it**: OpenRouter's free model lineup rotates
without warning. The model hardcoded in this project
(`stepfun/step-3.5-flash:free`) was silently pulled from their catalog
at some point, and search started failing with no code change on our
end. Confirmed by querying `openrouter.ai/api/v1/models` directly and
seeing the model wasn't in the list anymore.

### 2c. Google Gemini + Cloudflare Worker proxy (current)
Landed on **Google Gemini** as the model provider, called through a
**Cloudflare Worker** that we own and deploy. This is the current,
working setup — everything below describes it in detail.

**Why Gemini**: Google's free tier is documented and stable (doesn't
rotate models out from under you the way OpenRouter's `:free` catalog
does). Confirmed via `ai.google.dev/gemini-api/docs/pricing` — several
Gemini models (`gemini-3.5-flash`, `gemini-2.5-flash`, etc.) are listed
as free of charge for standard usage, not a time-limited trial.

**Why a Cloudflare Worker in front of it, instead of calling Gemini
directly from the browser**: two separate problems, discovered in this
order —

1. **CORS**: Gemini's OpenAI-compatible endpoint
   (`generativelanguage.googleapis.com/v1beta/openai/`) does not send
   `Access-Control-Allow-Origin` headers for browser requests. A
   direct `fetch()` from `localhost:5173` gets blocked by the browser
   before the request even reaches Google — confirmed by hitting this
   exact error in dev tools (`has been blocked by CORS policy`).
   OpenRouter is unusual in explicitly supporting browser calls; most
   providers, Gemini included, assume server-to-server usage.
2. **Key exposure**: even if CORS weren't an issue, embedding an API
   key in frontend code (anything prefixed `VITE_` gets bundled into
   the shipped JS, readable by anyone via browser dev tools) is a real
   security risk — someone could lift the key and run up usage against
   your quota. This was already flagged as a known issue/TODO before
   the CORS problem was even hit (see `re-do.md` Phase 3.4).

So both problems point to the same fix: **the actual Gemini call has
to happen server-side**, behind something that (a) can set CORS
headers to allow our own frontend, and (b) holds the API key somewhere
the browser never sees.

**Why Cloudflare Workers specifically, not Firebase Cloud Functions**
(Firebase is already used for auth/Firestore/storage in this project,
so it was the obvious first choice): **deploying any Firebase Cloud
Function — even one that only calls Google's own Gemini API — requires
upgrading the Firebase project to the Blaze (pay-as-you-go) plan**,
which means attaching a billing card. This is true regardless of
whether actual usage stays inside the free monthly quota; Blaze is a
hard requirement just to `firebase deploy` a function at all (this
changed at some point — Cloud Functions 2nd gen runs on Cloud
Run/Cloud Build under the hood, which Google gates behind a billing
account as a safeguard). Confirmed via Firebase's own pricing docs.

Cloudflare Workers, by contrast, deploy on their **free plan with no
card required at all** — 100,000 requests/day, no billing account
needed to get started. For a single small proxy endpoint, that's a
much better fit.

---

## 3. Current architecture

```
Browser (GptSearch.jsx)
      │  fetch(GPT_PROXY_URL, { method: 'POST', body: { query } })
      │  (same-origin-friendly, CORS handled by the Worker)
      ▼
Cloudflare Worker  (gpt-proxy-worker/src/index.js)
      │  - holds GEMINI_KEY as an encrypted secret (never in git, never in frontend)
      │  - builds the system prompt + user query into a chat completion request
      │  - fetch(GEMINI_URL, { headers: { Authorization: Bearer GEMINI_KEY } })
      ▼
Google Gemini API  (generativelanguage.googleapis.com, OpenAI-compatible endpoint)
      │  returns { choices: [{ message: { content: "Movie1,Movie2,..." } }] }
      ▼
Worker extracts `content`, returns { content } to the browser
      ▼
Browser splits on comma, looks each title up on TMDB, renders results
```

The Worker is a **thin, dumb pass-through with one extra step**: it
injects the system prompt server-side (so the prompt itself isn't
visible/editable from the browser either) and holds the credential.
It does not do anything with TMDB — that lookup still happens entirely
client-side, same as before, since TMDB's key is a read-only public
API key and isn't sensitive the same way an LLM key is.

---

## 4. Where everything lives

| What | Where | Notes |
|---|---|---|
| Worker source code | `gpt-proxy-worker/src/index.js` | The Gemini call, the system prompt (`GPT_QUERY`), the model name, the CORS allowlist. This is the one file to edit for any prompt/model change. |
| Worker config | `gpt-proxy-worker/wrangler.toml` | Worker name (`cinegraph-gpt-proxy`), entry file, compatibility date |
| Worker's own deps | `gpt-proxy-worker/package.json` | Just `wrangler` as a devDependency — **separate from the main project's `package.json`**, not part of the Vite build |
| Gemini API key | Cloudflare Worker secret, name `GEMINI_KEY` | Set via `wrangler secret put`, never in any file in this repo. See §6. |
| Frontend call site | `src/components/gpt/GptSearch.jsx` (`runSearch`) | Plain `fetch()`, no SDK |
| Frontend config | `src/utils/constant.jsx` — exports `GPT_PROXY_URL` | Reads `import.meta.env.VITE_GPT_PROXY_URL` |
| Frontend env var | `.env` — `VITE_GPT_PROXY_URL` | The deployed Worker's URL. Safe to expose — it's just an endpoint, not a secret. |
| Deployed Worker URL | `https://cinegraph-gpt-proxy.singhshiv0427.workers.dev` | Live, currently deployed |

**What's gone / no longer exists**: `src/utils/openaiConfig.jsx`
(deleted), the `openai` npm package (uninstalled from the main
project — the Worker doesn't use it either, it calls Gemini with plain
`fetch`), `VITE_OPENROUTER_KEY` / `VITE_GEMINI_KEY` as frontend env
vars (removed — no LLM key of any kind lives in frontend code anymore).

---

## 5. What Cloudflare / Wrangler actually are, briefly

- **Cloudflare Workers**: a serverless platform — you write a small
  JS file with a `fetch(request, env)` handler, and Cloudflare runs it
  on their edge network (many locations worldwide) whenever a request
  hits your Worker's URL. No server to manage, scales automatically,
  generous free tier.
- **`wrangler`**: Cloudflare's official CLI for developing and
  deploying Workers. Installed as a devDependency inside
  `gpt-proxy-worker/`, invoked via `npx wrangler <command>`.
- **`wrangler.toml`**: the Worker's config file — name, entry point,
  compatibility date (pins which version of the Workers runtime
  APIs your code targets, similar in spirit to a `engines` field).
- **Worker secrets**: key/value pairs attached to a specific deployed
  Worker, encrypted at rest, injected into the Worker's `env` object
  at runtime. Write-only from the CLI/dashboard — once set, you can
  overwrite a secret but never read its value back out.

---

## 6. Operating this: common tasks

All commands below are run from `gpt-proxy-worker/` (`cd
gpt-proxy-worker` first), and `wrangler` needs a one-time login before
any of them work.

### First-time setup (already done once, documented for reference)
```bash
npm install                        # installs wrangler
npx wrangler login                 # opens a browser, sign in to Cloudflare (free, no card)
npx wrangler secret put GEMINI_KEY # paste the Gemini API key when prompted (no echo — that's normal)
npx wrangler deploy                # ships src/index.js to Cloudflare's edge
```
`wrangler deploy` prints the live URL
(`https://cinegraph-gpt-proxy.<subdomain>.workers.dev`) — that goes
into the main project's `.env` as `VITE_GPT_PROXY_URL`.

### Redeploying after editing `gpt-proxy-worker/src/index.js`
```bash
npx wrangler deploy
```
That's it — no need to touch secrets again unless the key itself
changed. The Worker's public URL stays the same across redeploys.

### Rotating/replacing the Gemini API key
```bash
npx wrangler secret put GEMINI_KEY
# paste the new key — this overwrites the old one immediately
```
No redeploy needed for a secret rotation; it takes effect on the next
request.

### Getting a new Gemini API key (if you ever need a fresh one)
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with a Google account
3. Click **Create API key** — free, no card
4. Copy it and run `wrangler secret put GEMINI_KEY` as above

### Checking the Worker is alive
```bash
curl -s -X POST https://cinegraph-gpt-proxy.singhshiv0427.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"query":"Inception"}'
```
Should return `{"content":"Inception,Interstellar,..."}`. If it
errors, check `npx wrangler tail` (streams live logs from the deployed
Worker) while re-running the curl command.

### Changing the model or the prompt
Both live in `gpt-proxy-worker/src/index.js` as `GEMINI_MODEL` and
`GPT_QUERY` constants at the top of the file. Edit, then
`npx wrangler deploy`. Current free Gemini models (as of this
migration): `gemini-3.5-flash` (in use), `gemini-3.5-flash-lite`,
`gemini-2.5-flash`, `gemini-2.5-pro`, `gemma-4` — check
`ai.google.dev/gemini-api/docs/pricing` for the current list, since
Google does add/retire models over time too (just far less
aggressively than OpenRouter's free tier).

### Adding a new frontend origin (e.g. a new deploy domain)
Edit `ALLOWED_ORIGINS` in `gpt-proxy-worker/src/index.js`, add the new
origin string, redeploy. Requests from origins not in that list will
still work for the actual POST (the Worker doesn't block them
server-side) but the browser will refuse to let JS read the response,
because the `Access-Control-Allow-Origin` header won't match — so in
practice it'll look like the fetch silently fails from that origin.

---

## 7. Costs and limits

| | Cloudflare Workers (proxy) | Google Gemini (`gemini-3.5-flash`) |
|---|---|---|
| Free tier | 100,000 requests/day | Free tier documented, generous quota; exact rate limit varies by model — check AI Studio's dashboard for your key's current limits |
| Card required | No | No (AI Studio key creation doesn't require one) |
| What happens over quota | Requests start failing until next day / until upgrading | Requests start failing (429) until quota resets |

For a personal/portfolio project's traffic level, neither limit should
realistically be hit. If Gemini search ever starts failing in a way
that looks like a quota issue (not a code error), check the AI Studio
dashboard for the key's current usage before assuming something broke.

---

## 8. Security notes

- The Gemini key exists in exactly one place outside Google's own
  systems: the `GEMINI_KEY` secret on the `cinegraph-gpt-proxy`
  Worker. It is not in this git repo, not in `.env` (as an active
  variable — see the backup-only commented line, §9), and not in the
  built/shipped frontend bundle.
- `.env` does contain a **commented-out** backup of the raw key value
  (`# GEMINI_KEY_BACKUP=...`), added on request purely so it isn't
  lost. `.env` is gitignored, so this never reaches version control —
  but if `.env` is ever shared, copied, or the repo's gitignore status
  changes, that comment goes with it. Worth deleting once you're
  confident you won't need the backup.
- If the key ever leaks (accidentally committed, pasted somewhere
  public, etc.), rotate it immediately: generate a new one in AI
  Studio, delete the old one there, and run `wrangler secret put
  GEMINI_KEY` with the new value.

---

## 9. Quick reference: env vars

**Main project (`.env`, gitignored)**:
```
VITE_TMDB_KEY="..."         # TMDB read access token (safe to expose — read-only)
VITE_GPT_PROXY_URL="https://cinegraph-gpt-proxy.singhshiv0427.workers.dev"
# GEMINI_KEY_BACKUP=...     # commented out, not read by the app — backup only, see §8
```

**Worker (`gpt-proxy-worker/`, no `.env` file at all)**:
The Worker has no env file — its one secret (`GEMINI_KEY`) lives in
Cloudflare's secret store, set via `wrangler secret put`, not in any
file that could accidentally get committed.
