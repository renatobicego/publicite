import { makeUserRelationHierarchyMap, makeUserRelationMapWithoutHierarchy } from "../makeUserRelationHierarchyMap";


interface UserRelation {
    userA: string;
    userB: string;
    typeRelationA: string;
    typeRelationB: string;

}

enum Visibility_Of_Find {
    contacts = 'contacts',
    friends = 'friends',
    topfriends = 'topfriends',
    hierarchy = 'hierarchy',
  }
  

describe('makeUserRelationHierarchyMap', () => {
    it('should create a map with hierarchy for topfriends', () => {
        const userRelations: UserRelation[] = [
            { userA: '1', userB: '2', typeRelationA: 'topfriends', typeRelationB: 'friends' },
        ];
        const userRequestId = '1';
        const result = makeUserRelationHierarchyMap(userRelations, userRequestId);

        expect(result.get('2')).toEqual(['topfriends', 'contacts', 'friends']);
    });

    it('should create a map with hierarchy for friends', () => {
        const userRelations: UserRelation[] = [
            { userA: '1', userB: '2', typeRelationA: 'friends', typeRelationB: 'contacts' },
        ];
        const userRequestId = '1';
        const result = makeUserRelationHierarchyMap(userRelations, userRequestId);

        expect(result.get('2')).toEqual(['friends', 'contacts']);
    });

    it('should handle multiple relations correctly', () => {
        const userRelations: UserRelation[] = [
            { userA: '1', userB: '2', typeRelationA: 'topfriends', typeRelationB: 'friends' },
            { userA: '1', userB: '3', typeRelationA: 'friends', typeRelationB: 'contacts' },
        ];
        const userRequestId = '1';
        const result = makeUserRelationHierarchyMap(userRelations, userRequestId);

        expect(result.get('2')).toEqual(['topfriends', 'contacts', 'friends']);
        expect(result.get('3')).toEqual(['friends', 'contacts']);
    });
});




describe('makeUserRelationMapWithoutHierarchy', () => {
    it('should create a map without hierarchy for topfriends visibility', () => {
        const userRelations: UserRelation[] = [
            { userA: '1', userB: '2', typeRelationA: 'topfriends', typeRelationB: 'friends' },
        ];
        const userRequestId = '1';
        const visibility = Visibility_Of_Find.topfriends;
        const result = makeUserRelationMapWithoutHierarchy(userRelations, userRequestId, visibility);

        expect(result.get('2')).toEqual(['contacts', 'friends', 'friends']);
    });

    it('should create a map without hierarchy for friends visibility', () => {
        const userRelations: UserRelation[] = [
            { userA: '1', userB: '2', typeRelationA: 'friends', typeRelationB: 'contacts' },
        ];
        const userRequestId = '1';
        const visibility = Visibility_Of_Find.friends;
        const result = makeUserRelationMapWithoutHierarchy(userRelations, userRequestId, visibility);

        expect(result.get('2')).toEqual(['contacts', 'contacts']);
    });

    it('should handle multiple relations correctly for specific visibility', () => {
        const userRelations: UserRelation[] = [
            { userA: '1', userB: '2', typeRelationA: 'topfriends', typeRelationB: 'friends' },
            { userA: '1', userB: '3', typeRelationA: 'friends', typeRelationB: 'contacts' },
        ];
        const userRequestId = '1';
        const visibility = Visibility_Of_Find.friends;
        const result = makeUserRelationMapWithoutHierarchy(userRelations, userRequestId, visibility);

        expect(result.get('3')).toEqual(['contacts', 'contacts']);
        expect(result.get('2')).toBeUndefined(); // '2' is not included because its typeRelationA is 'topfriends'
    });
});