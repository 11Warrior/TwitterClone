import postModel from "../models/postmodel.js";
import {v2 as cloudinary} from "cloudinary";
import User from "../models/userModel.js";
import NotificationModel from "../models/notify.js";
import mongoose from "mongoose";

export const createPost = async (req, res) => {
  try {
    const {text} = req.body;
    let {image} = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({message: "User not found"})
    
    if (!text && !image) return res.status(404).json({message: "Please add text or image"})

     if (image) {
      const uploadedRes = await cloudinary.uploader.upload(image)
      image = uploadedRes.secure_url

     } 
    const newPost = new postModel({
      user: userId,
      text,
      image
    })
    await newPost.save()
    res.status(201).json(newPost)
      
  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Internal server error"})
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id)
    console.log(post)
    if (!post) return res.status(404).json({message: "Post not found"})
    const userId = req.user._id.toString()

    if (post.user.toString() !== userId) return res.status(403).json({message: "You are not authorized to delete this post"})

    if (post.image){
      const imageId = post.image.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(imageId)
    }  
    await postModel.findByIdAndDelete(req.params.id)
    res.status(200).json({message: "Post deleted successfully"})
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Internal server error"})
  }
}

export const commentOnPost = async (req, res) => {
  try {
    const {text} = req.body
    const postId = req.params.id
    const userId = req.user._id

    if (!text) 
    {
      return res.status(400).json({message: "Please add a comment"}) 
    }

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({message: "Post not found"}) 
    }  
    const comment = {user : userId, text}
    post.comments.push(comment)
    await post.save()

    res.status(201).json(post)
  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Internal server error in comment post controller"})
  }
}

export const likeAndUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await postModel.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await postModel.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new NotificationModel({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await postModel.find().
    sort({createdAt: -1}).populate({
      path: 'user',
      select: '-password',
    })
    .populate({
      path: 'comments.user',
      select: '-password'
    })

    if (posts.length === 0) {
      return res.status(404).json([])
    }
    res.status(200).json(posts);

  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Internal server error in get all posts controller"})
  }
}

export const likedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await postModel.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export const postsOfFollowed = async (req, res) => {
  try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await postModel.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const userPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({userName: username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await postModel
      .find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });

    return res.status(200).json(posts);

  } catch (error) {
    console.error("Error in userPosts controller:", error);
    return res.status(500).json({ message: "Internal server error in user posts controller" });
  }
};

