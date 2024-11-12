import { GroupResponse } from "../../../application/adapter/dto/HTTP-RESPONSE/group.response";
import { GroupRepositoryMapperInterface } from "../../../domain/repository/mapper/group.repository.mapper.interface";

export class GroupRepositoryMapper implements GroupRepositoryMapperInterface {
  toGroupResponse(group: any): GroupResponse {
    const adminsArray = group.admins;
    const membersArray = group.members;
    const amountOfPost = 3
    if (adminsArray.length > 0) {
      adminsArray.forEach((admin: any) => {
        admin.posts = admin.posts.slice(0, amountOfPost);
        // admin.posts.forEach((post: any) => {
        //   if (post.imagesUrls && Array.isArray(post.imagesUrls)) {
        //     post.imagesUrls = post.imagesUrls.slice(0, 3);
        //   }
        // });
      });
      group.admins = adminsArray;
    }

    if (membersArray.length > 0) {
      membersArray.forEach((member: any) => {
        // member.posts.forEach((post: any) => {
        //   if (post.imagesUrls && Array.isArray(post.imagesUrls)) {
        //     post.imagesUrls = post.imagesUrls.slice(0, 3);
        //   }
        // });
        member.posts = member.posts.slice(0, amountOfPost);

      });
      group.members = membersArray;
    }

    return new GroupResponse(group);
  }
}
