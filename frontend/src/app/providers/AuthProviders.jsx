"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.jsx";
import Spinner from "../components/Spinner.jsx";
import { Toaster} from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore.jsx";

export default function AuthProvider({ children }) {
  const { authUser, checkAuth, isCheckingAuth,onlineUsers } = useAuthStore();
  const {theme} = useThemeStore()
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // This line sets the DaisyUI theme by adding data-theme="..." to the <html> element.
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme",theme)
  },[theme])
  
  //spining loader animation below :
  if (isCheckingAuth) {
    return <Spinner />;
  }
  // console.log("The user detail is:", authUser); // dev Only
  return (
    <div data-theme={theme}>
      {/* By placing <Toaster/> at the top we can access toast() function anywhere inside the route pages */}
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </div>
  );
}
