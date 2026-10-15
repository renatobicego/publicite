/** Formatea bytes a una unidad legible (KB/MB/GB). */
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const units = ["bytes", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = exponent === 0 ? value : Math.round(value * 10) / 10;
  return `${rounded} ${units[exponent]}`;
};
