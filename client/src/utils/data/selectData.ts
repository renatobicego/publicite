export const genderItems = [
  { name: "Masculino", value: "M" },
  { name: "Femenino", value: "F" },
  { name: "No Binario", value: "X" },
  { name: "Prefiero No Especificar", value: "O" },
];

export const frequencyPriceItems: {
  label: string;
  value: FrequencyPrice;
  text: string;
}[] = [
  {
    label: "Hora",
    text: "hora",
    value: "hour",
  },
  {
    label: "Día",
    text: "día",
    value: "day",
  },
  {
    label: "Semana",
    text: "semana",
    value: "week",
  },
  {
    label: "Mes",
    text: "mes",
    value: "month",
  },
  {
    label: "Año",
    text: "año",
    value: "year",
  },
];

export const conditionItems: {
  label: string;
  value: "new" | "used";
}[] = [
  {
    label: "Nuevo",
    value: "new",
  },
  {
    label: "Usado",
    value: "used",
  },
];

export const postTypesItems: { label: string; value: PostType }[] = [
  {
    label: "Bienes",
    value: "good",
  },
  {
    label: "Servicios",
    value: "service",
  },
  {
    label: "Necesidades",
    value: "petition",
  },
];

export const petitionTypesItems: { label: string; value: PostType }[] = [
  {
    label: "Bienes",
    value: "good",
  },
  {
    label: "Servicios",
    value: "service",
  },
];

export const boardColors = [
  "bg-fondo",
  "bg-white",
  "bg-[#D8FFC6]",
  "bg-[#20A4F3]/30",
  "bg-[#FFF275]/80",
  "bg-[#FFB238]/80",
  "bg-[#5A0001]/80",
];

export const visibilityItems: { value: Visibility; label: string }[] = [
  {
    value: "public",
    label: "Público",
  },
  {
    value: "registered",
    label: "Usuarios Registrados",
  },
  {
    value: "contacts",
    label: "Contactos",
  },
  {
    value: "friends",
    label: "Amigos",
  },
  {
    value: "topfriends",
    label: "Top Amigos",
  },
];

export const visibilityRegisteredItems: { value: Visibility; label: string }[] = [
  {
    value: "public",
    label: "Público",
  },
  {
    value: "contacts",
    label: "Contactos",
  },
  {
    value: "friends",
    label: "Amigos",
  },
  {
    value: "topfriends",
    label: "Top Amigos",
  },
];

export const relationTypes: {value: UserRelation; label: string}[] = [
  {
    label: "Contacto",
    value: "contacts",
  },
  {
    label: "Amigo",
    value: "friends",
  },
  {
    label: "Top Amigo",
    value: "topfriends",
  }
]

export const groupVisibilityItems: { value: "public" | "private"; label: string }[] = [
  {
    value: "public",
    label: "Público",
  },
  {
    value: "private",
    label: "Privado",
  }
];
