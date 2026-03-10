"use client";
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme:
    typeof window !== "undefined"
      ? localStorage.getItem("chat-theme") || "light"
      : "light",

  setTheme: (t) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chat-theme", t);
    }
    set({ theme: t });
  },
}));
