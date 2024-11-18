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
    const startTime = performance.now();
    try {
      const system_prompt_1 = `You are an AI assistant helping to analyze web page information in relation to a user's current task. For each piece of web page information provided, evaluate its relevance and usefulness to the given task.

Input format:

TASK: [Description of what the user is trying to accomplish]
WEB PAGE INFORMATION: [Content or information from a web page]

Your response should follow this structure:
THOUGHT: Provide a short analysis of the web page information and its relationship to the task at hand. Should be in 1 or 2 sentences.

FINAL ANSWER: [Yes/No] Yes if the information is relevant or helpful for the task. Otherwise, No.

Example 1:
TASK: Finding healthy breakfast recipes
WEB PAGE INFORMATION:
Title: Analyzing Web Page Relevance to Tasks - Claude
URL: https://claude.ai/chat/541dddddddddddd9ddddddddddddd
Description: Talk with Claude, an AI assistant from Anthropic

THOUGHT: Claude is a website that allows you to chat with AI about any topic. It could provide relevant information to the task of finding healthy breakfast recipes.

FINAL ANSWER: Yes

Example 2:
TASK: Looking for instructions to fix a leaking bathroom faucet

WEB PAGE INFORMATION:
Title: Walmart Online Shopping - Daily Deals
URL: https://www.walmart.com/deals
Description: Shop today's trending deals and save big on electronics, home goods, toys and more. Free shipping available.

THOUGHT: This page shows general product deals, not plumbing instructions. While Walmart sells faucets, the deals page won't provide the needed repair guidance.

FINAL ANSWER: No

Example 3:
TASK: Learning how to play guitar

WEB PAGE INFORMATION:
Title: YouTube
URL: https://www.youtube.com/
Description: Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.

THOUGHT: User could go through YouTube to search for guitar lessons. If the user is not watching guitar lessons, it could be irrelevant and we will block it later.

FINAL ANSWER: Yes`;

      const system_prompt_2 = `You are an AI assistant helping user filter out irrelevant web page while they are browsing the web.
Input format:
TASK: [Description of what the user is trying to accomplish]
WEB PAGE INFORMATION: [Content or information from a web page]

Your response should follow this structure:
THOUGHT: 1-2 sentences about the relevance and usefulness of the web page information to the task.
RELEVANT: [yes/maybe/no]
HELPFUL: [yes/maybe/no]
DISTRACTING: [yes/maybe/no]

Example 1:
TASK: Finding healthy breakfast recipes
WEB PAGE INFORMATION:
Title: Analyzing Web Page Relevance to Tasks - Claude
URL: https://claude.ai/chat/541dddddddddddd9ddddddddddddd
Description: Talk with Claude, an AI assistant from Anthropic

THOUGHT: Claude is a website that allows you to chat with AI about any topic. It could provide relevant information to the task of finding healthy breakfast recipes.
RELEVANT: maybe
HELPFUL: yes
DISTRACTING: no

Example 2:
TASK: Looking for instructions to fix a leaking bathroom faucet
WEB PAGE INFORMATION:
Title: Walmart Online Shopping - Daily Deals
URL: https://www.walmart.com/deals
Description: Shop today's trending deals and save big on electronics, home goods, toys and more. Free shipping available.

THOUGHT: This page shows general product deals, not plumbing instructions. While Walmart sells faucets, the deals page won't provide the needed repair guidance.
RELEVANT: no
HELPFUL: no
DISTRACTING: yes

Example 3:
TASK: Learning how to play guitar

WEB PAGE INFORMATION:
Title: YouTube
URL: https://www.youtube.com/
Description: Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.

THOUGHT: User could go through YouTube to search for guitar lessons. If the user is not watching guitar lessons, it could be irrelevant and we will block it later.
RELEVANT: yes
HELPFUL: maybe
DISTRACTING: maybe

Example 4:
TASK: Making information diet chrome extension
WEB PAGE INFORMATION:
Title: ĐẠI CHIẾN ARAM: HÒA NHỊP ARCANE CÙNG 2 ĐỘI TRƯỞNG LEVI VÀ OPTIMUS
URL: https://www.youtube.com/watch?v=JzFnwrudteM
Description: Mọi người nhớ nhấn like và đăng ký kênh để ủng hộ mình nha !

THOUGHT: This video is about a game, not a information diet resource. This is a direct distraction.
RELEVANT: no
HELPFUL: no
DISTRACTING: yes`;

      const system_prompt_3 = `You are an AI assistant helping user filter out irrelevant web page while they are browsing the web.
Input format:
TASK: [Description of what the user is trying to accomplish]
WEB PAGE INFORMATION: [Content or information from a web page]

Your response should follow this structure:
RELEVANT: [yes/maybe/no]
HELPFUL: [yes/maybe/no]
DISTRACTING: [yes/maybe/no]
END

Example 1:
TASK: Finding healthy breakfast recipes
WEB PAGE INFORMATION:
Title: Analyzing Web Page Relevance to Tasks - Claude
URL: https://claude.ai/chat/541dddddddddddd9ddddddddddddd
Description: Talk with Claude, an AI assistant from Anthropic

RELEVANT: maybe
HELPFUL: yes
DISTRACTING: no
END

Example 2:
TASK: Looking for instructions to fix a leaking bathroom faucet
WEB PAGE INFORMATION:
Title: Walmart Online Shopping - Daily Deals
URL: https://www.walmart.com/deals
Description: Shop today's trending deals and save big on electronics, home goods, toys and more. Free shipping available.

RELEVANT: no
HELPFUL: no
DISTRACTING: yes
END

Example 3:
TASK: Learning how to play guitar

WEB PAGE INFORMATION:
Title: YouTube
URL: https://www.youtube.com/
Description: Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.

RELEVANT: yes
HELPFUL: maybe
DISTRACTING: maybe
END

Example 4:
TASK: Making information diet chrome extension
WEB PAGE INFORMATION:
Title: ĐẠI CHIẾN ARAM: HÒA NHỊP ARCANE CÙNG 2 ĐỘI TRƯỞNG LEVI VÀ OPTIMUS
URL: https://www.youtube.com/watch?v=JzFnwrudteM
Description: Mọi người nhớ nhấn like và đăng ký kênh để ủng hộ mình nha !

RELEVANT: no
HELPFUL: no
DISTRACTING: yes
END`;


      const messages = [
        { role: "system", content: system_prompt_1 },
        { role: "user", content: prompt }
      ];

      console.log("Generating response for prompt:", prompt);
      const response = await engine.chat.completions.create({
        messages,
        stop: ["END"]
      });

      const endTime = performance.now();
      const processingTime = (endTime - startTime) / 1000; // Convert to seconds
      console.log(`Response generated in ${processingTime.toFixed(2)} seconds`);
      
      console.log("Generated response:", response.choices[0].message.content);
      sendResponse({ 
        result: response.choices[0].message.content,
        processingTime: processingTime
      });
    } catch (error) {
      const endTime = performance.now();
      const processingTime = (endTime - startTime) / 1000;
      console.error(`Error generating response after ${processingTime.toFixed(2)} seconds:`, error);
      sendResponse({ error: error.message, processingTime: processingTime });
    }
  })();
} 