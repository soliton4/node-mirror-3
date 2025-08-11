// server/openaiClient.js
// Minimal OpenAI wrapper for “messages in → answer out”
// ESM module. Requires: npm i openai

import OpenAI from "openai";
import { getConfig } from '../configLoader.js'



const { openaiapikey } = await getConfig();

/**
 * Create a singleton client (reads OPENAI_API_KEY from env).
 * You can also pass an explicit key via createClient({ apiKey }).
 */
let _client = null;
export function createClient(opts = {}) {
  if (_client) return _client;
  _client = new OpenAI({
    apiKey: openaiapikey,
  });
  if (!_client.apiKey) {
    throw new Error("Missing OpenAI API key. Set OPENAI_API_KEY env var.");
  }
  return _client;
}

/**
 * Convert a classic ChatGPT-style messages array
 *   [{ role: "user"|"assistant"|"system", content: "text" | [{type:'text',text:'...'}]}]
 * into Responses API input format.
 */
function toResponsesInput(messages) {
  const fixContent = (role, content)=>{
    return content.map((c)=>{
      if (role === 'user'){
        if (c.type === "text"){
          c.type = "input_text";
        }
      }else if(role === 'assistant'){
        if (c.type === "text"){
          c.type = "output_text";
        }
      }else{
        console.log(role);
        console.log(content);
      }
      return c;
    });
    
  };
  return messages.map((m) => {
    // Normalize content to array of text parts
    if (typeof m.content === "string") {
      return { role: m.role, content: [{ type: "input_text", text: m.content }] };
    }
    // Already structured (pass through)
    if (m.content.type == "text"){
      m.content.type = "input_text";
    }
    let ret = { role: m.role, content: fixContent(m.role, m.content) };
    return ret;
  });
}

/**
 * Extract aggregated text from a Responses API response.
 * (SDKs expose `output_text` for convenience; fall back to manual aggregation.)
 */
function extractText(resp) {
  if (resp.output_text) return resp.output_text;
  const parts = [];
  for (const item of resp.output ?? []) {
    if (item.type === "message") {
      for (const c of item.content ?? []) {
        if (c.type === "output_text" && typeof c.text === "string") {
          parts.push(c.text);
        }
      }
    }
  }
  return parts.join("");
}

/**
 * Simple, non-streaming call.
 * @param {Object} params
 * @param {Array}  params.messages  chat messages
 * @param {string} [params.model="gpt-4.1"] any available text model
 * @param {number} [params.temperature] optional
 * @param {number} [params.maxOutputTokens] optional
 * @param {AbortSignal} [params.signal] optional AbortController.signal
 * @returns {Promise<{ text: string, raw: any }>}
 */
export async function chat({
  messages,
  model = "gpt-4.1",
  temperature,
  maxOutputTokens,
  signal,
} = {}) {
  console.log("calling chat");
  console.log(messages);
  const client = createClient();
  const input = toResponsesInput(messages);
  const resp = await client.responses.create(
    {
      model,
      input: input,
      ...(temperature !== undefined ? { temperature } : null),
      ...(maxOutputTokens !== undefined
        ? { max_output_tokens: maxOutputTokens }
        : null),
    },
    { signal }
  );
  return { text: extractText(resp), raw: resp };
}

/**
 * Streaming call as an async generator yielding text chunks.
 * Usage:
 *   for await (const chunk of chatStream({ messages })) { ws.send(chunk) }
 *
 * @param {Object} params — same options as chat()
 * @yields {string} text chunk
 */
export async function* chatStream({
  messages,
  model = "gpt-4.1",
  temperature,
  maxOutputTokens,
} = {}) {
  const client = createClient();
  const stream = await client.responses.stream({
    model,
    input: toResponsesInput(messages),
    ...(temperature !== undefined ? { temperature } : null),
    ...(maxOutputTokens !== undefined
      ? { max_output_tokens: maxOutputTokens }
      : null),
  });

  try {
    for await (const event of stream) {
      // The SDK emits granular events; we forward only plain text deltas.
      if (event.type === "response.output_text.delta") {
        yield event.delta;
      }
      // Optionally, handle tool calls or other event types here.
    }
  } finally {
    await stream.finalize();
  }
}

/**
 * Optional helper: list available models so you can surface them in your UI.
 * Returns an array of { id } items.
 */
export async function listModels() {
  const client = createClient();
  const out = [];
  for await (const m of client.models.list()) out.push({ id: m.id });
  return out;
}
