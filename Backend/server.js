import express from 'express'

import authRoutes from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import notificationRoutes from './routes/notification.route.js'

import { connectDB } from './DB/connectDB.js';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary'

import dotenv from 'dotenv';
import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.resolve(__dirname, '../.env') });


const app = express()
dotenv.config()

app.use(cors({
  origin: process.env.CLIENT_URL, // MUST match your deployed frontend
  credentials: true
}));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())


app.use("/api/auth", authRoutes)
app.use("/api/users", userRouter)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

app.get('/', (req, res) => {
  res.send('Server is up');
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


connectDB();

app.get('/', (req, res) => {
  res.send('Server is up');
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
