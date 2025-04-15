import express from 'express'
import authRoutes from './routes/auth.routes.js'
import  {config}  from 'dotenv'


const app = express()
config();

app.use("/api/auth", authRoutes)

app.get('/', (req, res) => {
  res.send('Server is up');
})

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});