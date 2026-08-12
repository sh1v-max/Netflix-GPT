const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
const GEMINI_MODEL = 'gemini-3.5-flash'

const GPT_QUERY =
  'Act as a Movie and TV Show Recommendation system — this includes anime, which counts as a TV show (or a movie, for standalone anime films) rather than its own category. Suggest 10 titles for the query, picking whichever of movie or TV fits each one best — the first one should be the title in the query itself (or the closest real match if the query is not a title). If earlier turns are present in this conversation, treat the newest user message as a follow-up refinement of them (e.g. "more like the third one but shorter" refers to the 3rd item of the most recent list you returned) rather than a standalone query. Respond with ONLY a raw JSON array, no markdown code fences, no commentary, in this exact shape: [{"name":"Title","mediaType":"movie or tv","reason":"one short sentence (under 15 words) on why this fits the query"}, ...]. Exactly 10 objects. "mediaType" must be exactly "movie" or "tv", lowercase. The "reason" for the first object should explain why it matches the query; for the rest, why someone who wants the query would also like it.'

// Multi-turn refinement (3.5) — the client sends prior turns as
// {query, names}; each becomes one user/assistant exchange in the chat
// history so Gemini can resolve references like "the third one" against
// its own earlier answer. Capped server-side too (not just trusting the
// client's own cap) since this crosses the same public endpoint as
// everything else here.
const MAX_HISTORY_TURNS = 5
const MAX_HISTORY_QUERY_LENGTH = 300

// Optional strict per-request category constraint — used by the "For You"
// section's three separate rows (Movies/TV Shows/Anime) so each row's
// call is guaranteed to only return that category, rather than relying on
// GPT_QUERY's general "picking whichever fits" behavior to naturally
// split evenly (it doesn't — a taste profile skewed toward one category
// made every suggestion come back as that category).
const CATEGORY_CONSTRAINTS = {
  movie: ' For this specific request, only suggest movies — no TV shows.',
  tv: ' For this specific request, only suggest TV shows — no movies.',
  anime: ' For this specific request, only suggest anime (Japanese animated movies or TV shows) — no live-action, no non-Japanese animation.',
}

// profileSummary is a short client-built sentence (buildPersonalizedPrompt,
// src/utils/) describing the user's taste graph — capped here since it
// crosses a public, unauthenticated endpoint and lands in the system
// prompt; the cap keeps a malformed/oversized value from bloating the
// request rather than acting as a real prompt-injection defense (same
// trust level as `query` itself, which has no such defense either).
const MAX_PROFILE_SUMMARY_LENGTH = 300

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://netflixgpt-e671d.web.app',
  'https://netflixgpt-e671d.firebaseapp.com',
]

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
})

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const headers = corsHeaders(origin)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers })
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers })
    }

    let query
    let profileSummary = ''
    let category = ''
    let history = []
    try {
      const body = await request.json()
      query = typeof body.query === 'string' ? body.query.trim() : ''
      profileSummary =
        typeof body.profileSummary === 'string'
          ? body.profileSummary.trim().slice(0, MAX_PROFILE_SUMMARY_LENGTH)
          : ''
      category = Object.prototype.hasOwnProperty.call(CATEGORY_CONSTRAINTS, body.category)
        ? body.category
        : ''
      if (Array.isArray(body.history)) {
        history = body.history
          .filter((turn) => turn && typeof turn.query === 'string' && Array.isArray(turn.names))
          .slice(-MAX_HISTORY_TURNS)
          .map((turn) => ({
            query: turn.query.trim().slice(0, MAX_HISTORY_QUERY_LENGTH),
            names: turn.names.filter((n) => typeof n === 'string').slice(0, 10),
          }))
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt =
      (profileSummary ? `${GPT_QUERY} ${profileSummary}` : GPT_QUERY) +
      (category ? CATEGORY_CONSTRAINTS[category] : '')

    // Prior turns become real user/assistant exchanges (not flattened into
    // one text blob) so Gemini's own multi-turn handling resolves ordinal
    // references naturally — the assistant reply is reconstructed as the
    // same JSON shape it originally returned, just names-only (no
    // reasons needed to establish "what was suggested").
    const historyMessages = history.flatMap((turn) => [
      { role: 'user', content: turn.query },
      {
        role: 'assistant',
        content: JSON.stringify(turn.names.map((name) => ({ name, reason: '' }))),
      },
    ])

    try {
      const geminiResponse = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GEMINI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GEMINI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...historyMessages,
            { role: 'user', content: query },
          ],
        }),
      })

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text()
        return new Response(JSON.stringify({ error: 'Upstream error', detail: errText }), {
          status: 502,
          headers: { ...headers, 'Content-Type': 'application/json' },
        })
      }

      const data = await geminiResponse.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) {
        return new Response(JSON.stringify({ error: 'No response from model' }), {
          status: 502,
          headers: { ...headers, 'Content-Type': 'application/json' },
        })
      }

      // Models occasionally wrap JSON in a ```json fence despite being told
      // not to — strip that before parsing rather than failing the request.
      const stripped = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
      let results
      try {
        results = JSON.parse(stripped)
      } catch {
        return new Response(
          JSON.stringify({ error: 'Model returned malformed JSON', detail: content }),
          { status: 502, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }
      if (!Array.isArray(results) || results.length === 0) {
        return new Response(JSON.stringify({ error: 'Model returned no results' }), {
          status: 502,
          headers: { ...headers, 'Content-Type': 'application/json' },
        })
      }

      // Normalize mediaType defensively — the prompt asks for exactly
      // "movie"/"tv" but nothing stops the model from drifting (extra
      // whitespace, wrong case, "TV Show", omitting it entirely).
      results = results.map((r) => {
        const normalized = typeof r?.mediaType === 'string' ? r.mediaType.trim().toLowerCase() : ''
        return { ...r, mediaType: normalized === 'tv' ? 'tv' : 'movie' }
      })

      return new Response(JSON.stringify({ results }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Proxy error', detail: String(err) }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }
  },
}
