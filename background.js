import * as webllm from './lib/web-llm.js';

let engine;
let selectedModel = "Qwen2.5-3B-Instruct-q4f16_1-MLC"; // Changed default model

async function initEngine(model) {
  const initProgressCallback = (progress) => {
    console.log("Model loading progress:", progress);
  };

  try {
    console.log(`Initializing WebLLM engine with model: ${model}`);
    engine = await webllm.CreateMLCEngine(model, {
      initProgressCallback: initProgressCallback
    });
    console.log("Engine initialized successfully.");
  } catch (error) {
    console.error("Error initializing engine:", error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'generate') {
    if (!engine) {
      initEngine(selectedModel).then(() => {
        generateResponse(request.prompt, sendResponse);
      });
    } else {
      generateResponse(request.prompt, sendResponse);
    }
    return true; // Will respond asynchronously
  }
});

function generateResponse(prompt, sendResponse) {
  (async () => {
    try {
      const messages = [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: prompt }
      ];

      console.log("Generating response for prompt:", prompt);
      const response = await engine.chat.completions.create({
        messages
      });

      console.log("Generated response:", response.choices[0].message.content);
      sendResponse({ result: response.choices[0].message.content });
    } catch (error) {
      console.error("Error generating response:", error);
      sendResponse({ error: error.message });
    }
  })();
} 