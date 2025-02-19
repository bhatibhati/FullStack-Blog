import dotenv from 'dotenv'
import connectDB from './db/db.js'
import app from './app.js'
dotenv.config({ path: '../.env' })

connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.log("Error:", error)
            throw error
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server running on http://localhost:${process.env.PORT}/api/v1`)
        })
    })
    .catch((error) => {
        console.log("MongoDB connection failed.", error)
    })












/*
import express from 'express'
const app = express()
    ; (async () => {
        try {
            await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
            app.on('error', (error) => {
                console.log("Error:", error)
                throw error
            })

            app.listen(process.env.PORT || 8000, () => {
                console.log(`App is listening on port ${process.env.PORT}`)
            })
        } catch (error) {
            console.error("Error:", error)
            throw error
        }
    })()
*/