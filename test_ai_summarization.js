const aiService = require('./src/services/aiService');
require('dotenv').config();

async function testAiSummarization() {
    const transactions = [
        { title: 'UBER *TRIP 12345', amount: -25.50 },
        { title: 'SPOTIFY PREMIUM', amount: -19.90 },
        { title: 'SALARIO MENSAL', amount: 5000.00 }
    ];

    try {
        const results = await aiService.categorizeTransactions(transactions, { summarizeTitles: true });
        console.log(JSON.stringify(results));
    } catch (error) {
        console.error("Error:", error);
    }
}

testAiSummarization();
