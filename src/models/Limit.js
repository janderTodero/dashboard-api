const mongoose = require('mongoose')

const limitSchema = new mongoose.Schema(
    {
        value: {
            type: Number,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Limit', limitSchema)