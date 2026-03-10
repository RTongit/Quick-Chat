import {Server} from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
    cors : {
        origin : ["http://localhost:3000"],
    }
})

function getReceiverSocketId(receiverId) {
    return userSocketMap[receiverId];
}

// used to store online users : 
const userSocketMap = {}; // {userId : socketId}

// 🔄 Full Flow
// User opens website
// Frontend connects to socket server
// "connection" event fires
// socket.id is created
// You log: “A user connected …”

// User leaves website
// Connection closes
// "disconnect" event fires
// You log: “A user disconnected …”

// on() method listens for events 
io.on("connection",(socket)=>{
    console.log(`A user connected ${socket.id}`);
    const userId = socket.handshake.query.userId;
    if(userId) {userSocketMap[userId] = socket.id}

    // io.emit() is used to send to every client that are connected 
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log(`A user disconnected ${socket.id}`)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
})

export {app,server,io,getReceiverSocketId};

// The flow : 
// Frontend port : (3001)
//       ↓
// Socket.IO Client
//       ↓
// HTTP Server
//       ↓
// Express
//       ↓
// Socket.IO Server