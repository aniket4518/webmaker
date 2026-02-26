"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const prompt_1 = require("./prompt/prompt");
const fileParser_1 = require("./utils/fileParser");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error("Missing Groq API Key. Add it to your .env file.");
    process.exit(1);
}
const groq = new groq_sdk_1.default({ apiKey: GROQ_API_KEY });
app.post("/ask-llama", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        const aiPrompt = (0, prompt_1.generatePrompt)(userPrompt);
        console.log("Generated AI Prompt length:", aiPrompt.length);
        console.log("Making request to Groq API...");
        const chatCompletion = yield groq.chat.completions.create({
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
        const reply = (_b = (_a = chatCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        if (!reply) {
            console.error("Invalid response from Groq");
            throw new Error("Invalid response from Groq API");
        }
        console.log("Groq Response length:", reply.length);
        console.log("Reply preview:", reply.substring(0, 200) + "...");
        console.log("Parsing response for files...");
        const files = (0, fileParser_1.parseCodeResponse)(reply);
        console.log("Parsed files count:", files.length);
        console.log("File names:", files.map(f => f.name));
        res.json({
            reply,
            files,
            success: true
        });
    }
    catch (error) {
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
        }
        else {
            console.error("General Error:", error.message);
            console.error("Stack trace:", error.stack);
            res.status(500).json({
                error: error.message,
                success: false
            });
        }
    }
}));
app.listen(5000, () => {
    console.log("Server is running on port 5000");
    console.log("Groq API Key configured:", GROQ_API_KEY ? "Yes" : "No");
});
