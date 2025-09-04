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
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        console.log("Request Body:", req.body); // Log the request body
        const userPrompt = req.body.userPrompt;
        if (!userPrompt) {
            throw new Error("Missing user prompt in request body");
        }
        console.log("User Prompt:", userPrompt);
        const aiPrompt = (0, prompt_1.generatePrompt)(userPrompt);
        console.log("Generated AI Prompt:", aiPrompt);
        const response = yield axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
        });
        console.log("Full Response:", response.data);
        const reply = (_e = (_d = (_c = (_b = (_a = response.data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        if (!reply) {
            throw new Error("Invalid response structure");
        }
        console.log("Gemini Response:", reply);
        // Parse the response to extract files
        const files = (0, fileParser_1.parseCodeResponse)(reply);
        console.log("Parsed files:", files.length, files.map(f => f.name));
        res.json({
            reply,
            files,
            success: true
        });
    }
    catch (error) {
        console.error("Error:", ((_f = error.response) === null || _f === void 0 ? void 0 : _f.data) || error.message);
        res.status(500).json({ error: ((_g = error.response) === null || _g === void 0 ? void 0 : _g.data) || error.message });
    }
}));
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
