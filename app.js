const express =require("express")
const connectDB = require("./config/connectToDb");
const cors=require("cors");
const dotenv=require("dotenv").config();
const colors =require("colors");
const { rateLimit } = require('express-rate-limit')
const { errorHandeler, notFoundHandeler } = require("./middelware/errorHandler");
const fileupload = require('express-fileupload');
const userRouter=require("./routes/auth.routes")
const usersRouter=require("./routes/users.routes")
const postRouter=require("./routes/post.routes")
const commentRouter=require("./routes/comment.routes")
const categoryRouter=require("./routes/category.routes")
// connect To Db

connectDB();

// init App
const app =express();


//initializing multer

// Middilewares
app.use(express.json());
app.use(cors());


app.use(fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp",
}))
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes)

})

// Apply the rate limiting middleware to all requests
app.use(limiter)
app.use("/api/auth",userRouter)
app.use("/api/users",usersRouter)
app.use("/api/posts",postRouter)
app.use("/api/comment",commentRouter)
app.use("/api/category",categoryRouter)
app.use("/api/password",require("./routes/Password.routes"));


// error handler

app.use(notFoundHandeler)
app.use(errorHandeler)
//running the server
const Port =process.env.PORT || 8000;
app.listen(Port,()=>console.log( 
    `server is running in ${process.env.MODE_ENV} mode on port ${Port}`
    ));
