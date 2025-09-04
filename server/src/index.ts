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
           
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
            }
        );

        console.log("Full Response:", response.data);  

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) {
            throw new Error("Invalid response structure");
        }

        console.log("Gemini Response:", reply);
        
        // Parse the response to extract files
        const files = parseCodeResponse(reply);
        console.log("Parsed files:", files.length, files.map(f => f.name));
        
        res.json({ 
            reply, 
            files,
            success: true 
        });

    } catch (error: any) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
