const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB conectado')
    app.listen(process.env.PORT, () => {
        console.log(`Servidor conectado na porta ${process.env.PORT}`)
    })
}).catch((err) => console.error('Erro ao conectar ao MongoDB', err))
