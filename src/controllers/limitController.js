const Limit = require("../models/Limit")

exports.createLimit = async (req, res) => {
    const { value } = req.body
    const userId = req.user.id

    try {
        const newLimit = new Limit({
            value: value,
            user: userId,
        })

        await newLimit.save()
        res.status(201).json(newLimit)
    } catch (error) {
        res.status(500).json({ message: "Error to create a limit"})
    }
}

exports.changeLimit = async (req, res) => {
    const userId = req.user.id
    const { value } = req.body

    try {
        let limit = await Limit.findOne({ user: userId })

        if(limit) {
            limit.value = value;
            await limit.save()
        } else {
            limit = await Limit.create({user: userId, value})
        }

        return res.status(200).json({message: "Limite alterado com sucesso!", limit})
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar o limite", error: error.message})
    }
}