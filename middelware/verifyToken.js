const jwt =require("jsonwebtoken")
const express =require("express");
const AsyncHandler=require("express-async-handler")
// const User=require("../models/users.model")


const verifyToken =AsyncHandler(async(req,res,next)=>{
    let  authToken= req.headers.authorization;
    if (authToken) {
        token=authToken.split(" ")[1]
        try {
            const decoded =jwt.verify(token,process.env.JWT_SECRET)
            req.user =decoded;
            next()
        } catch (error) {
            res.status(401).json({
                message:"invalid token , access denied"
            })
            
        }
    } else {
        return res.status(401).json({
            message:"no token provieded , access denied"
        })
    }

})
const verifyTokenAndAdmin =AsyncHandler(async(req,res,next)=>{
    await verifyToken(req,res,() => {
        if (req.user.isAdmin) {
            next();
        }else{
            return res.status(403).json({
                message: "not allow only admin can access"
            })
        }
    })

})
const verifyTokenAndUser =AsyncHandler(async(req,res,next)=>{
    await verifyToken(req,res,() => {
        if (!req.user.admin) {
            next();
        }else{
            return res.status(403).json({
                message: "not allow only user can access"
            })
        }
    })

})
const verifyTokenAndUserHimself =AsyncHandler(async(req,res,next)=>{
    await verifyToken(req,res,() => {
        if (req.user.id===req.params.id ) {
            next();
        }else{
            return res.status(403).json({
                message: "not allow only user can access"
            })
        }
    })

})
const verifyTokenAndUserandAdmin =AsyncHandler(async(req,res,next)=>{
    await verifyToken(req,res,() => {
        if (req.user.id===req.params.id || req.user.isAdmin) {
            next();
        }else{
            return res.status(403).json({
                message: "not allow only user himself or admin can access"
            })
        }
    })

})

module.exports={
    verifyTokenAndUserHimself,
    verifyToken,verifyTokenAndAdmin,verifyTokenAndUser,verifyTokenAndUserandAdmin
}