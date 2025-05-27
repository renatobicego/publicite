import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import "./clerk.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";

const noto = Noto_Sans({ subsets: ["latin"], variable: "--font-noto" });
export const metadata: Metadata = {
  title: "Publicité",
  description: "Publicité es tu sitio publicitario",
  keywords: [
    "publicité",
    "soon publicité",
    "vender",
    "comprar",
    "necesito",
    "ecommerce",
    "argentina",
    "marketplace",
    "publicitar",
    "publicidad",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  openGraph: {
    title: "Publicité",
    url: "https://soonpublicite/",
    siteName: "Publicité",
    locale: "es_ES",
    type: "website",
    description: "Publicité es tu sitio publicitario",
    images: "https://soonpublicite/thumbnail.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Publicité",
    description: "Publicité es tu sitio publicitario",
    images: ["https://soonpublicite/thumbnail.png"], // Must be an absolute URL
  },
};

const localization = {
  ...esES,
  userProfile: {
    ...esES.userProfile,
    navbar: {
      ...esES.userProfile?.navbar,
      title: "Configuración",
      account: "Cuenta",
    },
    start: {
      ...esES.userProfile?.start,
      headerTitle__account: "Datos de la Cuenta",
      profileSection: {
        title: "Cuenta",
        primaryButton: "Editar",
      },
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://soonpublicite.com/",
    url: "https://soonpublicite.com/",
    name: "Publicité",
    image: ["https://soonpublicite.com/thumbnail.jpg"],
    description: "Publicité es tu sitio publicitario",
  };
  return (
    <ClerkProvider localization={localization}>
      <html lang="es">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <body
          className={` ${noto.className}  text-text-color overflow-x-hidden`}
        >
          <Providers>
            {children}
            <ToastContainer />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
