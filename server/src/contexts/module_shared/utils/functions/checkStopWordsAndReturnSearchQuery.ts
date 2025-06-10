import { removeAccents_removeEmojisAndToLowerCase } from "src/contexts/module_post/post/domain/utils/normalice.data";
import { stopWordsGroup, stopWordsPost } from "./stopWords";


enum SearchType {
    group = 'group',
    post = 'post'
}


function checkStopWordsAndReturnSearchQuery(searchTerm: string, searchType: string) {
    if (!searchTerm) return null
    let searchTermNormalized = removeAccents_removeEmojisAndToLowerCase(searchTerm);
    let searchTermSeparate: string[];

    if (SearchType.group === searchType) {
        if (stopWordsGroup.has(searchTermNormalized) || searchTermNormalized.length <= 2) {
            return null;
        }
        searchTermSeparate = searchTermNormalized
            ?.split(' ')
            .filter(
                (term) =>
                    term.trim() !== '' &&
                    !stopWordsGroup.has(term)
            );

    } else if (SearchType.post === searchType) {
        if (stopWordsPost.has(searchTermNormalized) || searchTermNormalized.trim().length <= 2) {
            return null;
        }
        searchTermSeparate = searchTermNormalized
            ?.split(' ')
            .filter(
                (term) =>
                    term.trim() !== '' &&
                    !stopWordsPost.has(term)
            );

    } else {
        return null
    }


    const textSearchQuery = searchTermSeparate
        .map(term =>
            `(${term})`
        )
        .join('.*?');

    return textSearchQuery;


}


export {
    checkStopWordsAndReturnSearchQuery, SearchType
}