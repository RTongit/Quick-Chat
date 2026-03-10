import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"
import Image from "next/image";

export default function ChatHeader ()  {
    const {selectedUser,setSelectedUser} = useChatStore();
    const {onlineUsers} = useAuthStore()
  return (
    <div className="p-2.5 border-b-4 border-base-300">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative avatar size-10 ">
                <Image fill sizes="40px" src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} className="object-cover rounded-full"/>
            </div>

            {/* User Info */}
            <div>
                <h3>{selectedUser.fullName}</h3>
                <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                </p>
            </div>
        </div>

        {/* Close Button */}
        <button onClick={()=>{setSelectedUser(null)}} className="block">
            <X/>
        </button>
      </div>

    </div>
  )
}

