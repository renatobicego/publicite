import { checkStopWordsAndReturnSearchQuery, SearchType } from "../checkStopWordsAndReturnSearchQuery";
import { stopWordsGroup, stopWordsPost } from "../stopWords";


describe('checkStopWordsAndReturnSearchQuery', () => {
    // Mock de las stop words
    const mockStopWordsGroup = new Set(['de', 'la', 'en']);
    const mockStopWordsPost = new Set(['un', 'una', 'el']);

    beforeAll(() => {
        // Sobrescribir las stop words con los mocks
        stopWordsGroup.clear();
        mockStopWordsGroup.forEach(word => stopWordsGroup.add(word));
        stopWordsPost.clear();
        mockStopWordsPost.forEach(word => stopWordsPost.add(word));
    });


    it('should return null if searchTerm is empty or null', () => {
        expect(checkStopWordsAndReturnSearchQuery('', SearchType.group)).toBeNull();
        expect(checkStopWordsAndReturnSearchQuery(null as any, SearchType.post)).toBeNull();
    });


    it('should return null if searchTerm has less than 2 characters', () => {
        expect(checkStopWordsAndReturnSearchQuery('a', SearchType.group)).toBeNull();
        expect(checkStopWordsAndReturnSearchQuery('b', SearchType.post)).toBeNull();
    });


    it('should filter stop words and return normalized query for group search', () => {
        const searchTerm = 'la casa de la montaña';
        const result = checkStopWordsAndReturnSearchQuery(searchTerm, SearchType.group);
        expect(result).toBe('(casa).*?(montana)');
    });


    it('should filter stop words and return normalized query for post search', () => {
        const searchTerm = 'un día el parque';
        const result = checkStopWordsAndReturnSearchQuery(searchTerm, SearchType.post);
        expect(result).toBe('(dia).*?(parque)');
    });


    it('should return normalized query if no stop words are present', () => {
        const searchTerm = 'casa bonita';
        const resultGroup = checkStopWordsAndReturnSearchQuery(searchTerm, SearchType.group);
        const resultPost = checkStopWordsAndReturnSearchQuery(searchTerm, SearchType.post);
        expect(resultGroup).toBe('(casa).*?(bonita)');
        expect(resultPost).toBe('(casa).*?(bonita)');
    });


    it('should return null if searchType is invalid', () => {
        const searchTerm = 'casa bonita';
        const result = checkStopWordsAndReturnSearchQuery(searchTerm, 'invalidType' as any);
        expect(result).toBeNull();
    });
});