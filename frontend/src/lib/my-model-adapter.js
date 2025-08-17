// src/lib/my-model-adapter.js

// This is a dummy adapter that always returns a fixed, hard-coded response.
// It satisfies the required interface (async generator) without calling any backend.
// Use this for testing to avoid errors like "No model provided".
// Later, replace the yield with real backend logic.
import AiMessage from "../../../shared/objects/AiMessage.js"

const aimsg = AiMessage("default");

export const MyModelAdapter = {
  async *run({ messages, abortSignal }) {
    console.log("messages:");
    console.log(messages);
    if (this.getContext){
      let additionalContext = this.getContext();
      if (additionalContext){
        const last = messages[messages.length - 1];
        last.content = last.content.concat(additionalContext);
        console.log(messages);
      }
    }
    let result = await aimsg.run(messages);
    console.log(result);
    yield { content: [ { type: 'text', text: result.raw.output_text } ] };
    
    // You can add more yields if you want to simulate multiple parts or streaming,
    // but one is enough to satisfy the interface and show something in the chat.
  },
};