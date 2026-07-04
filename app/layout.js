import "./globals.css";

export const metadata = {
  title: "Lond by Ciel Sowal",
  description: "オンラインヘアカウンセリング",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
