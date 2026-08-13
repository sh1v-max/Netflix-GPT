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
titles as a JSON array — each with a classified `mediaType`
(`"movie"`/`"tv"`, covering anime too, since anime is just a TV show or
movie by TMDB's own data model) and a one-line `reason` explaining why
it fits. Cinegraph then looks each title up on TMDB
(`searchTitleTMDB`, routed to `/search/movie` or `/search/tv` based on
that classification) to get a real poster/rating/ID, and renders the
results as cards with the reason shown on hover.

Three things layer on top of the base search:
- **Personalization** — once you've rated 3+ titles, a short summary
  of your taste graph (favorite genres, era, what you avoid) rides
  along with every query, so results are shaped by what you actually
  like.
- **Multi-turn refinement** — up to 5 prior turns get sent as real
  conversation history, so "more like the third one but shorter"
  resolves against what was actually suggested last time.
- **"For You"** — three independent no-query rows (Movies / TV Shows /
  Anime) on the same page, each personalized from only that category's
  rating history, refreshed at most once a day per category.

The LLM's job is strictly: given a query (+ optional profile summary,
history, category constraint), produce 10 relevant titles in that JSON
shape. It does not know about TMDB, does not return posters or
metadata — that's a separate step done entirely client-side.

---

## 2. The history: three providers, one reverted mid-course

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

### 2d. Attempted OpenAI direct (explored, reverted same day)
Gemini's free tier turned out to cap at **20 requests/day**, regardless
of request size — hit that wall during normal development/testing, not
even real traffic. OpenAI's dashboard advertised a much larger free
daily token allotment (250K/day for flagship models, 2.5M/day for mini
models) for eligible accounts, so we tried switching — same
OpenAI-compatible shape Gemini's endpoint was already mimicking, so it
was close to a one-line change (`OPENAI_URL`/`OPENAI_MODEL`/
`env.OPENAI_KEY` in place of the `GEMINI_*` equivalents).

**Reverted after a live test**: the deployed Worker's first real
request to `api.openai.com` came back `"credit_balance_exhausted"` —
OpenAI's API rejects all requests, including ones that would fall
under the free daily allotment, unless the account has a funded/billed
balance. The "eligible for free daily usage" messaging in the OpenAI
dashboard isn't a fully standalone no-card tier in practice. Reverted
`gpt-proxy-worker/src/index.js` back to Gemini (confirmed via `git
diff` showing only comment-wording changes from the pre-attempt
version — no functional drift). The `OPENAI_KEY` Worker secret is
still set, harmless and unused, in case this gets revisited once
billing is set up.

**Real secret-exposure incident during this attempt, worth knowing
about**: setting the `OPENAI_KEY` secret the first time was done
incorrectly — `wrangler secret put <the actual key>` instead of
`wrangler secret put OPENAI_KEY` (the argument is the secret *name*,
the value goes at the following interactive prompt) — which put the
live key in shell history and a chat transcript. The key was revoked
and regenerated before it was ever actually used. If you're running
`wrangler secret put` yourself: the value always goes at the prompt,
never on the command line.

Currently back on **Gemini** — 2c above describes the live setup.

---

## 3. Current architecture

```
Browser (GptSearch.jsx)
      │  fetch(GPT_PROXY_URL, {
      │    method: 'POST',
      │    body: { query, profileSummary, history, category }
      │  })
      │  (same-origin-friendly, CORS handled by the Worker)
      ▼
Cloudflare Worker  (gpt-proxy-worker/src/index.js)
      │  - holds GEMINI_KEY as an encrypted secret (never in git, never in frontend)
      │  - builds the system prompt (GPT_QUERY + profileSummary +
      │    optional CATEGORY_CONSTRAINTS entry) + prior turns
      │    (as real user/assistant message pairs) + the new query
      │  - fetch(GEMINI_URL, { headers: { Authorization: Bearer GEMINI_KEY } })
      ▼
Google Gemini API  (generativelanguage.googleapis.com, OpenAI-compatible endpoint)
      │  returns { choices: [{ message: { content: '[{"name":...,"mediaType":...,"reason":...}, ...]' } }] }
      ▼
Worker strips an accidental ```json fence if present, JSON.parses it,
normalizes mediaType to exactly "movie"/"tv", 502s with a clear error
on anything malformed — returns { results } to the browser
      ▼
