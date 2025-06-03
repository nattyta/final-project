const express = require("express")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const{ connect } = require("./db_connection/db");
const router = require("./router/authRouter");
const { bookRouter } = require("./router/bookRouter");
const { checkUser } = require("./controller/authController");

const port = process.env.PORT || 5000

const app = express();
connect("mongodb://localhost:27017/library")

app.use(express.json())
app.use(cookieParser())


app.use("/api/auth",router)
app.use("/api", bookRouter)







app.listen(port, ()=>{
    console.log(`server running on port ${port}`)
})