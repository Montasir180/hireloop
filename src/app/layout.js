import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navber from "./component/Navber";


export const metadata = {
  title: "HierLoop",
  description: "a job website",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      light-mode="white"
    >
      <head />
      <body className="min-h-full flex flex-col">
        <Navber />
        {children}
        </body>
    </html>
  );
}
