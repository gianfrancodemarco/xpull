import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";

import { Providers } from "./providers";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "xpull",
  description: "Project initialization and local development environment for xpull",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${jetbrains.variable} scroll-smooth`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
