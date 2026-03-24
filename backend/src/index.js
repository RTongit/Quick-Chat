import express, { json } from 'express'
import dotenv from 'dotenv'
import { connectDB } from './lib/db.js'
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { app,server } from './lib/socket.js';

dotenv.config()
const PORT = process.env.PORT

app.use(cors(
  {
    origin : [process.env.FRONTEND_URL,"http://localhost:3000"],
    credentials : true // because we are using cookies 
  }
))
// “Parse incoming JSON request bodies, and allow up to 10MB of data.”
app.use(express.json({limit:"10mb"}))
app.use(cookieParser())

app.use('/api/auth',authRoutes);
app.use('/api/messages',messageRoutes);

app.get('/', (req, res) => {
  res.status(200).send('Hello World!')
})


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  connectDB()
  console.log(process.env.NODE_ENV)
})
