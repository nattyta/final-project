const express = require("express")
const cookieParser = require("cookie-parser")
require("dotenv").config()
require('./cron/fineScheduler');

const{ connect } = require("./db_connection/db");
const router = require("./router/authRouter.js");
const { bookRouter } = require("./router/bookRouter");
const paymentRouter = require('./router/paymentRouter');
const { checkUser } = require("./controller/authController");
const port = process.env.PORT || 5000

const app = express();

// Configure server settings
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
connect("mongodb://localhost:27017/library");


app.use("/api/auth",router)
app.use("/api", bookRouter)
app.use('/api/payment', paymentRouter)


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
  })
  
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
  // Increase server timeout to 40 seconds
  server.setTimeout(90000); // 90-second server timeout
