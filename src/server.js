import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('API dashboard')
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB conectado')
    app.listen(process.env.PORT, () => {
        console.log(`Servidor conectado na porta ${process.env.PORT}`)
    })
}).catch((err) => console.error('Erro ao conectar ao MongoDB', err))
