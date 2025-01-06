import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

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

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`)
})