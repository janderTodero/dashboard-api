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