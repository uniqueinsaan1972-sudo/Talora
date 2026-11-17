
import "./globals.css";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

export const metadata = {
  title: "TALORA: Learn English. Enjoy Every Step.",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#2F7DE8",
};

export default function Root({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
