import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { followUnfollow, getUserProfile, getUserSuggestions, updateUserProfile } from "../controllers/user.controller.js"

const userRouter = express.Router()

userRouter.get('/profile/:userName',protectRoute, getUserProfile)
userRouter.get('/suggested',protectRoute, getUserSuggestions)
userRouter.post('/follow/:id',protectRoute, followUnfollow)
userRouter.post('/update',protectRoute, updateUserProfile)

export default userRouter