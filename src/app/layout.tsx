import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { DemoPersonaProvider } from "@/context/DemoPersonaContext";
import PersonaSwitcher from "@/components/demo/PersonaSwitcher";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/context/ThemeContext";
import SkipLink from "@/components/layout/SkipLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nanzy Clothes | Modern Fashion Store",
    template: "%s | Nanzy Clothes",
  },
  description:
    "Discover stylish clothing for men and women. Quality fashion delivered fast. Shop the latest trends at Nanzy Clothes.",
  keywords: ["clothing", "fashion", "men", "women", "accessories", "online store"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Nanzy Clothes",
  },
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('nanzy-theme');
    if (t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <CartProvider>
            <DemoPersonaProvider>
              <ToastProvider>
                <SkipLink />
                <Header />
                <main id="main-content" className="flex-1" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
                <WhatsAppButton />
                <PersonaSwitcher />
              </ToastProvider>
            </DemoPersonaProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
