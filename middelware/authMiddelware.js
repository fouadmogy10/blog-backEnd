const jwt =require("jsonwebtoken")
const express =require("express");
const AsyncHandler=require("express-async-handler")
const User=require("../models/users.model")


const protect =AsyncHandler(async(req,res,next)=>{
    let token


    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token=req.header('Authorization').split(" ")[1]
            const decoded =jwt.verify(token,process.env.JWT_SECRET)
            req.user =await User.findById(decoded.id).select('-password')
            
            next()
        } catch (error) {
            res.status(401)
            
            throw new Error(` سجل دخول ينجم`)
        }
    }
    if (!token) {
        res.status(401)
        throw new Error('سجل دخول ينجم')
    }
})
module.exports={
    protect
}