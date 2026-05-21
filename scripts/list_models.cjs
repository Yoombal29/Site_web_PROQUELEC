const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function list() {
    const key = process.env.GEMINI_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
        const data = await response.json();
        console.log("V1 Models:");
        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log(JSON.stringify(data, null, 2));
        }

        const response2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data2 = await response2.json();
        console.log("\nV1BETA Models:");
        if (data2.models) {
            data2.models.forEach(m => console.log(m.name));
        } else {
            console.log(JSON.stringify(data2, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

list();
