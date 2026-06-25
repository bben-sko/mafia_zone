import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/context/game-context";

export const metadata: Metadata = {
  title: "Mafia — لعبة المافيا",
  description: "لعبة الشك والخداع — من هو المافيا بين أصحابك؟",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark">
      <body>
        <div className="app-wrapper">
          <GameProvider>{children}</GameProvider>
        </div>
      </body>
    </html>
  );
}
