import "./globals.css";
import HealthPing from "./components/HealthPing";

export const metadata = {
  title: {
    default: "Cox's Holiday Stay | Exceptional stays, thoughtfully found",
    template: "%s | Cox's Holiday Stay"
  },
  description:
    "Discover handpicked hotels, private villas, and unforgettable stays. Find your next escape with Cox's Holiday Stay.",
  applicationName: "Cox's Holiday Stay",
  openGraph: {
    title: "Cox's Holiday Stay | Exceptional stays, thoughtfully found",
    description:
      "Discover handpicked hotels, private villas, and unforgettable stays.",
    type: "website",
    locale: "en_US",
    siteName: "Cox's Holiday Stay"
  },
  twitter: {
    card: "summary_large_image",
    title: "Cox's Holiday Stay",
    description: "Exceptional stays, thoughtfully found."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport = {
  themeColor: "#f7f5ef",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HealthPing />
        {children}
      </body>
    </html>
  );
}
