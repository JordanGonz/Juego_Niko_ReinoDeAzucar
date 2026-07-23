import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niko y el Reino de Azúcar",
  description: "Un colorido juego de plataformas original. Corre, salta y recupera las estrellas de azúcar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
