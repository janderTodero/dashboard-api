const Transaction = require('../models/Transaction')


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
        res.status(500).json({message: "Error creating transaction", error: error.message})
    }
}

exports.getAllTransactions = async (req, res) => {
    const userId = req.user.id

    try {
        const transactions = await Transaction.find({user: userId}).sort({date: -1 })
        res.status(200).json(transactions)
    } catch (error) {
        res.status(500).json({message: "Error to get transactions", error: error.message})
    }
}

exports.readTransaction = async (req, res) => {
    const transactionId = req.params.id
    const userId = req.user.id

    try {
        const transaction = await Transaction.findOne({_id: transactionId, user: userId})

        if(!transaction) {
            return res.status(404).json({message: "Transaction not found"})
        }

        res.status(200).json(transaction)
    } catch (error) {
        res.status(500).json({message: "Error to find transaction", error: error.message})
    }
}

exports.updateTransaction = async (req, res) => {
    const transactionId = req.params.id
    const userId = req.user.id
    const { title, amount, type, category } = req.body

    
    try {
        const transaction = await Transaction.findOne({_id: transactionId, user: userId})
        if(!transaction) return res.status(404).json({message: "Transaction not found"})

        if(title !== undefined) transaction.title = title;
        if(amount !== undefined) transaction.amount = amount;
        if (type !== undefined) transaction.type = type;
        if(category !== undefined) transaction.category = category;
        transaction.date = Date.now()

        await transaction.save();
        res.json(transaction)
    } catch (error) {
        res.status(500).json({message: "Error to update transaction", error: error.message})
    }
}

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const transaction = await Transaction.findOneAndDelete({_id: id, user: userId})
        if(!transaction) return res.status(404).json({message: "Transaction not found"})
        
        res.json(transaction)
    } catch (error) {
        res.status(500).json({message: "Error to delete transaction"})
    }
}