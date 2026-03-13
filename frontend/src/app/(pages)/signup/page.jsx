"use client";

import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import AuthImagePattern from "@/app/components/AuthImagePattern";
import { toast } from "react-hot-toast";

export default function SignUpPage() {
  const router = useRouter();
  const { authUser, signUp, isSigningUp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  useEffect(() => {
    console.log("Signup runs");
    if (authUser) {
      router.replace("/");
    }
  }, [authUser, router]);

    if (authUser) {
    return null;
  }

  function validateForm() {
    // toast.error() is just a UI notification
    // toast.error() is nothing like a try...catch error.
    // trim() removes only leading and trailing spaces.
    if (!formData.fullName.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be atleast 6 characters long");
      return false;
    }

    return true;
  }
  
  function handleSubmit(e) {
    e.preventDefault(); // stop page reload
    // Whenever you handle a form in React:
    // Always use e.preventDefault() in onSubmit
    // unless you want a page reload (almost never in React/next apps).
    const validForm = validateForm();
    if (validForm) {
      //We will do post request to server and send the form
      signUp(formData);
    }
  }

  // Signup page UI
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO , Heading and Form */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              {/* Icon container*/}
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                          group-hover:bg-primary/20 transition-colors"
              >
                {/* Message Icon */}
                <MessageSquare className="size-6 text-primary" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>

              {/* Subtitle */}
              <p className="text-gray-500/60">
                Get started with your free account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-gray-500/60 z-10" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Suraj Kumar"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-gray-500/60 z-10" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-gray-500/60 z-10" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder=". . . . . . . . . ."
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => {
                    setShowPassword((prev) => !prev);
                  }}
                >
                  {!showPassword ? <Eye className="size-5" /> : "🙈"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  {" "}
                  <Loader2 className="size-5 animate-spin" /> SigningUp...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p>
              Already have an account ?{" "}
              <Link href="/login" className="link link-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side(Pure UI Component,no logic)*/}
      <AuthImagePattern
        title="Join Our Community"
        subtitle={`Connect With friends, share moments, and stay in touch with your loved ones`}
      />
    </div>
  );
}
