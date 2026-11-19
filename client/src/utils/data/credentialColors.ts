/**
 * Colores que el usuario puede elegir para el recuadro de su credencial.
 * Son decorativos (no cambian nada más). El server acepta cualquier `#rrggbb`;
 * esta lista es la que ofrece la configuración.
 */
export const CREDENTIAL_COLORS: { value: string; label: string }[] = [
  { value: "#ef2d56", label: "Rojo Soon" },
  { value: "#ffb238", label: "Naranja" },
  { value: "#fff275", label: "Amarillo" },
  { value: "#8cd867", label: "Verde" },
  { value: "#0f766e", label: "Verde azulado" },
  { value: "#20a4f3", label: "Celeste" },
  { value: "#1e3a8a", label: "Azul" },
  { value: "#7b2cbf", label: "Violeta" },
  { value: "#5a0001", label: "Bordó" },
  { value: "#1f2937", label: "Gris oscuro" },
];

/** Color de la credencial cuando el usuario no eligió ninguno. */
export const DEFAULT_CREDENTIAL_COLOR = CREDENTIAL_COLORS[0].value;

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

/** Devuelve el color guardado si es un hex válido, o el de por defecto. */
export const resolveCredentialColor = (color?: string | null) =>
  color && HEX_COLOR_REGEX.test(color) ? color : DEFAULT_CREDENTIAL_COLOR;

/** Texto legible (negro o blanco) sobre un fondo `#rrggbb`. */
export const credentialTextColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111827" : "#ffffff";
};
