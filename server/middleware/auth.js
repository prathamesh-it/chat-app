import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Middleware to protect routes
export const protectRoute = async(req , res , next)=>{
    try {
        const token = req.headers.token;
        //to get the user id we have to decode token
        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.json({success : false , message : "User not found"});

        req.user = user;
        next();  //execute controllers

    } catch (error) {
        console.log(error.message);
        res.json({success : false , message : error.message});
    }
}
