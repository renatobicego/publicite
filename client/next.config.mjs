/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // La generación contextual de imágenes envía imágenes de referencia en
      // base64 como payload del server action; el límite por defecto (1 MB) no
      // alcanza para una imagen de 1024x1024. Damos margen para varias referencias.
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "geolocation=*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
