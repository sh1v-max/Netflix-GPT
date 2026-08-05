const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
const GEMINI_MODEL = 'gemini-3.5-flash'

const GPT_QUERY =
  'Act as a Movie Recommendation system and suggest some movies for the query, only give me names of 10 movies, the first one should be the one same as the query, comma separated like the example result give ahead. For example: Result1,Result2,Result3,Result4,Result5. Notice there is no space between Result1 and Result2, etc. They are only comma separated. You need to give result in same format'

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
    try {
      const body = await request.json()
      query = typeof body.query === 'string' ? body.query.trim() : ''
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
            { role: 'system', content: GPT_QUERY },
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

      return new Response(JSON.stringify({ content }), {
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
