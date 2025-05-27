enum OwnerType {
    user = 'user',
    group = 'group',
}

function createUserMagazine(userId: any) {
    return {
        name: 'Magazine 1',
        sections: [],
        ownerType: OwnerType.user,
        description: 'Description 1',
        user: userId,
        visibility: 'public',
    };

}
function createGroupMagazine(groupId: any, allowedCollaborators?: any[]) {
    return {
        name: 'Magazine 1',
        sections: [],
        ownerType: OwnerType.group,
        description: 'Description 1',
        allowedCollaborators: allowedCollaborators ?? [],
        group: groupId,
    };
}


export {
    createUserMagazine,
    createGroupMagazine,
}