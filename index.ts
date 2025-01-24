import express from "express";
import cors from "cors";
import OpenAI from "openai"; 
import type { Request, Response } from "express";
import dotenv from "dotenv";
import data from "./data/data.json";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /chat
app.post("/", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt) {
      return res
        .status(400)
        .json({ error: 'Missing "prompt" in request body.' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You act as a human clone following the personalization text: ${data.input}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });
    console.log(JSON.stringify(completion, null, 2))
    const resultText = completion.choices[0]?.message?.content || "";
    return res.status(200).json({ response: resultText.trim() });
  } catch (error) {
    console.error("Error in /chat route:", error);
    return res.status(500).json({
      error: (error as Error).message || "Internal server error",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
