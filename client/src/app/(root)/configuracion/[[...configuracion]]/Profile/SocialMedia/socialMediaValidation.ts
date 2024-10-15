import { object, string } from "yup";

export const phoneRegex = /^(0|\+\d{1,3}[- ]?)?\d{10}$/;
const instagramUrlRegex =
  /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9_.]+)/;
const twitterUrlRegex =
  /(?:https?:\/\/)?(?:www\.)?x\.com\/([A-Za-z0-9_]+)/;
const facebookUrlRegex =
  /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([A-Za-z0-9_.]+)/;
  const websiteUrlRegex = /^(https?:\/\/|http?:\/\/)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/;


export const contactSchema = object().shape({
  phone: string()
    .nullable()
    .notRequired()
    .matches(phoneRegex, "El número de teléfono no es válido")
    .test(
      "is-empty-or-valid",
      "El número de teléfono no es válido",
      (value) =>  !value || value.trim() === "" || phoneRegex.test(value)
    ),

  instagram: string()
    .nullable()
    .notRequired()
    .matches(instagramUrlRegex, "La URL de Instagram no es válida")
    .test(
      "is-empty-or-valid",
      "La URL de Instagram no es válida",
      (value) => !value || value.trim() === "" || instagramUrlRegex.test(value)
    ),

  x: string()
    .nullable()
    .notRequired()
    .matches(twitterUrlRegex, "La URL de X/Twitter no es válida")
    .test(
      "is-empty-or-valid",
      "La URL de X/Twitter no es válida",
      (value) => !value || value.trim() === "" || twitterUrlRegex.test(value)
    ),

  facebook: string()
    .nullable()
    .notRequired()
    .matches(facebookUrlRegex, "La URL de Facebook no es válida")
    .test(
      "is-empty-or-valid",
      "La URL de Facebook no es válida",
      (value) => !value || value.trim() === "" || facebookUrlRegex.test(value)
    ),

  website: string()
    .nullable()
    .notRequired()
    .matches(websiteUrlRegex, "La URL del sitio web no es válida")
    .test(
      "is-empty-or-valid",
      "La URL del sitio web no es válida",
      (value) => !value || value.trim() === "" || websiteUrlRegex.test(value)
    ),
});
