import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "PrizePool",
  description: "Predict football. Win rewards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="min-h-[100dvh] w-full bg-black text-foreground md:bg-zinc-950 flex justify-center">
            <div className="w-full max-w-[430px] min-h-[100dvh] bg-background relative flex flex-col shadow-2xl overflow-x-hidden">
              {children}
              <BottomNav />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
