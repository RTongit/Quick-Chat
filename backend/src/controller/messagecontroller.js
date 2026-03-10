import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export async function getUsersForSidebar(req,res) {
    try{
        const loggedUserId = req.user._id
        // Here filteredUsers will have array of db document except the loggedUser document
        const filteredUsers = await User.find({_id:{$ne : loggedUserId}},{password:0})
        //Use lean() when you only want data, not document behavior.
        return res.status(200).json(filteredUsers);
    }
    catch(error) {
        console.log(`Error in getUsersForSidebar ${error.message}`);
        return res.status(500).json({message : "Internal Server Error"});
    }
}

export async function getMessages(req,res) {
    try{
        const {id : userToChatId} = req.params;
        const loggedInUserId = req.user._id;
        // Returns array of mongoose document from oldest to newest
        // Each mongoose document is a message here
        const messages = await Message.find(
            {$or : [
                {senderId:loggedInUserId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:loggedInUserId}
                ]
            }
        ).sort({createdAt:1})
        
        //Even though messages is a Mongoose document array, Express automatically converts it to JSON array of objects
        return res.status(200).json(messages)
    }
    catch(error) {
        console.log(`Error in getMessages controller ${error.message}`)
        return res.status(500).json({message : "Internal Server Error"});
    }
}

export async function sendMessage(req,res) {
    try{
        const {text,image} = req.body
        const {id : userToChatId} = req.params;
        const loggedInUserId = req.user._id;

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        // Creating and storing the message document in DB
        const newMessage = new Message({
            senderId : loggedInUserId,
            receiverId : userToChatId,
            text : text,
            image : imageUrl
        });
        // Saving in DB
        await newMessage.save()

        // todo : realtime functionality goes here socket.io will add later
        const receiverSocketId = getReceiverSocketId(userToChatId)
        if(receiverSocketId) {
            // send new message to only the receiver not to all online users 
            io.to(receiverSocketId).emit("receiveNewMessage",newMessage);
        }

        return res.status(201).json(newMessage)
    }
    catch(error) {
        console.log(`Error in sendMessage controller ${error.message}`)
        return res.status(500).json({message : "Internal Server Error"});
    }
}