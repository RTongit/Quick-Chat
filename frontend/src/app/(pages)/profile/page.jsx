"use client"

import { useAuthStore } from "@/app/store/useAuthStore"
import { Camera} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState} from "react"
import {Poppins} from 'next/font/google'

const poppins = Poppins({
    subsets : ["latin"],
    weight: ["300", "400", "500", "600", "700"],
})

export default function ProfilePage() {
    const router = useRouter()
    const{authUser,isUpdatingProfile,updateProfile} = useAuthStore()
    const UserInitial = (authUser) ? authUser.fullName.substr(0,1).toUpperCase() : "?"
    const [ImageURL,setImageURL] = useState(null)

    useEffect(()=>{
        if(!authUser) {router.replace("/login")}
    },
    [router,authUser])

    if(!authUser) return null;

    function formatDateDDMMYY(val) {
        if(!val) return `??`;
        const formatDate = new Date(val);
        const day = String(formatDate.getDate()).padStart(2,"0");
        const month = String(formatDate.getMonth()+1).padStart(2,"0");
        const year = String(formatDate.getFullYear())
        return `${day}-${month}-${year}`;
    }

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if(!file) return
        
        const reader = new FileReader();
        // This happens asynchronously. reading starts
        reader.readAsDataURL(file);
        // reader.onload() is called by browser when reading is over and after the load event
        // Internally browser does :
        // if (reader.onload exists)
        // call reader.onload(event)

        reader.onload = async ()=> {
            const base64Image = reader.result;
            setImageURL(base64Image);
            await updateProfile({profilePic : base64Image})
        }
    }

    return(
        <div className={`${poppins.className} h-screen pt-20 mt-16 `}>
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8">

                    {/* Header Part */}
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold">Profile</h1>
                        <p className="mt-2">Your Profile Information</p>
                    </div>

                    {/* DP upload section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img src={ ImageURL || authUser.profilePic ||"/avatar.png"} alt="Profile" 
                            className="size-32 rounded-full object-cover border-4"/>

                            <label htmlFor="avatar-upload"
                             className={`absolute bottom-0 right-0 p-2 rounded-full bg-black hover:scale-105 cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none":null}`}>
                                <Camera className="size-5 text-white"/>
                            </label>
                            <input 
                                type="file"
                                id="avatar-upload" 
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload} 
                                disabled={isUpdatingProfile}
                            />
                        </div>
                        <p className="text-sm text-zinc-400">
                            {isUpdatingProfile? "Uploading" : "Click the camera icon to update your photo"}
                        </p>
                    </div>

                    {/*Display Section of User(Read Only)*/}
                    <div className="max-w-md mx-auto mt-10 rounded-2xl bg-base-200 backdrop-blur-xl shadow-lg p-6 border border-gray-200">
                       <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="sm:size-14 size-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-base-content text-xl font-semibold">
                            {UserInitial}
                          </div>

                          {/* Info */}
                          <div>
                            <h2 className="text-lg font-semibold text-base-content">
                                {authUser.fullName}
                            </h2>
                            <p className="text-sm text-base-content">
                                {authUser.email}
                            </p>
                         </div>
                        </div>
                    </div>

                    {/* Another Display Section(Read Only) */}
                    <div className="mt-6 rounded-xl p-6 ">
                        <h2 className="text-lg mb-4 font-bold">Account Information</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-zinc-700">
                                <span>Member since</span>
                                <span>{formatDateDDMMYY(authUser.createdAt)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-700">
                                <span>Account Status</span>
                                <span className="text-green-500">Active</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}