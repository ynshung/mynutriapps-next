import type { Metadata } from "next";
import { Roboto, Montserrat, Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "MyNutriApps",
  description: "MyNutriApps Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
        className={`${roboto.className} ${montserrat.variable} ${robotoMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
