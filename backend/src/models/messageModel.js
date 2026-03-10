import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
    {
        senderId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        receiverId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        text : {
            type : String
        },
        image : {
            type : String
        }
    },
    {
        timestamps: true
    }
)

const Message = mongoose.model("Message",messageSchema);

export default Message;

// Below is an example of Message Model MongoDB document : 
// {
//   "_id": ObjectId("66a1f0c9e21b4a7c9d001234"),
//   "senderId": ObjectId("66a1efb1d9a4c8b7a9001111"),
//   "receiverId": ObjectId("66a1efc2d9a4c8b7a9002222"),
//   "text": "Hey, are you free tonight?",
//   "image": "",
//   "createdAt": ISODate("2026-01-05T10:30:00.000Z"),
//   "updatedAt": ISODate("2026-01-05T10:30:00.000Z"),
//   "__v": 0
// }
