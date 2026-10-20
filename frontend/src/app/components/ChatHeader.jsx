import { PencilRuler, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"
import Image from "next/image";

export default function ChatHeader ({onOpenBoard})  {
    const {selectedUser,setSelectedUser} = useChatStore();
    const {onlineUsers} = useAuthStore()
  return (
    <div className="p-2.5 border-b-4 border-base-300">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-4">
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

        <div className="flex items-center gap-1">
            <button onClick={onOpenBoard} className="btn btn-ghost btn-sm gap-1.5" aria-label="Open shared QuickBoard" title="Open shared QuickBoard">
                <PencilRuler className="size-4"/>
                <span className="hidden sm:inline">QuickBoard</span>
            </button>
            {/* Close Button */}
            <button onClick={()=>{setSelectedUser(null)}} className="btn btn-ghost btn-square btn-sm" aria-label="Close chat">
                <X/>
            </button>
        </div>
      </div>

    </div>
  )
}

