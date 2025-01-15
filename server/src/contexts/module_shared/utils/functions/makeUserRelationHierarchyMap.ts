import { Visibility_Of_Find } from "src/contexts/module_post/post/domain/entity/enum/post-visibility.enum";

interface UserRelation {
    userA: string;
    userB: string;
    typeRelationA: string;
    typeRelationB: string;

}

export function makeUserRelationHierarchyMap(userRelation: any, userRequestId: string) {
    const friendID_and_typeOfRelation_map = new Map<string, String[]>()
    const TOPFRIENDS = 'topfriends';
    const CONTACTS = 'contacts';
    const FRIENDS = 'friends';




    userRelation.forEach((relation: UserRelation) => {
        const typeOfRelationArray: String[] = [];
        const friendId = relation.userA.toString() === userRequestId
            ? relation.userB.toString()
            : relation.userA.toString();

        typeOfRelationArray.push(relation.typeRelationA);

        if (relation.typeRelationA === TOPFRIENDS) {
            typeOfRelationArray.push(CONTACTS)
            typeOfRelationArray.push(FRIENDS)
        } else if (relation.typeRelationA === FRIENDS) {
            typeOfRelationArray.push(CONTACTS)
        }

        friendID_and_typeOfRelation_map.set(friendId, typeOfRelationArray);
    });


    return friendID_and_typeOfRelation_map;


}


export function makeUserDirectRelationMap(userRelation: any, userRequestId: string, visibility: Visibility_Of_Find) {
    const friendID_and_typeOfRelation_map = new Map<string, String[]>()


    userRelation.forEach((relation: UserRelation) => {
        const typeOfRelationArray: String[] = [];
        const friendId = relation.userA.toString() === userRequestId
            ? relation.userB.toString()
            : relation.userA.toString();

        if (visibility === relation.typeRelationA) {
            typeOfRelationArray.push(relation.typeRelationB);
            friendID_and_typeOfRelation_map.set(friendId, typeOfRelationArray);
        }

    });
    return friendID_and_typeOfRelation_map;


}