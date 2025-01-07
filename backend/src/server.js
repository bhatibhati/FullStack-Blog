import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
dotenv.config({ path: '../.env' })
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())



app.get('/', (req, res) => {
    res.send('Homepage of the blog website.')
})

