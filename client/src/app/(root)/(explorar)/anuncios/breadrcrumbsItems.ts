import {
  POST_BEST,
  POST_CONTACTS,
  POST_LIBRE,
  POST_NEXT_TO_EXPIRE,
  POST_RECENTS,
  POSTS,
  POST_AD_SPACES,
} from "@/utils/data/urls";

export const postsBaseBreadcrumbsItems = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Anuncios digitales en Soon",
    href: POSTS,
  },
];

export const goodsBreadcrumbsItems = {
  label: "Bienes",
  href: `${POSTS}/bienes`,
};

export const serviceBreadcrumbsItems = {
  label: "Servicios",
  href: `${POSTS}/servicios`,
};

export const petitionBreadcrumbsItems = {
  label: "Necesidades",
  href: `${POSTS}/necesidades`,
};

export const contactPostBreadcrumbsItems = [
  ...postsBaseBreadcrumbsItems,
  {
    label: "Agenda de contactos",
    href: `${POST_CONTACTS}`,
  },
];

// "Libre" es el nombre interno: al usuario se le muestra "Geolocalizados".
export const librePostBreadcrumbsItems = [
  ...postsBaseBreadcrumbsItems,
  {
    label: "Geolocalizados",
    href: `${POST_LIBRE}`,
  },
];

export const bestRatedPostBreadcrumbsItems = [
  ...postsBaseBreadcrumbsItems,
  {
    label: "Mejor Puntuados",
    href: `${POST_BEST}`,
  },
];

export const nextToExpirePostBreadcrumbsItems = [
  ...postsBaseBreadcrumbsItems,
  {
    label: "Próximos a Vencer",
    href: `${POST_NEXT_TO_EXPIRE}`,
  },
];

export const recentsPostBreadcrumbsItems = [
  ...postsBaseBreadcrumbsItems,
  {
    label: "Recientes",
    href: `${POST_RECENTS}`,
  },
];

export const adSpacesBreadcrumbsItems = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Espacios publicitarios",
    href: POST_AD_SPACES,
  },
];
