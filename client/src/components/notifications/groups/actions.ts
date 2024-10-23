const acceptGroupInvitation = async (groupId: string) => {
    console.log("acceptGroupInvitation")
}
const declineGroupInvitation = async (groupId: string) => {
    console.log("declineGroupInvitation")
}

const acceptNewMember = async (groupId: string, memberId: string) => {
    console.log("acceptNewMember")
}

const declineNewMember = async (groupId: string, memberId: string) => {
    console.log("declineNewMember")
}

export { acceptGroupInvitation, declineGroupInvitation, acceptNewMember, declineNewMember }