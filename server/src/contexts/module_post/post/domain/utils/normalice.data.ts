export function removeAccentsAndToLowerCase(string: string) {
    const stringNormalized = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return stringNormalized

}