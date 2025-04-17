import express from 'express'
import authRoutes from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import  {config}  from 'dotenv'
import { connectDB } from './DB/connectDB.js';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary'

const app = express()
config();

app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRouter)
app.use("/api/posts", postRoutes)

app.get('/', (req, res) => {
  res.send('Server is up');
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})


connectDB();
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});