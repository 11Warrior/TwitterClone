import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type : String,
    required: true
  },
  password : {
    type : String,
    required: true,
    minLength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId, //16 characters
      ref: "User",
      default: []
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId, //16 characters
      ref: "User",
      default: []
    }
  ],
  profileImage : {
    type: String,
    default: ""
  },
  coverImage  : {
    type : String,
    default: ""
  },
  bio: {
    type: String,
    default: "Edit your bio"
  },
  likedPosts :[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: []
    }
  ]

},{timestamps: true})

const User = mongoose.model('User', userSchema);

export default User 