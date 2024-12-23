export function removeAccents_removeEmojisAndToLowerCase(input: string): string {
    return input
        .normalize("NFD") // Descompone caracteres con acentos
        .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos
        .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2300}-\u{23FF}|\u{1F200}-\u{1F2FF}|\u{1F500}-\u{1F5FF}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}|\u{200D}\u{2640}\u{2642}\u{200D}\u{2640}\u{26D1}\u{200D}\u{FE0F}]/gu,'') // Elimina emojis
        .replace(/\s+/g, ' ') // Elimina dobles espacios
        .toLowerCase() // Convierte a minúsculas
        .trim(); // Elimina espacios al inicio y al final
}
