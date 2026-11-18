import "./globals.css";
export const metadata = { title: "TALORA: Learn English. Enjoy Every Step.", manifest: "/manifest.webmanifest" };
export const viewport = { themeColor: "#2F7DE8" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en" data-theme="light"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&family=Noto+Sans+Devanagari:wght@400;700&display=swap" /></head><body>{children}</body></html>);
}
