"use client"

import { useEffect } from "react"
import { useChatStore } from "../store/useChatStore"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import MessageLoadingSkeleton from "./Skeletons/MessageLoadingSkeleton"
import { useAuthStore } from "../store/useAuthStore"
import getChatTime from "./constants/getChatTime"
import Image from "next/image"
import { useRef } from "react"

export default function ChatContainer() {
    const {messages, getMessages, isMessagesLoading, selectedUser,subscribeToMessage,unsubscribeFromMessage} = useChatStore()
    const {authUser} = useAuthStore()
    const messageScrollRef = useRef(null);

    useEffect(()=>{
        getMessages(selectedUser._id);
        subscribeToMessage();

        return () => {unsubscribeFromMessage()}
    },
    [selectedUser,getMessages,subscribeToMessage,unsubscribeFromMessage])

    useEffect(()=>{
      // It scroll to the dummy div when there is a new message added to chat log
      if( messages && messageScrollRef.current) {
        messageScrollRef.current.scrollIntoView({behavior : "smooth",block:"end"});
      }
    
    },
    [messages])

    if(isMessagesLoading) return <MessageLoadingSkeleton/>

    return(
        <div className="flex flex-col overflow-auto flex-1">
            <ChatHeader/>
            <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-4">
                {messages.map((message)=>(
                    <div key={message._id} className={`chat ${message.senderId===authUser._id ? "chat-end" : "chat-start"}`}>
                      {/* Profile Pic icon */}
                      <div className="chat-image avatar relative sm:size-10 size-8">
                        <Image fill sizes="40px" src={`${message.senderId===authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}`} alt="profile pic" className="object-cover rounded-full border-2"/>
                      </div>

                      {/* Time Stamp */}
                      <div className="chat-header mb-1">
                        <time  className="text-xs opacity-50 ml-1"dateTime={message.createdAt}>
                            {getChatTime(message.createdAt)}
                        </time>
                      </div>

                      {/* Actual message block */}
                      <div className="chat-bubble flex flex-col">
                        {message.text ? <p>{message.text}</p> : null } 
                        {message.image ? <div className="relative sm:h-44 h-28 sm:w-60 w-40"><Image fill sizes="200px" alt= "Message" src={message.image} className="rounded-md object-cover"/></div> : null}
                      </div>

                    </div>))
                  }
                  {/* Dummy div */}
                  <div ref={messageScrollRef}></div>

            </div>
            <MessageInput/>
        </div>
    )
}
