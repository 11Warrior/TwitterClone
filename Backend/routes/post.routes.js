import express from "express";
import { createPost, deletePost, commentOnPost, likeAndUnlikePost, getAllPosts, likedPosts, postsOfFollowed, userPosts } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const postRoutes = express.Router();

postRoutes.get('/allPosts',protectRoute, getAllPosts)
postRoutes.get('/likedPosts/:id',protectRoute, likedPosts)
postRoutes.get('/postsOfFollowed',protectRoute, postsOfFollowed)
postRoutes.get('/userPosts/:username',protectRoute, userPosts)
postRoutes.post('/create', protectRoute, createPost)
postRoutes.post('/delete/:id',protectRoute, deletePost)
postRoutes.post('/comment/:id', protectRoute,commentOnPost)
postRoutes.post('/likeUnlikePost/:id', protectRoute, likeAndUnlikePost)

export default postRoutes;
