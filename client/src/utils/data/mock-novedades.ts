import type { Novedad, LoggedUser } from "@/types/novedades";

// Mock user - change role to "admin" to see edit buttons
export const mockLoggedUser: LoggedUser = {
  id: "user_123",
  email: "admin@example.com",
  sessionClaims: {
    metadata: {
      role: "admin", // Change to "user" to hide edit buttons
    },
  },
};

// Mock novedades data with EditorJS format
export const mockNovedades: Novedad[] = [
  {
    id: "nov_001",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
    content: {
      blocks: [
        {
          id: "block_1",
          type: "header",
          data: JSON.stringify({
            text: "Nueva Funcionalidad del Dashboard",
            level: 2,
          }),
        },
        {
          id: "block_2",
          type: "paragraph",
          data: JSON.stringify({
            text: "Estamos emocionados de anunciar el lanzamiento de nuestra nueva funcionalidad del dashboard. Esta actualización incluye mejoras significativas en la visualización de datos, nuevos gráficos interactivos y una experiencia de usuario completamente renovada que facilitará el análisis de métricas importantes.",
          }),
        },
        {
          id: "block_3",
          type: "image",
          data: JSON.stringify({
            file: {
              url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
            },
            caption: "Nuevo dashboard",
            withBorder: false,
            stretched: true,
            withBackground: false,
          }),
        },
        {
          id: "block_4",
          type: "paragraph",
          data: JSON.stringify({
            text: "Además de las mejoras visuales, hemos optimizado el rendimiento general del sistema.",
          }),
        },
      ],
    },
  },
  {
    id: "nov_002",
    createdAt: "2026-02-28T14:30:00Z",
    updatedAt: "2026-02-28T14:30:00Z",
    content: {
      blocks: [
        {
          id: "block_1",
          type: "image",
          data: JSON.stringify({
            file: {
              url: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop",
            },
            caption: "Seguridad mejorada",
            withBorder: false,
            stretched: true,
            withBackground: false,
          }),
        },
        {
          id: "block_2",
          type: "header",
          data: JSON.stringify({
            text: "Actualización del Sistema de Seguridad",
            level: 2,
          }),
        },
        {
          id: "block_3",
          type: "paragraph",
          data: JSON.stringify({
            text: "Hemos implementado nuevas medidas de seguridad para proteger mejor tus datos. Esto incluye autenticación de dos factores mejorada, cifrado de extremo a extremo y monitoreo en tiempo real de actividades sospechosas para garantizar la máxima protección de tu información.",
          }),
        },
      ],
    },
  },
  {
    id: "nov_003",
    createdAt: "2026-02-25T09:15:00Z",
    updatedAt: "2026-02-25T09:15:00Z",
    content: {
      blocks: [
        {
          id: "block_1",
          type: "header",
          data: JSON.stringify({
            text: "Nuevo Módulo de Reportes Avanzados",
            level: 2,
          }),
        },
        {
          id: "block_2",
          type: "image",
          data: JSON.stringify({
            file: {
              url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
            },
            caption: "Reportes avanzados",
            withBorder: false,
            stretched: true,
            withBackground: false,
          }),
        },
        {
          id: "block_3",
          type: "paragraph",
          data: JSON.stringify({
            text: "Presentamos nuestro nuevo módulo de reportes que te permitirá generar informes personalizados con facilidad. Ahora puedes exportar datos en múltiples formatos, programar reportes automáticos y compartirlos con tu equipo de manera instantánea para mejorar la colaboración.",
          }),
        },
      ],
    },
  },
  {
    id: "nov_004",
    createdAt: "2026-02-20T16:45:00Z",
    updatedAt: "2026-02-20T16:45:00Z",
    content: {
      blocks: [
        {
          id: "block_1",
          type: "header",
          data: JSON.stringify({
            text: "Integración con APIs Externas",
            level: 2,
          }),
        },
        {
          id: "block_2",
          type: "paragraph",
          data: JSON.stringify({
            text: "Ahora puedes conectar tu cuenta con servicios externos como Slack, Google Drive, Notion y muchos más. Esta integración te permitirá sincronizar datos automáticamente y mejorar tu flujo de trabajo diario sin necesidad de cambiar entre aplicaciones constantemente.",
          }),
        },
        {
          id: "block_3",
          type: "image",
          data: JSON.stringify({
            file: {
              url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
            },
            caption: "Integraciones disponibles",
            withBorder: false,
            stretched: true,
            withBackground: false,
          }),
        },
      ],
    },
  },
  {
    id: "nov_005",
    createdAt: "2026-02-15T11:00:00Z",
    updatedAt: "2026-02-15T11:00:00Z",
    content: {
      blocks: [
        {
          id: "block_1",
          type: "image",
          data: JSON.stringify({
            file: {
              url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
            },
            caption: "App móvil optimizada",
            withBorder: false,
            stretched: true,
            withBackground: false,
          }),
        },
        {
          id: "block_2",
          type: "header",
          data: JSON.stringify({
            text: "Mejoras de Rendimiento en Móvil",
            level: 2,
          }),
        },
        {
          id: "block_3",
          type: "paragraph",
          data: JSON.stringify({
            text: "Hemos optimizado completamente nuestra aplicación móvil para ofrecer una experiencia más rápida y fluida. Los tiempos de carga se han reducido en un 60% y el consumo de batería ha mejorado significativamente gracias a nuestras nuevas optimizaciones de código.",
          }),
        },
      ],
    },
  },
  {
    id: "nov_006",
    createdAt: "2026-02-10T08:30:00Z",
    updatedAt: "2026-02-10T08:30:00Z",
    content: {
      blocks: [
        {
          id: "block_1",
          type: "header",
          data: JSON.stringify({
            text: "Sistema de Notificaciones Inteligente",
            level: 2,
          }),
        },
        {
          id: "block_2",
          type: "paragraph",
          data: JSON.stringify({
            text: "Introducimos nuestro nuevo sistema de notificaciones inteligentes que aprende de tus preferencias. Ahora recibirás solo las alertas más relevantes para ti, reduciendo las distracciones y mejorando tu productividad durante todo el día laboral.",
          }),
        },
        {
          id: "block_3",
          type: "image",
          data: JSON.stringify({
            file: {
              url: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&h=400&fit=crop",
            },
            caption: "Notificaciones personalizadas",
            withBorder: false,
            stretched: true,
            withBackground: false,
          }),
        },
      ],
    },
  },
];
