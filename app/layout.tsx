import type { Metadata } from "next";
import "./globals.css";
import { Montserrat, Lato } from "next/font/google";
import { ThemeProvider } from "./providers/theme-provider";
import { AppProvider } from "@/context/app-context";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { AuthModal } from "@/components/auth/auth-modal";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Peti • Art Commissions & Store",
  description: "Plataforma de comisiones artísticas y diseño de personajes estilo anime y VTuber. Encargos directos con pagos protegidos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${montserrat.variable} antialiased min-h-screen flex flex-col bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>
              <CartProvider>
                <Navbar />
                <div className="flex-1">
                  {children}
                </div>
                <CartSheet />
                <AuthModal />
                <Footer />
              </CartProvider>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
