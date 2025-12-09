import "dotenv/config";
import express, { Request, Response } from "express";
import Groq from "groq-sdk";
import { generatePrompt } from "./prompt/prompt";
import { parseCodeResponse } from "./utils/fileParser";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  

 
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173','https://webmaker-nine.vercel.app/'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error("Missing Groq API Key. Add it to your .env file.");
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

app.post("/ask-llama", async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("=== /ask-llama endpoint called ===");
        console.log("Request Body:", req.body);

        const userPrompt = req.body.userPrompt;

        if (!userPrompt) {
            console.error("Missing userPrompt in request body");
            res.status(400).json({ error: "Missing userPrompt in request body" });
            return;
        }

        console.log("User Prompt:", userPrompt);
        console.log("Generating AI prompt...");
        
        const aiPrompt = generatePrompt(userPrompt);  
        console.log("Generated AI Prompt length:", aiPrompt.length);

        console.log("Making request to Groq API...");

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: aiPrompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 1,
            max_tokens: 8000,
            top_p: 1,
            stream: false
        });

        console.log("Groq API response received");

        const reply = chatCompletion.choices[0]?.message?.content;
        if (!reply) {
            console.error("Invalid response from Groq");
            throw new Error("Invalid response from Groq API");
        }

        console.log("Groq Response length:", reply.length);
        console.log("Reply preview:", reply.substring(0, 200) + "...");
        
        console.log("Parsing response for files...");
        const files = parseCodeResponse(reply);
        console.log("Parsed files count:", files.length);
        console.log("File names:", files.map(f => f.name));
        
        res.json({ 
            reply, 
            files,
            success: true 
        });

    } catch (error: any) {
        console.error("=== ERROR in /ask-llama ===");
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        
        if (error.status === 429) {
            res.status(429).json({ 
                error: "API quota exceeded. Please wait before trying again.",
                quota_exceeded: true,
                retry_after: 60,
                message: "You've exceeded the free tier quota for Groq API.",
                success: false 
            });
        } else {
            console.error("General Error:", error.message);
            console.error("Stack trace:", error.stack);
            
            res.status(500).json({ 
                error: error.message,
                success: false 
            });
        }
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
    console.log("Groq API Key configured:", GROQ_API_KEY ? "Yes" : "No");
});
