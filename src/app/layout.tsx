import "./globals.css";

export const metadata = {
  title: "Resurge",
  description: "Rise Again.",
    icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
    appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Resurge",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
