import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Correos de Gmail",
  description: "Sistema privado de cuentas internas."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
      }
