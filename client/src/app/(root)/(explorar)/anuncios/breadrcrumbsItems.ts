import {
  POST_BEST,
  POST_CONTACTS,
  POST_NEXT_TO_EXPIRE,
  POST_RECENTS,
  POSTS,
} from "@/utils/data/urls";

export const postsBaseBreadcrumbsItems = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Anuncios",
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
    label: "Anuncios de Contactos",
    href: `${POST_CONTACTS}`,
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
