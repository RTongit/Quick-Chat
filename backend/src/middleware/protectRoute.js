import jwt from 'jsonwebtoken'
import User from '../models/userModel.js';
export default async function protectRoute(req,res,next) {
    try{
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({message : "Unauthorized - No token Provided"});    
        }

        const payloadObj = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findOne({_id:payloadObj.userId},{password:0})
        if(!user) {
            return res.status(404).json({message : "User not found"});
        }
        req.user = user
        next()
    }
    catch(error) {
        console.log(`Error in protectRoute middleware : ${error.message}`)
        return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
}