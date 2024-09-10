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
  value: "New" | "Used";
}[] = [
  {
    label: "Nuevo",
    value: "New",
  },
  {
    label: "Usado",
    value: "Used",
  }
];
