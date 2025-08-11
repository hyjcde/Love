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
        <ThemeProvider>{children}</ThemeProvider>
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
              // 新设计统一默认浅色；若之前保存过暗色，这里一次性迁移为浅色
              var theme = saved || 'light';
              if (theme === 'dark') {
                theme = 'light';
                localStorage.setItem(key, 'light');
              }
              if (theme === 'dark') document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
              window.__setTheme = function(t){
                if (t==='dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
                localStorage.setItem(key, t);
              };


              // 字号缩放（通过根 rem 缩放）
              var fsKey = 'love-font-scale';
              var savedRaw = localStorage.getItem(fsKey);
              // 若用户未设置，移动端默认更大字号
              if (savedRaw === null) {
                var isMobile = window.matchMedia('(max-width: 768px)').matches;
                var defaultScale = isMobile ? 1.15 : 1;
                localStorage.setItem(fsKey, String(defaultScale));
                savedRaw = String(defaultScale);
              }
              var savedScale = parseFloat(savedRaw || '1');
              if (!isFinite(savedScale) || savedScale <= 0) savedScale = 1;
              document.documentElement.style.setProperty('--font-scale', String(savedScale));
              document.documentElement.style.fontSize = 'calc(16px * var(--font-scale))';
              window.__setFontScale = function(scale){
                var s = Number(scale);
                if (!isFinite(s) || s <= 0) s = 1;
                document.documentElement.style.setProperty('--font-scale', String(s));
                document.documentElement.style.fontSize = 'calc(16px * var(--font-scale))';
                localStorage.setItem(fsKey, String(s));
              };

              // 主色浅色/标准切换
              var avKey = 'love-accent-variant';
              var av = localStorage.getItem(avKey) || 'pastel';
              var pastel = '#fbcfe8'; // pink-200
              var normal = '#f9a8d4'; // pink-300
              document.documentElement.style.setProperty('--accent', av==='pastel' ? pastel : normal);
              window.__setAccentVariant = function(v){
                var val = (v==='pastel') ? 'pastel' : 'normal';
                document.documentElement.style.setProperty('--accent', val==='pastel' ? pastel : normal);
                localStorage.setItem(avKey, val);
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