Browser routes each title to /search/movie or /search/tv based on its
mediaType (searchTitleTMDB), renders results with the reason on hover
```

The Worker is a **thin pass-through with a few extra steps**: it
injects the system prompt server-side (so it isn't visible/editable
from the browser), holds the credential, validates the model's JSON
response shape before forwarding it, and reconstructs multi-turn
history as real chat messages. It does not do anything with TMDB —
that lookup still happens entirely client-side, since TMDB's key is a
read-only public token and isn't sensitive the same way an LLM key is.

---

## 4. Where everything lives

| What | Where | Notes |
|---|---|---|
| Worker source code | `gpt-proxy-worker/src/index.js` | The Gemini call, the system prompt (`GPT_QUERY`), `CATEGORY_CONSTRAINTS`, the model name, the CORS allowlist. This is the one file to edit for any prompt/model change. |
| Worker config | `gpt-proxy-worker/wrangler.toml` | Worker name (`cinegraph-gpt-proxy`), entry file, compatibility date |
| Worker's own deps | `gpt-proxy-worker/package.json` | Just `wrangler` as a devDependency — **separate from the main project's `package.json`**, not part of the Vite build |
| Worker docs | `gpt-proxy-worker/README.md` | Shorter, setup-focused version of this doc |
| Gemini API key | Cloudflare Worker secret, name `GEMINI_KEY` | Set via `wrangler secret put`, never in any file in this repo. See §6. |
| Frontend call sites | `src/components/gpt/GptSearch.jsx` (`runSearch`), `src/hooks/useForYouRecommendations.jsx` | Plain `fetch()`, no SDK |
| Personalization | `src/utils/buildPersonalizedPrompt.jsx` | Turns a taste profile into the `profileSummary` string sent to the Worker |
| TMDB lookup | `src/utils/searchTitleTMDB.jsx` | Routes each result to `/search/movie` or `/search/tv` by its classified `mediaType` |
| Frontend config | `src/utils/constant.jsx` — exports `GPT_PROXY_URL` | Reads `import.meta.env.VITE_GPT_PROXY_URL` |
| Frontend env var | `.env` — `VITE_GPT_PROXY_URL` | The deployed Worker's URL. Safe to expose — it's just an endpoint, not a secret. |
| Deployed Worker URL | `https://cinegraph-gpt-proxy.singhshiv0427.workers.dev` | Live, currently deployed |
| CORS allowlist | `ALLOWED_ORIGINS` in `gpt-proxy-worker/src/index.js` | Currently: `localhost:5173`/`5174`, `https://cinewatchgraph-ai.web.app` (the current deployed frontend), plus the original `netflixgpt-e671d.*` origins (frozen site, kept for safety) |

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
Should return `{"results":[{"name":"Inception","mediaType":"movie","reason":"..."}, ...]}`
(10 objects). If it errors, check `npx wrangler tail` (streams live
logs from the deployed Worker) while re-running the curl command. Be
mindful this counts against Gemini's daily quota (§7) just like a real
search does — don't loop this for debugging.

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
| Free tier | 100,000 requests/day | **20 requests/day**, confirmed by hitting it directly (`RESOURCE_EXHAUSTED`, `generate_content_free_tier_requests` metric) — this is real, not generous for active development |
| Card required | No | No (AI Studio key creation doesn't require one) |
| What happens over quota | Requests start failing until next day / until upgrading | Requests start failing (429, surfaced as a Worker 502) until quota resets (daily) |

The Cloudflare side won't realistically be hit for a personal
project's traffic. **Gemini's 20/day easily will be** — every real
search, every "For You" category refresh, and any manual `curl`
testing all count against the same 20. If search starts failing in a
way that looks like a quota issue (not a code error), that's almost
certainly it — check the AI Studio dashboard, or just wait for the
daily reset. Enabling billing on the Google Cloud project raises this
substantially; not done yet for this project.

---

## 8. Security notes

- The Gemini key exists in exactly one place outside Google's own
  systems: the `GEMINI_KEY` secret on the `cinegraph-gpt-proxy`
  Worker. It is not in this git repo, not in `.env`, and not in the
  built/shipped frontend bundle.
- **A real incident already happened here, worth learning from**: a
  `.env` line kept a commented-out backup of the raw key
  (`# GEMINI_KEY_BACKUP=...`) "just in case." VS Code's Local History
  extension snapshotted `.env` (including that line) into `.history/`,
  which then got swept into a git commit by a broad `git add` and
  nearly reached GitHub before push protection caught it. Fixed by:
  removing the backup line entirely (a live key has no business
  sitting in a plaintext comment, however well-intentioned), untracking
  `.history/` and gitignoring it, and amending the commit before it
  ever successfully pushed. **Don't reintroduce a "backup" key comment
  in `.env`** — if the key is ever lost, just generate a new one (§6).
- If the key ever leaks (accidentally committed, pasted somewhere
  public, shown in a terminal/chat transcript, etc.), rotate it
  immediately: generate a new one in AI Studio, delete the old one
  there, and run `wrangler secret put GEMINI_KEY` with the new value.

---

## 9. Quick reference: env vars

**Main project (`.env`, gitignored)**:
```
VITE_TMDB_KEY="..."         # TMDB read access token (safe to expose — read-only)
VITE_GPT_PROXY_URL="https://cinegraph-gpt-proxy.singhshiv0427.workers.dev"
```
No LLM key of any kind belongs here — see §8 for why, including a real
incident where a "just a backup" comment nearly leaked one.

**Worker (`gpt-proxy-worker/`, no `.env` file at all)**:
The Worker has no env file — its one secret (`GEMINI_KEY`) lives in
Cloudflare's secret store, set via `wrangler secret put`, not in any
file that could accidentally get committed.
