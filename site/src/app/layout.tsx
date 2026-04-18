import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { company, siteUrl } from "@/content/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name}, корпоративное питание`,
    template: `%s | ${company.name}`,
  },
  description:
    "Черновик нового маркетингового сайта GastroPrime: сильный B2B-лендинг вместо Tilda, с чистым SEO, нормальной структурой страниц и понятным контентом.",
  openGraph: {
    title: `${company.name}, корпоративное питание`,
    description:
      "Новый каркас сайта для офисов, складов, строек, производств и госучреждений. Контент управляется через код, а не через Tilda.",
    url: siteUrl,
    siteName: company.name,
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${manrope.className} bg-slate-50 text-slate-950 antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
