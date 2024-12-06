import { describe, it, expect } from '@jest/globals';
import { removeAccents_removeEmojisAndToLowerCase } from "../../domain/utils/normalice.data";

describe('removeAccents_removeEmojisAndToLowerCase', () => {
    it('should remove accents and convert to lowercase', () => {
        const input = "Árbol Éxito Óptimo";
        const expectedOutput = "arbol exito optimo";
        const result = removeAccents_removeEmojisAndToLowerCase(input);
        expect(result).toBe(expectedOutput);
    });

    it('should remove emojis from the string', () => {
        const input = "Hola 🚀 Mundo 🌍";
        const expectedOutput = "hola mundo";
        const result = removeAccents_removeEmojisAndToLowerCase(input);
        expect(result).toBe(expectedOutput);
    });

    it('should handle an empty string', () => {
        const input = "";
        const expectedOutput = "";
        const result = removeAccents_removeEmojisAndToLowerCase(input);
        expect(result).toBe(expectedOutput);
    });

    it('should handle a string with no accents or emojis', () => {
        const input = "hola mundo";
        const expectedOutput = "hola mundo";
        const result = removeAccents_removeEmojisAndToLowerCase(input);
        expect(result).toBe(expectedOutput);
    });

    it('should handle mixed input with numbers, symbols, and text', () => {
        const input = "Café 123! 🚀 ¡Hola!";
        const expectedOutput = "cafe 123! ¡hola!";
        const result = removeAccents_removeEmojisAndToLowerCase(input);
        expect(result).toBe(expectedOutput);
    });
});
