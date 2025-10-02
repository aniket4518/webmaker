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
const axios_1 = __importDefault(require("axios"));
const prompt_1 = require("./prompt/prompt"); //  
const fileParser_1 = require("./utils/fileParser");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Missing Gemini API Key. Add it to your .env file.");
    process.exit(1);
}
app.post("/ask-llama", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
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
        console.log("AI Prompt preview:", aiPrompt.substring(0, 200) + "...");
        console.log("Making request to Gemini API...");
        console.log("API Key exists:", !!GEMINI_API_KEY);
        console.log("API Key length:", (GEMINI_API_KEY === null || GEMINI_API_KEY === void 0 ? void 0 : GEMINI_API_KEY.length) || 0);
        const response = yield axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
            contents: [{
                    parts: [{
                            text: aiPrompt
                        }]
                }],
            generationConfig: {
                maxOutputTokens: 10000,
                temperature: 1
            }
        }, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 30000 // 30 second timeout
        });
        console.log("Gemini API response status:", response.status);
        console.log("Gemini API response data structure:", Object.keys(response.data));
        const reply = (_e = (_d = (_c = (_b = (_a = response.data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        if (!reply) {
            console.error("Invalid response structure from Gemini");
            console.error("Response data:", JSON.stringify(response.data, null, 2));
            throw new Error("Invalid response structure from Gemini API");
        }
        console.log("Gemini Response length:", reply.length);
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
        if (error.response) {
            console.error("API Error status:", error.response.status);
            console.error("API Error data:", error.response.data);
            res.status(500).json({
                error: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
                success: false
            });
        }
        else if (error.request) {
            console.error("Network Error - no response received");
            console.error("Request config:", error.config);
            res.status(500).json({
                error: "Network error - could not reach Gemini API",
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
});
