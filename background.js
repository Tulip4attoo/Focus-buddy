import * as webllm from './lib/web-llm.js';

let engine;
let selectedModel = "Qwen2.5-3B-Instruct-q4f16_1-MLC"; // Changed default model
let system_prompt = `You are an AI assistant helping to analyze web page information in relation to a user's current task. For each piece of web page information provided, evaluate its relevance and usefulness to the given task.

Input format:

TASK: [Description of what the user is trying to accomplish]
WEB PAGE INFORMATION: [Content or information from a web page]
Your response should follow this structure:

THOUGHT:
Provide a detailed analysis of the web page information and its relationship to the task at hand. Consider:
How directly related is this information to the task?
Could this information be a distraction?
What specific aspects make it relevant or irrelevant?
How might this information help or hinder task completion?

Final Answer: [Yes/No]
Yes: if the information is relevant and/or helpful for the task
No: if the information is irrelevant, distracting, or not useful

Example 1:
TASK: Finding healthy breakfast recipes
WEB PAGE INFORMATION:
Title: Analyzing Web Page Relevance to Tasks - Claude
URL: https://claude.ai/chat/541dddddddddddd9ddddddddddddd
Description: Talk with Claude, an AI assistant from Anthropic

THOUGHT: Claude is a website that allows you to chat with AI about any topic. It could provide relevant information to the task of finding healthy breakfast recipes.

Final Answer: Yes

Example 2:
TASK: Looking for instructions to fix a leaking bathroom faucet

WEB PAGE INFORMATION:
Title: Walmart Online Shopping - Daily Deals
URL: https://www.walmart.com/deals
Description: Shop today's trending deals and save big on electronics, home goods, toys and more. Free shipping available.

THOUGHT: This page shows general product deals, not plumbing instructions. While Walmart sells faucets, the deals page won't provide the needed repair guidance.

Final Answer: No

Example 3:
TASK: Learning how to play guitar

WEB PAGE INFORMATION:
Title: Guitar Center - Guitar Lessons
URL: https://www.guitarcenter.com/lessons
Description: Learn guitar from expert instructors. Online and in-person lessons available for beginners to advanced players.

THOUGHT: Direct match to the task - offers guitar lessons for beginners, which is exactly what someone learning guitar needs.

Final Answer: Yes


Example 4:
TASK: Learning how to play guitar

WEB PAGE INFORMATION:
Title: YouTube
URL: https://www.youtube.com/
Description: Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.

THOUGHT: User could go through YouTube to search for guitar lessons. If the user is not watching guitar lessons, it could be irrelevant and we will block it later.

Final Answer: Yes
`;

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

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'stream-response') {
    port.onMessage.addListener(async (request) => {
      if (request.type === 'generate') {
        const startTime = performance.now();
        try {
          if (!engine) {
            console.log('Starting engine initialization...');
            const initStartTime = performance.now();
            await initEngine(selectedModel);
            console.log(`Engine initialization took: ${((performance.now() - initStartTime)/1000).toFixed(2)}s`);
          }

          const messages = [
            { role: "system", content: system_prompt },
            { role: "user", content: request.prompt }
          ];

          console.log('Starting generation...');
          const completion = await engine.chat.completions.create({
            messages,
            stream: true
          });

          let curMessage = "";
          let tokenCount = 0;
          for await (const chunk of completion) {
            const curDelta = chunk.choices[0].delta.content;
            if (curDelta) {
              curMessage += curDelta;
              tokenCount++;
              // Send current state of the message with timing info
              port.postMessage({ 
                content: curMessage,
                stats: {
                  elapsedTime: ((performance.now() - startTime)/1000).toFixed(2),
                  tokensGenerated: tokenCount,
                  tokensPerSecond: (tokenCount/((performance.now() - startTime)/1000)).toFixed(2)
                }
              });
            }
          }

          const totalTime = (performance.now() - startTime)/1000;
          console.log(`Generation complete:
- Total time: ${totalTime.toFixed(2)}s
- Tokens generated: ${tokenCount}
- Tokens per second: ${(tokenCount/totalTime).toFixed(2)}`);

        } catch (error) {
          console.error('Error generating response:', error);
          port.postMessage({ 
            error: error.message,
            stats: {
              elapsedTime: ((performance.now() - startTime)/1000).toFixed(2)
            }
          });
        }
      }
    });
  }
}); 