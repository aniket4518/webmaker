import "dotenv/config";
import express, { Request, Response } from "express";
import axios from "axios";
import { generatePrompt } from "./prompt/prompt"; //  
import cors from "cors";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  
app.use(cors())
// const mongooose = require("mongoose");


// // const mongodb=process.env.MONGODB_URI 
// mongooose.connect(mongodb)
const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY;
if (!TOGETHER_AI_API_KEY) {
    console.error("Missing Together AI API Key. Add it to your .env file.");
    process.exit(1);
}

app.post("/ask-llama", async (req: Request, res: Response) => {
    try {
        console.log("Request Body:", req.body); // Log the request body

        const userPrompt = req.body.userPrompt;

        if (!userPrompt) {
            throw new Error("Missing user prompt in request body");
        }

        console.log("User Prompt:", userPrompt);  const aiPrompt = generatePrompt(userPrompt);  
        console.log("Generated AI Prompt:", aiPrompt); 

        const response = await axios.post(
            "https://api.together.xyz/v1/chat/completions",
            {
                model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                messages: [{ role: "user", content: aiPrompt }],
                max_tokens: 3000
            },
            {
                headers: {
                    Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Full Response:", response.data);  

        const reply = response.data.choices?.[0]?.message?.content;
        if (!reply) {
            throw new Error("Invalid response structure");
        }

        console.log("LLaMA 2 Response:", reply);
        res.json({ reply });

    } catch (error: any) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
