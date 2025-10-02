import "dotenv/config";
import express, { Request, Response } from "express";
import axios from "axios";
import { generatePrompt } from "./prompt/prompt"; //  
import { parseCodeResponse } from "./utils/fileParser";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  
app.use(cors())

 

 
 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Missing Gemini API Key. Add it to your .env file.");
    process.exit(1);
}

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
        console.log("AI Prompt preview:", aiPrompt.substring(0, 200) + "...");

        console.log("Making request to Gemini API...");
        console.log("API Key exists:", !!GEMINI_API_KEY);
        console.log("API Key length:", GEMINI_API_KEY?.length || 0);

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: aiPrompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 10000,
                    temperature: 1
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 30000 // 30 second timeout
            }
        );

        console.log("Gemini API response status:", response.status);
        console.log("Gemini API response data structure:", Object.keys(response.data));

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) {
            console.error("Invalid response structure from Gemini");
            console.error("Response data:", JSON.stringify(response.data, null, 2));
            throw new Error("Invalid response structure from Gemini API");
        }

        console.log("Gemini Response length:", reply.length);
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
        
        if (error.response) {
            console.error("API Error status:", error.response.status);
            console.error("API Error data:", error.response.data);
            res.status(500).json({ 
                error: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
                success: false 
            });
        } else if (error.request) {
            console.error("Network Error - no response received");
            console.error("Request config:", error.config);
            res.status(500).json({ 
                error: "Network error - could not reach Gemini API",
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
});
