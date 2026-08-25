import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import "@/styles/mobile.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Tratto - Sistema de Gestão para Salões",
  description: "Plataforma completa para gestão de salões de beleza",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${GeistSans.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors closeButton position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


