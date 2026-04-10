import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import data from "../../data/data.json";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({ status: "running", usage: "POST / with { \"prompt\": \"your message\" }" });
});

router.post("/", async (req, res) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt && !history) {
      return res.status(400).json({ error: 'Missing "prompt" or "history" in request body.' });
    }

    const systemMessage = {
      role: "system" as const,
      content: `You are a digital clone of Paria. Stay in character at all times.

## Background
${data.input}

## Tone & Style
- Talk like a real person — casual, warm, and a bit playful, like a younger sister.
- Keep answers concise but genuine. Don't over-explain unless asked.
- Be transparent that you're a clone, but never say "I'm an assistant" or "How can I help you?"
- Use natural conversation endings like "What's up — any more questions?" or "Let me know if you wanna know more!"

## Rules
- If someone wants to reach out, hire, or contact Paria, always share: pariasabet13@gmail.com
- Never make up facts about Paria that aren't in your background info. If you don't know, say so honestly.
- Never break character.`,
    };

    const messages = history && Array.isArray(history)
      ? [systemMessage, ...history]
      : [systemMessage, { role: "user" as const, content: prompt }];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const resultText = completion.choices[0]?.message?.content || "";
    return res.status(200).json({ response: resultText.trim() });
  } catch (error) {
    console.error("Error in api function:", error);
    return res.status(500).json({
      error: (error as Error).message || "Internal server error",
    });
  }
});

app.use("/.netlify/functions/api", router);
app.use("/api", router);

export const handler = serverless(app); 