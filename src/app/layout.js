import "./globals.css";
import "react-resizable/css/styles.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MusicPlayerProvider } from "@/components/music-player/MusicPlayer";
import { ThemeProvider } from "@/context/ThemeContext";
import CustomCursor from "@/components/CustomCursor";
import VisitorTracker from "@/components/visitors/VisitorTracker";

export const metadata = {
  title: "Portfolio Template (Chiikawa Usagi theme)",
  description:
    "Next.js portfolio starter. Placeholder persona: Usagi (うさぎ) from Chiikawa (ちいかわ) — replace with your own content.",
};

const noFlashStyle = `
  .no-flash {
    visibility: hidden;
  }
  html.dark {
    background: #002b36;
    color-scheme: dark;
  }
  html.light {
    background: #fdf6e3;
    color-scheme: light;
  }
`;

const themeScript = `
  (function() {
    let html = document.documentElement;
    
    html.classList.add('no-flash');
    
    function setTheme(theme) {
      html.classList.remove('light', 'dark');
      html.classList.add(theme);
    }

    let savedTheme = localStorage.getItem('theme');
    let userChoice = localStorage.getItem('userThemeChoice');
    
    if (savedTheme && userChoice === 'true') {
      setTheme(savedTheme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      localStorage.removeItem('theme');
      localStorage.removeItem('userThemeChoice');
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('userThemeChoice') !== 'true') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    requestAnimationFrame(() => {
      html.classList.remove('no-flash');
    });
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: noFlashStyle }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans transition-colors duration-300"
      >
        <ThemeProvider>
          <MusicPlayerProvider>
            <div className="theme-color-scope flex flex-col min-h-screen relative bg-solarized-base3 dark:bg-solarized-base03 text-solarized-base01 dark:text-solarized-base1 transition-colors duration-300">
              <Navbar />
              <main className="flex-grow transition-colors duration-300">
                {children}
              </main>
              <Footer />
              <VisitorTracker />
              <CustomCursor />
            </div>
          </MusicPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
