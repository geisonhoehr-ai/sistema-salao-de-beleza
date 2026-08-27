import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import "@/styles/mobile.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Tratto - CRM para Salões, Barbearias e Estéticas",
  description: "CRM de beleza criado para reduzir retrabalho, conectar agenda, clientes, profissionais e financeiro, com integrações úteis e preço justo.",
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
