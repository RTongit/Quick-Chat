import "./globals.css";
import NavBar from "./components/NavBar";
import AuthProvider from "./providers/AuthProviders";

export const metadata = {
  title: "Quick Chat",
  description: "A real time application used for chatting",
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
