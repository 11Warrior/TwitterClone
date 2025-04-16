import User from "../models/userModel.js"
import jwt from 'jsonwebtoken'
export const protectRoute = async (req, res, nxt) => {
  try {
    const token = req.cookies.Token
  
    if (!token) {
      return res.status(401).json({error: "Please login first"})
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) {
      return res.status(401).json({error: "Invalid token"})
    }

    const user = await User.findById(decoded.userId).select("-password")
    if (!user) {
      return res.status(404).json({error: "User not found"})
    }
    req.user = user;
    nxt();

  } 
  catch (error) {
    console.log(error);
   return res.status(500).json({error: "Internal server error in protectRoute"}) 
  }
}