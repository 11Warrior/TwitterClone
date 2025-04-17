import NotificationModel from "../models/notify.js";

export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await NotificationModel.find({to : userId}).populate({
      path: 'from',
      select: 'userName profileImage'
    })
    
    await NotificationModel.updateMany({to: userId}, {read : true});
    return res.status(200).json(notification)

  } catch (error) {
    console.log(error) 
    return res.status(500).json({error: "Internal server error in getallnotification controller"}) 
  } 
}

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id
    await NotificationModel.deleteMany({to: userId})
    res.status(200).json({message: "notifcation deleted"})
  } catch (error) {
    console.log(error)
    return res.status(500).json({error: "Internal Server error in Delete notification controller"}) 
  }
}