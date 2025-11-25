const Transaction = require('../models/Transaction')
const fs = require('fs')
const csv = require('csv-parser')


exports.create = async (req, res) => {
    const { title, amount, type, category, date } = req.body
    const userId = req.user.id

    try {
        const newTransaction = new Transaction({
            title,
            amount,
            type,
            category,
            date,
            user: userId,
        })

        await newTransaction.save()

        res.status(201).json(newTransaction)
    } catch (error) {
        res.status(500).json({ message: "Error creating transaction", error: error.message })
    }
}

exports.getAllTransactions = async (req, res) => {
    const userId = req.user.id

    try {
        const transactions = await Transaction.find({ user: userId }).sort({ date: -1 })
        res.status(200).json(transactions)
    } catch (error) {
        res.status(500).json({ message: "Error to get transactions", error: error.message })
    }
}

exports.readTransaction = async (req, res) => {
    const transactionId = req.params.id
    const userId = req.user.id

    try {
        const transaction = await Transaction.findOne({ _id: transactionId, user: userId })

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" })
        }

        res.status(200).json(transaction)
    } catch (error) {
        res.status(500).json({ message: "Error to find transaction", error: error.message })
    }
}

exports.updateTransaction = async (req, res) => {
    const transactionId = req.params.id
    const userId = req.user.id
    const { title, amount, type, category } = req.body


    try {
        const transaction = await Transaction.findOne({ _id: transactionId, user: userId })
        if (!transaction) return res.status(404).json({ message: "Transaction not found" })

        if (title !== undefined) transaction.title = title;
        if (amount !== undefined) transaction.amount = amount;
        if (type !== undefined) transaction.type = type;
        if (category !== undefined) transaction.category = category;

        await transaction.save();
        res.json(transaction)
    } catch (error) {
        res.status(500).json({ message: "Error to update transaction", error: error.message })
    }
}

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const transaction = await Transaction.findOneAndDelete({ _id: id, user: userId })
        if (!transaction) return res.status(404).json({ message: "Transaction not found" })

        res.json(transaction)
    } catch (error) {
        res.status(500).json({ message: "Error to delete transaction", error: error.message })
    }
}

exports.importTransactions = async (req, res) => {
    const userId = req.user.id
    const rawTransactions = []

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
    }

    const aiService = require('../services/aiService');

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            const amount = parseFloat(data.amount)

            // CSV columns: date, title, amount
            if (!data.title || !amount || amount <= 0) {
                return;
            }
            rawTransactions.push({
                title: data.title,
                amount: parseFloat(data.amount),
                date: data.date ? new Date(data.date) : new Date(),
                // type will be set to 'expense'
            })
        })
        .on('end', async () => {
            try {
                if (rawTransactions.length === 0) {
                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
                    return res.status(400).json({ message: "No valid transactions found in CSV" })
                }

                // Get categories from AI
                const categories = await aiService.categorizeTransactions(rawTransactions);

                // Merge data
                const finalTransactions = rawTransactions.map((t, index) => ({
                    ...t,
                    type: 'expense', // Fixed as per requirement
                    category: categories[index] || 'Other',
                    user: userId
                }));

                await Transaction.insertMany(finalTransactions)

                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)

                res.status(201).json({
                    message: "Transactions imported and categorized successfully",
                    count: finalTransactions.length,
                    sample: finalTransactions.slice(0, 3) // Return a sample to show categories
                })
            } catch (error) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
                res.status(500).json({ message: "Error importing transactions", error: error.message })
            }
        })
        .on('error', (error) => {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
            res.status(500).json({ message: "Error reading CSV file", error: error.message })
        })
}

exports.importBankStatement = async (req, res) => {
    const userId = req.user.id
    const rawTransactions = []

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
    }

    const aiService = require('../services/aiService');

    let useDescriptionAsTitle = false;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            const amount = parseFloat(data.amount)

            // Check if we need to use description instead of title
            if (!data.title && data.description) {
                useDescriptionAsTitle = true;
            }

            const titleToUse = data.title || data.description;

            // CSV columns: date, title (or description), amount
            if (!titleToUse || isNaN(amount)) {
                return;
            }
            rawTransactions.push({
                title: titleToUse,
                amount: amount, // Keep original sign for now
                date: data.date ? (() => {
                    const [day, month, year] = data.date.split('/');
                    return new Date(`${year}-${month}-${day}`);
                })() : new Date(),
            })
        })
        .on('end', async () => {
            try {
                if (rawTransactions.length === 0) {
                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
                    return res.status(400).json({ message: "No valid transactions found in CSV" })
                }

                // Get categories from AI with specific instruction to ignore 'identificador'
                // If using description as title, ask AI to summarize it
                const aiOptions = {
                    additionalInstructions: "Ignorar a coluna 'identificador' se presente na descrição ou dados.",
                    summarizeTitles: useDescriptionAsTitle
                };

                const aiResults = await aiService.categorizeTransactions(rawTransactions, aiOptions);

                // Merge data
                const finalTransactions = rawTransactions.map((t, index) => {
                    let category = 'Other';
                    let title = t.title;

                    if (useDescriptionAsTitle) {
                        // aiResults should be an array of objects { category, title }
                        if (aiResults[index]) {
                            category = aiResults[index].category || 'Other';
                            title = aiResults[index].title || t.title;
                        }
                    } else {
                        // aiResults should be an array of strings (categories)
                        category = aiResults[index] || 'Other';
                    }

                    return {
                        ...t,
                        title: title,
                        type: t.amount >= 0 ? 'income' : 'expense',
                        amount: Math.abs(t.amount), // Store absolute value
                        category: category,
                        user: userId
                    };
                });

                await Transaction.insertMany(finalTransactions)

                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)

                res.status(201).json({
                    message: "Bank statement imported and categorized successfully",
                    count: finalTransactions.length,
                    sample: finalTransactions.slice(0, 3) // Return a sample to show categories
                })
            } catch (error) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
                res.status(500).json({ message: "Error importing bank statement", error: error.message })
            }
        })
        .on('error', (error) => {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
            res.status(500).json({ message: "Error reading CSV file", error: error.message })
        })
}