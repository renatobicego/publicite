/** Convierte un data URL (o base64 de PNG suelto) en un `File` para subir. */
export const dataUrlToFile = async (
    dataUrl: string,
    fileName: string,
): Promise<File> => {
    const src = dataUrl.startsWith("data:")
        ? dataUrl
        : `data:image/png;base64,${dataUrl}`;
    const blob = await (await fetch(src)).blob();
    return new File([blob], fileName, { type: blob.type || "image/png" });
};
