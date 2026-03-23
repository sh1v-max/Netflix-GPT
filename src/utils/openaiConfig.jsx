import OpenAI from 'openai'
import {OPENROUTER_KEY} from "./constant"

const openai = new OpenAI({
  apiKey: OPENROUTER_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  dangerouslyAllowBrowser: true,
})

export default openai
