const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.categorizeTransactions = async (transactions) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Analyze the following list of bank transactions and assign a category to each one.
    If the amount is a negative number, IGNORE the transaction.
    The categories should be standard personal finance categories, but in portuguese, like: Alimentação, Transporte, Moradia, Entretenimento, Saúde, Lazer, Utilidades, Salário, Investmento, Outros.
    
    Return ONLY a JSON array of strings, where each string is the category for the corresponding transaction in the input list. The order must match exactly.
    Do not include markdown formatting or code blocks in the response. Just the raw JSON array.

    Transactions:
    ${transactions.map(t => `- ${t.title} (${t.amount})`).join('\n')}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up any potential markdown code blocks if the model ignores the instruction
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Fallback to 'Other' for all if AI fails
        return transactions.map(() => 'Other');
    }
};
