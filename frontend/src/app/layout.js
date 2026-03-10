import "./globals.css";
import NavBar from "./components/NavBar";
import AuthProvider from "./providers/AuthProviders";

export const metadata = {
  title: "Chat App",
  description: "App Used for Chatting",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        <NavBar/>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
