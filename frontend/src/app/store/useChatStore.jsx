import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useChatStore = create((set,get)=>({
    users : [],
    messages : [],
    selectedUser : null,
    isUsersLoading : false,
    isMessagesLoading : false,

    getUsers : async ()=> {
        set({isUsersLoading : true})
        try {
            const res = await fetch(`${BACKEND_URL}/api/messages/users`,{
                credentials : "include",
                cache : "no-store"
            })
            const response = await res.json();
            if(!res.ok) {
                throw new Error(response.message || "Failed to fetch Users");
            }
            set({users : response})
        }
        catch(error) {
            toast.error(error.message)
        }
        finally {
            set({isUsersLoading : false});
        }
    },
    
    getMessages : async (userToChatId) => {
        set({isMessagesLoading :true});
        try {
            const res = await fetch(`${BACKEND_URL}/api/messages/chatlog/${userToChatId}`,{
                credentials : "include",
                cache : "no-store",
            })
            const response = await res.json();
            if(!res.ok) {
                throw new Error(response.message || "Failed to fetch Messages");
            }
            set({messages : response})
        }
        catch(error) {
            toast.error(error.message)
        }
        finally {
            set({isMessagesLoading: false});
        }
    },

    sendMessage : async (messageData) =>{
        // Below line is coming from zustand
        const {selectedUser,messages} = get()
        try {
            const res = await fetch(`${BACKEND_URL}/api/messages/sendMessage/${selectedUser._id}`,{
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(messageData),
                credentials: "include",
                cache : "no-store",

            });
            const response = await res.json();

            if(!res.ok) {
                throw new Error(response.message || "Failed to send Message");
            }
            set({messages : [...messages,response]})
            
        }
        catch(error) {
            toast.error(error.message)
        }

    },

    subscribeToMessage : () =>{
        const {selectedUser} = get();
        if(!selectedUser) return;

        const socket =  useAuthStore.getState().socket;

        socket.on("receiveNewMessage",(newMessage)=>{
            // Prevent messages from other chats appearing in the current chat window
            if(newMessage.senderId!=selectedUser._id) return;
            set({messages : [...get().messages,newMessage]})
        });
    },

    unsubscribeFromMessage : () =>{
        const socket = useAuthStore.getState().socket;
        // This stops listening to receiveNewMessage event
        if(!socket) return; 
        socket.off("receiveNewMessage");
    },

    setSelectedUser : (val)=> {
        set({selectedUser:val})
    },
    

}))