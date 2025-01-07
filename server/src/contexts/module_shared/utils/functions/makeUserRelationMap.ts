interface UserRelation {
    userA: string;
    userB: string;
    typeRelationA: string;
    typeRelationB: string;

}

export function makeUserRelationMap(userRelation: any, userRequestId: string) {
    const relationMap = new Map<string, String[]>()
    const TOPFRIENDS = 'topfriends';
    const CONTACTS = 'contacts';
    const FRIENDS = 'friends';




    userRelation.forEach((relation: UserRelation) => {
        const relationArray: String[] = [];
        const friendId = relation.userA.toString() === userRequestId
            ? relation.userB.toString()
            : relation.userA.toString();

        relationArray.push(relation.typeRelationA);

        if (relation.typeRelationA === TOPFRIENDS) {
            relationArray.push(CONTACTS)
            relationArray.push(FRIENDS)
        } else if (relation.typeRelationA === FRIENDS) {
            relationArray.push(CONTACTS)
        }

        relationMap.set(friendId, relationArray);
    });


    return relationMap;


}