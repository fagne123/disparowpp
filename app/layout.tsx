import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "DisparoWPP - Sistema de Disparo Inteligente",
  description: "Plataforma completa para envio automatizado de mensagens em massa via WhatsApp Business",
  keywords: "whatsapp, disparo, mensagens, marketing, automação",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
