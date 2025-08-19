import { getConfig } from '../configLoader.js'
const { digitaloceanmodelkey } = await getConfig();

const url = "https://inference.do-ai.run/v1/chat/completions";


export async function chat({
  messages,
  model = "openai-gpt-4o", //"gpt-4.1",
  temperature,
  maxOutputTokens,
  signal,
} = {}) {
  console.log("calling chat");
  console.log(messages);
  //messages = [{"role": "user", "content": "What is the capital of France?"}];


  const headers = {
    "Authorization": `Bearer ${digitaloceanmodelkey}`,
    "Content-Type": "application/json",
  };

  console.log(JSON.stringify(messages));
  console.log(JSON.stringify(toMessageInput(messages)));

  const body = {
    model: model,
    messages: toMessageInput(messages),
  };

  if (temperature){
    body.temperature = temperature;
  };
  if (maxOutputTokens){
    body.max_tokens = maxOutputTokens;
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Error:", res.status, await res.text());
    throw {
      Error: res.status,
      Text: await res.text(),
    }
    return;
  }

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  
  return { text: extractText(data), raw: data };
}



function extractText(resp) {
  if (resp.output_text) return resp.output_text;
  const parts = [];
  for (const item of resp.choices ?? []) {
    if (item.message) {
      if (item.message.role === "assistant"){
        parts.push(item.message.content);
      }
    }
  }
  return parts.join("");
}


function toMessageInput(messages) {
  let ret = [];
  for (const item of messages ?? []) {
    // Normalize content to array of text parts
    if (typeof item.content === "string") {
      ret.push( { role: item.role, content: item.content } );
      continue;
    }
    for (const cont of item.content){
      ret.push( { role: item.role, content: cont.text } );
    } 
  };
  return ret;
}
