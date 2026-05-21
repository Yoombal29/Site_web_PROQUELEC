const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: 'v1beta' });
    try {
        const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
        for (const modelName of models) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                console.log(`✅ Model ${modelName} works!`);
            } catch (e) {
                console.log(`❌ Model ${modelName} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
