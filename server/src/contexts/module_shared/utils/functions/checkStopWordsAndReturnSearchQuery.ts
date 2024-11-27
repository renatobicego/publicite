import { stopWords } from "./stopWords";

export function checkStopWordsAndReturnSearchQuery(searchTerm: string) {

    if (searchTerm && (stopWords.has(searchTerm) || searchTerm.trim().length <= 2)) {
        return null;
    }

    const searchTermSeparate = searchTerm
        ?.split(' ')
        .filter(
            (term) =>
                term.trim() !== '' &&
                !stopWords.has(term.trim().toLowerCase())
        );



    const textSearchQuery = searchTermSeparate
        .map(term => `${term}`)
        .join('.*');

    return textSearchQuery;



}