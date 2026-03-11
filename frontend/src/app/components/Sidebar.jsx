import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarLoadingSkeleton from "./Skeletons/SidebarLoadingSkeleton";
import { User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Image from "next/image";

export default function Sidebar() {
  const { users, selectedUser, setSelectedUser, isUsersLoading, getUsers } =
    useChatStore();

    const {onlineUsers} = useAuthStore()
  // This hook only runs during initial render and during refreshing
  useEffect(()=>{
      getUsers();
  },
  [getUsers])

  if (isUsersLoading) return <SidebarLoadingSkeleton />;

  return (
    <aside className="h-full w-16  lg:w-72 border-r border-base-300 flex flex-col transition-all duration-300">
      <div className="border-b border-base-300 w-full box-border p-5">
        <div className="flex items-center gap-2">
          <User className="size-6" />
          <span className="lg:block hidden font-medium">Contacts</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full box-border py-3   ">
        {users.map((user) => (
          <button 
          key={user._id} 
          onClick={()=>{setSelectedUser(user)}}
          className={`w-full p-3 hover:bg-base-200 transition-colors  
          ${(selectedUser && user._id===selectedUser._id) ? "bg-base-300 ring-1 ring-primary" : ""}`}>
            <div className="relative lg:mx-0 mx-auto ">
              <div className="relative size-12">
                <Image
                fill
                sizes="48px"
                src={user.profilePic ? user.profilePic : "/avatar.png"}
                alt={user.fullName}
                className= "object-cover rounded-full"/>
              </div>
                {/* Online dot UI */}
               {onlineUsers.includes(user._id) ? 
                (<span
                className="absolute top-0 right-0 size-3 bg-green-500 
                rounded-full ring-2 ring-zinc-900"/>) : null}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="lg:block hidden text-left min-w-0">
                <p className="font-medium truncate">{user.fullName}</p>
                <p className="text-sm text-zinc-400">
                    {(onlineUsers.includes(user._id)) ? "Online" : "Offline"}
                </p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
