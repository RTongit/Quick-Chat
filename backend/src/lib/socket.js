import {Server} from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
    cors : {
        origin : [process.env.FRONTEND_URL,'http://localhost:3000'],
        credentials: true,
    }
})

function getReceiverSocketId(receiverId) {
    return userSocketMap[receiverId];
}

// used to store online users : 
const userSocketMap = {}; // {userId : socketId}

function isNormalizedPoint(point) {
    return point && Number.isFinite(point.x) && Number.isFinite(point.y)
        && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

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

    socket.on("quickboard:preview",(payload)=>{
        const {peerId,stroke,append} = payload || {};
        if(!userId || typeof peerId !== "string" || peerId === userId || !stroke) return;
        if(typeof stroke.id !== "string" || stroke.id.length > 80) return;
        if(!["path","eraser","line","rect"].includes(stroke.kind)) return;
        if(typeof stroke.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(stroke.color)) return;
        if(!Number.isFinite(stroke.width) || stroke.width <= 0 || stroke.width > 0.08) return;
        if(!Array.isArray(stroke.points) || stroke.points.length < 1 || stroke.points.length > 2) return;
        if(!stroke.points.every(isNormalizedPoint)) return;

        const receiverSocketId = getReceiverSocketId(peerId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("quickboard:preview",{
                fromUserId: userId,
                stroke,
                append: append === true,
            });
        }
    });

    // io.emit() is used to send to every client that are connected 
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log(`A user gets disconnected with socketId ${socket.id}`)
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
