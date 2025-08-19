const Limit = require("../models/Limit");

exports.createLimit = async (req, res) => {
    const { limit } = req.body;
    const userId = req.user.id;

    try {
        const newLimit = new Limit({
            limit: limit,
            user: userId,
        });

        await newLimit.save();
        res.status(201).json({ limit: newLimit });
    } catch (error) {
        res.status(500).json({ message: "Error to create a limit", error: error.message });
    }
};

exports.getLimit = async (req, res) => {
    const userId = req.user.id;

    try {
        const limit = await Limit.findOne({ user: userId });
        res.status(200).json({ limit });
    } catch (error) {
        res.status(500).json({ message: "Error to get limit", error: error.message });
    }
};

exports.changeLimit = async (req, res) => {
    const userId = req.user.id;
    const { limit } = req.body;

    try {
        let updatedLimit = await Limit.findOne({ user: userId });

        if (updatedLimit) {
            updatedLimit.limit = limit;
            await updatedLimit.save();
        } else {
            updatedLimit = await Limit.create({ user: userId, limit });
        }

        return res.status(200).json({ message: "Limite alterado com sucesso!", limit: updatedLimit });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar o limite", error: error.message });
    }
};