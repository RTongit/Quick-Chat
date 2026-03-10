"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { useChatStore } from "./store/useChatStore";
import Sidebar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import DummyContainer from "./components/NoMessageContainer";

export default function HomePage() {
  // useRouter() is a react hook
  const router = useRouter();
  const { authUser } = useAuthStore();
  const {selectedUser} = useChatStore()
  useEffect(() => {
    if (!authUser) {
      router.replace("/login");
    }
  }, [authUser,router]);

  // This will try to redirect first before rendering the page
  // if(!authUser) {
  //   router.replace("/login");
  // }

  if (!authUser) return null; // prevent flash

  return (
    <div className="h-screen bg-base-200 ">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg w-full max-w-6xl h-[calc(100vh-8rem)] shadow">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar/>
            {selectedUser ? <ChatContainer/> : <DummyContainer/>}
          </div>
        </div>

      </div>
    </div>
  )
}

// useEffect runs after render → safe navigation
// Prevents redirect during render
// Avoids UI flicker and hydration issues
// Works properly in React Strict Mode

//Redirecting is a side-effect, and React allows side-effects only after rendering,
//so redirects must run after the render phase (e.g., in useEffect).
