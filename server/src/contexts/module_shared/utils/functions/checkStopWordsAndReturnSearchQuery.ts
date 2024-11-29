import { stopWordsGroup, stopWordsPost } from "./stopWords";


enum SearchType {
    group = 'group',
    post = 'post'
}


function checkStopWordsAndReturnSearchQuery(searchTerm: string, searchType: string) {
    let searchTermSeparate: string[];

    if (SearchType.group === searchType) {
        if (searchTerm && (stopWordsGroup.has(searchTerm) || searchTerm.trim().length <= 2)) {
            return null;
        }
        searchTermSeparate = searchTerm
            ?.split(' ')
            .filter(
                (term) =>
                    term.trim() !== '' &&
                    !stopWordsGroup.has(term.trim().toLowerCase())
            );

    } else if (SearchType.post === searchType) {
        if (searchTerm && (stopWordsPost.has(searchTerm) || searchTerm.trim().length <= 2)) {
            return null;
        }
        searchTermSeparate = searchTerm
            ?.split(' ')
            .filter(
                (term) =>
                    term.trim() !== '' &&
                    !stopWordsPost.has(term.trim().toLowerCase())
            );

    } else {
        return null
    }


    const textSearchQuery = searchTermSeparate
        .map(term =>
            `(${term.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()})`
        )
        .join('.*?');

    return textSearchQuery;


}


export {
    checkStopWordsAndReturnSearchQuery, SearchType
}