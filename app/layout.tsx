import type { Metadata } from "next";
import { Geist, Geist_Mono, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hand = Ma_Shan_Zheng({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "逸君 ❤ 璎 · 爱情记录",
  description: "记录我们在一起的每一天",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${hand.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// Simple theme provider toggling html.dark class and persisting to localStorage
function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            try {
              var key = 'love-theme';
              var saved = localStorage.getItem(key);
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var theme = saved || (prefersDark ? 'dark' : 'light');
              if (theme === 'dark') document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
              window.__setTheme = function(t){
                if (t==='dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
                localStorage.setItem(key, t);
              };
            } catch(e) {}
          })();
        `,
        }}
      />
      {children}
    </>
  );
}
