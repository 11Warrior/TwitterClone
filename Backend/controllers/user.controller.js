import NotificationModel from "../models/notify.js"
import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import {v2 as cloudinary} from "cloudinary"

export const getUserProfile = async (req, res) => {
  const {userName} = req.params
  try {
    const user = await User.findOne({userName}).select("-password")
    if (!user) {
      return res.status(404).json({message: "user not found"})
    }
    res.status(200).json(user)
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Error in get User profile"})
  }
}


export const followUnfollow = async (req, res) => {
  console.log(req.params)
  try {

    const {id} = req.params
   
    const userToModify = await User.findById(id)
    const currentUser = await User.findById(req.user._id)

    if (id === req.user._id.toString()) {
      return res.status(400).json({error: "Cannot follow/unfollow yourself"})
    }

    if (!userToModify || !currentUser) {
      return res.status(400).json({error: "User not found"})  
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollow the user
      await User.findByIdAndUpdate(id, {$pull : {followers : req.user._id}})
      await User.findByIdAndUpdate(req.user._id, {$pull : {following : id}})
      return res.status(200).json({message: "Unfollowed"})

    }else {
      //follow the user
      await User.findByIdAndUpdate(id, {$push : {followers : req.user._id}})
      await User.findByIdAndUpdate(req.user._id, {$push : {following : id}})
      
      const newNotification = new NotificationModel({
        type: 'follow',
        from : req.user._id,
        to: userToModify._id
      })
      await newNotification.save();
      res.status(200).json({message: "Followed"})
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Error in follow and unfollow method"})
  }
}

export const getUserSuggestions = async (req, res) => {
  try {
    const userId = req.user._id
    const userFollowedByMe = await User.findById(userId).select("following")

    const users = await User.aggregate([
      {
        $match : {
          _id : {$ne : userId}
        }
      },
      {$sample: {size: 10}}
    ])
    const filteredUsers = users.filter(user => !userFollowedByMe.following.includes(user._id))

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => user.password = null)

    res.status(200).json(suggestedUsers)
  } catch (error) {
    console.log(error);
    res.status(500).json({error: "Error in get user suggestions"})
  }


}

export const updateUserProfile = async (req, res) => {
  const {fullName, userName, currentPassword, newPassword, bio, link, email} = req.body;

  let { profileImage, coverImage} = req.body

  const userId = req.user._id;
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({message: "User not found"})
    }

    if (!newPassword && currentPassword || newPassword && !currentPassword) {
      return res.status(400).json({message: "Please provide both current and new password"})
    }

    if (currentPassword && newPassword) {
      const isMatched = await bcrypt.compare(currentPassword, user.password)
      if (!isMatched) {
        return res.status(400).json({message: "Current password is incorrect"})
      }
      if (newPassword.length < 6) {
        return res.status(400).json({message: "Password must be at least 6 characters"})
      }
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)
      user.password = hashedPassword
    }
    if (profileImage) {
      if (user.profileImage){
        cloudinary.uploader.destroy(user.profileImage.split('/').pop().split('.')[0])
      }
      const uploadedRes = await cloudinary.uploader.upload(profileImage)
      profileImage = uploadedRes.secure_url
    }

    if(coverImage){
      if (user.coverImage){
        cloudinary.uploader.destroy(user.coverImage.split('/').pop().split('.')[0])
      }
      const uploadedRes = await cloudinary.uploader.upload(coverImage)
      coverImage = uploadedRes.secure_url
    }
    //add to database
    user.fullName = fullName || user.fullName
    user.email = email || user.email
    user.userName = userName || user.userName
    user.bio = bio || user.bio
    user.link = link || user.link
    user.profileImage = profileImage || user.profileImage
    user.coverImage = coverImage || user.coverImage

    await user.save()
    //password is null in response
    user.password = null
    return res.status(200).json({message: "User profile updated successfully"})

  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Error in update user profile"})
    
  }

}