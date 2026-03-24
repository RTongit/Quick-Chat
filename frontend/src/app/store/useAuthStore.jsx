// Here create and set are functions provided by the zustand
// see set syntax online
// useAuthStore stores a function which is returned by create function
"use client";
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

// In production (Vercel), NEXT_PUBLIC_BACKEND_URL value comes from Vercel environment variables.
// In development, NEXT_PUBLIC_BACKEND_URL value comes from local env
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useAuthStore = create((set,get) => ({
  authUser: null, // It is an object 
  isSigningUp: false,
  isLoggingIn : false,
  isUpdatingProfile: false,
  onlineUsers : [],
  socket : null,

  isCheckingAuth: true,
  // Check if the user is already authenticated (logged in) or not.
  checkAuth: async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
        credentials: "include",
        cache: "no-store",
      });
      // if 404,401,etc..
      if (!res.ok) {
        set({ authUser: null });
        return;
        // The below will not except the catch(maybe) and then finally runs
      }
      const data = await res.json();
      set({ authUser: data });
      get().connectSocket();
    } catch (error) {
      console.log(`Error in checkAuth from Frontend ${error.message}`);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers : {"Content-Type" : "application/json"},
        body: JSON.stringify(formData),
        // Below line is vvv.imp(cuz this will allow browser to store and send JWT cookies in cross-origin (MERN) requests)
        credentials: "include",
        cache: "no-store",
      });
      const result = await res.json() 
      if(!res.ok) {
        throw new Error(result.message || "Signup failed");
      }

      set({authUser: result})
      toast.success("Account created successfully")
      get().connectSocket();
    } 
    catch (error) {
        toast.error(error.message)
    } 
    finally {
      set({ isSigningUp: false });
    }
  },

  login : async (formData) => {
    set({isLoggingIn:true});
    try{
       const res = await fetch(`${BACKEND_URL}/api/auth/login`,{
        method : "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify(formData),
        credentials : "include",
        cache : "no-store"
       })
       const result = await res.json();
       if(!res.ok) {
        throw new Error(result.message || "Incorrect credentials");
       }
       set({authUser : result})
       toast.success("Login successfully");
       get().connectSocket();
    }
    catch(error) {
      toast.error(error.message);
    }
    finally{
      set({isLoggingIn:false});
    }
  },

  logout : async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/logout`,{
        method : "POST",
        credentials : "include" 
      })
      const result = await res.json()
      if(!res.ok) {
        throw new Error(result.message || "logout failed");
      }
      set({authUser: null})
      toast.success("logged out successfully")
      get().disconnectSocket();
    }
    catch(error) {
      toast.error(error.message)
    }
  },  

  updateProfile : async (data) => {
    set({isUpdatingProfile:true})
    try{
      const res = await fetch(`${BACKEND_URL}/api/auth/update-profile`,{
        method : "PUT",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify(data),
        credentials : "include",
        cache : "no-store"
      })
      const result = await res.json();
      if(!res.ok) {
        throw new Error(result.message || "Profile update failed")
      }
        
      set({authUser:result});
      toast.success("Profile Updated successfully");
    }
    catch(error) {
      toast.error(error.message)
    }
    finally {
      set({isUpdatingProfile:false});
    }
  },
  
  connectSocket : () =>{
    const {authUser} = get();
    const socket = io(`${BACKEND_URL}`,{query : {userId : authUser._id}}); // The backend url 
    set({socket:socket});
    socket.on("getOnlineUsers",(userIds)=>{
      set({onlineUsers:userIds});
    })

  },

  disconnectSocket : () =>{
    const socket = get().socket;
    if(socket) {
      socket.disconnect();
      set({socket : null});
    }
  },

}));

//The keys are react state with global access
//Updating them triggers re-renders in functional components that use them.
