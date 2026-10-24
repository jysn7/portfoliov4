import { Montserrat, Fraunces, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/global/Sidebar";
import Footer from "../components/global/Footer";
import { ThemeProvider } from "next-themes";
import { cn } from "../lib/utils";

// Montserrat — Body font
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
});

// Montserrat — Heading font (bolder weight range, same family)
const montserratHeading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700", "900"],
});

// Fraunces — display serif (hero name, role line)
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

// Pixelify Sans — pixel face (hero lens, small UI labels)
const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        montserrat.variable,
        montserratHeading.variable,
        fraunces.variable,
        pixelify.variable
      )}
    >
      <body className="bg-background min-h-screen selection:bg-primary/30 font-body">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navigation Layer (Fixed/Absolute) */}
          <Sidebar />
          <div className="relative z-10 w-full">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}