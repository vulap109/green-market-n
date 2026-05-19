import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const DEFAULT_PREVIEW_IMAGE = "/images/cover-trao-yeu-thuong-mb.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://greenmarket.com.vn"),
  title: {
    default: "Green Market - Trái Cây Nhập Khẩu & Quà Tặng Cao Cấp",
    template: "%s | Green Market"
  },
  description:
    "Green Market chuyên trái cây nhập khẩu, giỏ quà trái cây, bánh kem và quà tặng cao cấp cho nhiều dịp biếu tặng.",
  applicationName: "Green Market",
  icons: {
    icon: "/images/logo_1.png",
    shortcut: "/images/logo_1.png",
    apple: "/images/logo_1.png"
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Green Market",
    images: [
      {
        url: DEFAULT_PREVIEW_IMAGE,
        alt: "Green Market - Trao Yeu Thuong"
      }
    ],
    title: "Green Market - Trái Cây Nhập Khẩu & Quà Tặng Cao Cấp",
    description:
      "Green Market chuyên trái cây nhập khẩu, giỏ quà trái cây, bánh kem và quà tặng cao cấp cho nhiều dịp biếu tặng."
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_PREVIEW_IMAGE],
    title: "Green Market - Trái Cây Nhập Khẩu & Quà Tặng Cao Cấp",
    description:
      "Green Market chuyên trái cây nhập khẩu, giỏ quà trái cây, bánh kem và quà tặng cao cấp cho nhiều dịp biếu tặng."
  }
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="font-sans antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
