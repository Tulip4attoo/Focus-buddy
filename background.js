import * as webllm from './lib/web-llm.js';

let engine;
let selectedModel = "Llama-3.2-1B-Instruct-q4f32_1-MLC"; // Default model

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
  if (request.type === 'getModels') {
    const availableModels = webllm.prebuiltAppConfig.model_list;
    const modelIds = availableModels.map(model => model.model_id);
    console.log("Available model IDs:", modelIds);
    sendResponse({ models: modelIds });
  }

  if (request.type === 'generate') {
    const model = request.model || selectedModel;
    if (!engine || model !== selectedModel) {
      selectedModel = model;
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