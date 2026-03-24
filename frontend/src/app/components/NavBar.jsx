"use client";

import Link from "next/link";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const { authUser, logout } = useAuthStore();
  const pathName = usePathname();
  function handleClick() {
    logout();
  }
  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Left Side */}
          <div className="flex items-center gap-8">
            {/* Link to homePage */}
            <Link href="/">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="size-7 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Quick Chat</h1>
            </Link>
          </div>

          {/* Right Side (Setting icon and link to setting Page)*/}
          <div className="flex items-center gap-2">
            {pathName != "/settings" ? (
                <Link
                  href="/settings"
                  className="btn btn-sm gap-2 transition-colors"
                >
                  {/*Setting icon  */}
                  <Settings className="size-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
            ) : null}

            {authUser ? (
              <>
                <Link href="/profile" className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button
                  onClick={handleClick}
                  className="flex gap-2 items-center"
                >
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
