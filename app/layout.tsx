import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { EffectProvider } from "@/context/EffectContext";
import Sidebar from "@/components/global/Sidebar";
import Header from "@/components/global/Header";
import GrainEffect from "@/components/effects/GrainEffect";
import Spotlight from "@/components/effects/Spotlight";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}>
      <body className="bg-background min-h-screen selection:bg-white/10">
        <EffectProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            
            {/* Background Layer */}
            <GrainEffect />
            <Spotlight />

            {/* Navigation Layer (Fixed/Absolute) */}
            <Sidebar />
            <div className="fixed top-0 right-0 w-full z-50 p-6 md:p-12 lg:p-24 pointer-events-none">
              <div className="pointer-events-auto">
                <Header />
              </div>
            </div>

            {/* Content Layer: No global padding/margins here */}
            <div className="relative z-10 w-full">
              {children}
            </div>
            
          </ThemeProvider>
        </EffectProvider>
      </body>
    </html>
  )
}