import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { forwardRef, Inject } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Types } from "mongoose";

import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";
import { NotificationGroup } from "../../domain/entity/notification.group.entity";

import { NotificationGroupServiceInterface } from "../../domain/service/notification.group.service.interface";
import { eventsThatMakeNotificationActionsInactive_GROUP, eventsThatMakeNotificationActionsInactive_MAGAZINE, eventsThatMakeNotificationActionsInactive_USER, GROUP_NOTIFICATION_send_group, memberForDeleteData, newMemberData, notification_group_new_user_invited, notification_magazine_new_user_invited, notification_user_friend_request_accepted, notification_user_new_friend_request, notification_user_new_relation_accepted, notification_user_new_relation_change, ownerType, typeOfNotification, user_acept_the_invitation, user_has_been_removed_fom_magazine } from "src/contexts/module_user/notification/domain/allowed-events/allowed.events.notifications";
import { GroupServiceInterface } from "src/contexts/module_group/group/domain/service/group.service.interface";
import { NotificationMagazineServiceInterface } from "../../domain/service/notification.magazine.service.interface";
import { NotificationMagazine } from "../../domain/entity/notification.magazine.entity";
import { NotificationFactory } from "../notification.factory";
import { MagazineServiceInterface } from "src/contexts/module_magazine/magazine/domain/service/magazine.service.interface";
import { NotificationServiceInterface } from "../../domain/service/notification.service.interface";
import { notification_graph_model_get_all } from "../dtos/getAll.notification.dto";
import { NotificationUserServiceInterface } from "../../domain/service/notification.user.service.interface";
import { NotificationUser } from "../../domain/entity/notification.user.entity";
import { NotModifyException } from "src/contexts/module_shared/exceptionFilter/noModifyException";
import { PreviousIdMissingException } from "src/contexts/module_shared/exceptionFilter/previousIdMissingException";
import { NotificationPostServiceInterface } from "../../domain/service/notification.post.service.interface";
import { NotificationPost } from "../../domain/entity/notification.post.entity";
import { PostServiceInterface } from "src/contexts/module_post/post/domain/service/post.service.interface";
import { Notification } from "../../domain/entity/notification.entity";
import { NotificationPostType } from "../../domain/entity/enum/notification.post.type.enum";
import { BoardRequest } from "src/contexts/module_user/board/application/dto/HTTP-REQUEST/board.request";
import { NotificationPostComment } from "../../domain/entity/notification.post.comment.entity";
import { PostComment } from "src/contexts/module_post/post/domain/entity/postComment.entity";




export class NotificationService implements NotificationGroupServiceInterface,
    NotificationMagazineServiceInterface,
    NotificationServiceInterface,
    NotificationUserServiceInterface,
    NotificationPostServiceInterface {

    constructor(
        private readonly logger: MyLoggerService,
        @InjectConnection()
        private readonly connection: Connection,
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('UserServiceInterface')
        private readonly userService: UserServiceInterface,
        @Inject(forwardRef(() => 'GroupServiceInterface'))
        private readonly groupService: GroupServiceInterface,
        @Inject('MagazineServiceInterface')
        private readonly magazineService: MagazineServiceInterface,
        @Inject('PostServiceInterface')
        private readonly postService: PostServiceInterface,



    ) {

    }



    private async addNewMemberToMagazine(newMemberData: newMemberData, session: any) {
        const { memberToAdd, magazineAdmin, magazineId, magazineType } = newMemberData

        try {
            if (ownerType.user === magazineType) {
                return await this.magazineService.addCollaboratorsToUserMagazine([memberToAdd], magazineId, magazineAdmin, session)
            } else if (ownerType.group === magazineType) {
                return await this.magazineService.addAllowedCollaboratorsToGroupMagazine([memberToAdd], magazineId, magazineAdmin, session)
            } else {
                throw new Error('Owner type (add member)  not supported in socket, please check it');
            }
        } catch (error: any) {
            throw error;
        }
    }



    async changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void> {
        try {
            await this.notificationRepository.changeNotificationStatus(userRequestId, notificationId, view);

        } catch (error: any) {
            throw error;
        }
    }



    private async deleteMemberFromMagazine(memberDta: memberForDeleteData, session: any) {
        const { memberToDelete, magazineAdmin, magazineId, magazineType } = memberDta
        try {
            if (ownerType.user === magazineType) {
                return await this.magazineService.deleteCollaboratorsFromMagazine([memberToDelete], magazineId, magazineAdmin, session)
            } else if (ownerType.group === magazineType) {
                return await this.magazineService.deleteAllowedCollaboratorsFromMagazineGroup([memberToDelete], magazineId, magazineAdmin, session)
            } else {
                throw new Error('Owner type (delete member) not supported in socket, please check it');
            }
        } catch (error: any) {
            throw error;
        }

    }



    async getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<notification_graph_model_get_all> {
        try {
            return await this.notificationRepository.getAllNotificationsFromUserById(
                id,
                limit,
                page,
            );
        } catch (error: any) {
            throw error;
        }
    }

    async handleMagazineNotificationAndCreateIt(notificationBody: any): Promise<void> {

        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationMagazine = factory.createNotification(typeOfNotification.magazine_notifications, notificationBody);

            await this.saveNotificationMagazineAndSentToUser(notificationMagazine as NotificationMagazine);

        } catch (error: any) {
            throw error;
        }
    }


    async handleGroupNotificationAndCreateIt(notificationBody: any): Promise<void> {

        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationGroup = factory.createNotification(typeOfNotification.group_notifications, notificationBody);

            await this.saveNotificationGroupAndSentToUserAndGroup(notificationGroup as NotificationGroup);

        } catch (error: any) {
            throw error;
        }
    }


    async handlePostNotificationAndCreateIt(notificationBody: any): Promise<void> {
        
        try {
            const notificationPostType = notificationBody.frontData.postActivity.notificationPostType;
            if(!notificationPostType){
                throw new Error("NotificationPostType is required")
            }
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationPost: any= factory.createNotification(
                typeOfNotification.post_notifications, 
                notificationBody,
                notificationBody.frontData.postActivity.notificationPostType);

            if(notificationPost.getPostNotificationType === NotificationPostType.comment){ 
                return await this.saveNotificationPostCommentAndSendToUser(notificationPost)
            }else if(notificationPost.getNotificationEntityId === NotificationPostType.reaction){
                return await this.saveNotificationPostAndSendToUser(notificationPost);
            }
        } catch (error: any) {
            throw error;
        }
    }


    async isThisNotificationDuplicate(notificationEntityId: string): Promise<any> {
        try {
            const isDuplicate = await this.notificationRepository.isThisNotificationDuplicate(notificationEntityId);
            if (isDuplicate) throw new NotModifyException();
        } catch (error: any) {
            throw error;
        }
    }
    async handleUserNotificationAndCreateIt(notificationBody: any): Promise<void> {

        try {
            const factory = NotificationFactory.getInstance(this.logger);
            const notificationUser = factory.createNotification(typeOfNotification.user_notifications, notificationBody);
            await this.saveNotificationUserAndSentToUser(notificationUser as NotificationUser);

        } catch (error: any) {
            throw error;
        }
    }



    async saveNotificationGroupAndSentToUserAndGroup(notificationGroup: NotificationGroup): Promise<any> {

        const event: string = notificationGroup.getEvent;
        const userNotificationOwner = notificationGroup.getUser;
        const session = await this.connection.startSession();
        let notificationId: Types.ObjectId;

        try {


            await session.withTransaction(async () => {
                this.logger.log('Saving notification....');
                if (event === notification_group_new_user_invited) await this.isThisNotificationDuplicate(notificationGroup.getNotificationEntityId);
                notificationId = await this.notificationRepository.saveGroupNotification(notificationGroup, session);
                this.logger.log('Notification save successfully');
                if (eventsThatMakeNotificationActionsInactive_GROUP.includes(event)) {
                    this.logger.log('Setting notification actions to false');
                    const previousNotificationId = notificationGroup.getpreviousNotificationId;
                    if (!previousNotificationId) {
                        throw new PreviousIdMissingException()
                    }
                    await this.notificationRepository.setNotificationActionsToFalseById(previousNotificationId, session);
                }

                if (GROUP_NOTIFICATION_send_group.includes(event)) {
                    this.logger.log('Sending new notification to group');
                    await this.groupService.handleNotificationGroupAndSendToGroup(
                        notificationGroup.getGroupId,
                        notificationGroup.getbackData,
                        event,
                        session,
                        notificationId as unknown as string,
                    );
                }

                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userNotificationOwner, session);
            });
        } catch (error: any) {
            this.logger.error('An error occurred while sending notification');
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async saveNotificationMagazineAndSentToUser(notificationMagazine: NotificationMagazine): Promise<any> {
        try {
            const event = notificationMagazine.getEvent;
            const magazineId = notificationMagazine.getFrontData.magazine._id;
            const magazineType = notificationMagazine.getFrontData.magazine.ownerType;
            const userNotificationOwner = notificationMagazine.getUser
            const session = await this.connection.startSession();

            await session.withTransaction(async () => {
                if (event === notification_magazine_new_user_invited) await this.isThisNotificationDuplicate(notificationMagazine.getNotificationEntityId);
                const notificationId = await this.notificationRepository.saveMagazineNotification(notificationMagazine, session);

                if (eventsThatMakeNotificationActionsInactive_MAGAZINE.includes(event)) {
                    const previousNotificationId = notificationMagazine.getpreviousNotificationId;
                    if (!previousNotificationId) {
                        throw new PreviousIdMissingException()
                    }
                    await this.notificationRepository.setNotificationActionsToFalseById(previousNotificationId, session)
                }

                if (event === user_has_been_removed_fom_magazine) {

                    const memberDeleteData: memberForDeleteData = {
                        memberToDelete: notificationMagazine.getbackData.userIdTo,
                        magazineAdmin: notificationMagazine.getbackData.userIdFrom,
                        magazineId: magazineId,
                        magazineType: magazineType,
                    }

                    await this.deleteMemberFromMagazine(memberDeleteData, session)
                }
                if (event === user_acept_the_invitation) {

                    const newMemberData: newMemberData = {
                        memberToAdd: notificationMagazine.getbackData.userIdFrom,
                        magazineAdmin: notificationMagazine.getbackData.userIdTo,
                        magazineId: magazineId,
                        magazineType: magazineType
                    }

                    await this.addNewMemberToMagazine(newMemberData, session)

                }


                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userNotificationOwner, session);
            })


        } catch (error: any) {
            throw error;
        }
    }
    async saveNotificationPostAndSendToUser(notificationPost: NotificationPost) {
        const postId = notificationPost.getPostId;
        const reaction = notificationPost.getPostReactionEmoji;
        const userIdFrom = notificationPost.getbackData.userIdFrom;
        const userIdTo = notificationPost.getbackData.userIdTo;

        if (!postId || !reaction || !userIdFrom || !userIdTo) {
            throw new Error(
                `Invalid notification post: Missing postId (${postId}), reaction (${reaction}), userIdFrom (${userIdFrom}), or userIdTo (${userIdTo}).`
            );
        }

        const session = await this.connection.startSession();
        try {
            const postReactionId = await session.withTransaction(async () => {
                const postReactionId = await this.postService.makeReactionSchemaAndSetReactionToPost(
                    postId,
                    { user: userIdFrom, reaction: reaction },
                    session
                );
                const notificationId = await this.notificationRepository.savePostNotification(
                    notificationPost,
                    session
                );
                await this.userService.pushNotificationToUserArrayNotifications(
                    notificationId,
                    userIdTo,
                    session
                );
                return postReactionId
            });

            return postReactionId
        } catch (error) {
            console.error("Error in saveNotificationPostAndSendToUser:", error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async saveNotificationPostCommentAndSendToUser(notificationPostComment: NotificationPostComment){
        try{
            this.logger.log("Setting comment on post id: "  + notificationPostComment.getPostId)
            const comment = notificationPostComment.getComment;
            const userCommentId = notificationPostComment.getbackData.userIdFrom
            const postId = notificationPostComment.getPostId;

            if(!comment|| !userCommentId || !postId ){
                throw new Error("Please complete post comment, userCommentId or postId")
            }
            
            await this.postService.setPostComment(postId,userCommentId,comment)

        }catch(error:any){
            throw error;
        }
        
    }   

    async saveNotificationUserAndSentToUser(notificationUser: NotificationUser): Promise<any> {

        try {
            const session = await this.connection.startSession();
            const event = notificationUser.getEvent;
            const userIdFrom = notificationUser.getbackData.userIdFrom;
            const userIdTo = notificationUser.getbackData.userIdTo;

            await session.withTransaction(async () => {


                if (event === notification_user_friend_request_accepted) {
                    const userRelationId = await this.userService.makeFriendRelationBetweenUsers(notificationUser.getbackData, notificationUser.getTypeOfRelation, session)
                    if (!userRelationId) throw new Error(`Error was ocurred when making friend relation between users, please try again`);
                    notificationUser.setNotificationUserRelationId = userRelationId

                }

                if (event === notification_user_new_relation_accepted) {
                    const userRelationId = notificationUser.getUserRelationId ?? undefined
                    if (!userRelationId) { throw new Error(`EVENT: ${event} require userRelationId, please send it and try again, `) }
                    await this.userService.updateFriendRelationOfUsers(userRelationId, notificationUser.getTypeOfRelation, session)
                }



                const notificationId = await this.notificationRepository.saveUserNotification(notificationUser, session);

                if (event === notification_user_new_friend_request || event === notification_user_new_relation_change) {
                    await this.isThisNotificationDuplicate(notificationUser.getNotificationEntityId);
                    await this.userService.pushNewFriendRequestOrRelationRequestToUser(notificationId, userIdTo, session)
                }


                if (eventsThatMakeNotificationActionsInactive_USER.includes(event)) {
                    const previousNotificationId = notificationUser.getpreviousNotificationId;
                    if (!previousNotificationId) {
                        throw new PreviousIdMissingException()
                    }
                    await this.notificationRepository.setNotificationActionsToFalseById(previousNotificationId, session)
                    await this.userService.removeFriendRequest(previousNotificationId, userIdFrom, session)

                }


                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userIdTo, session);


            })

        } catch (error: any) {
            throw error;
        }
    }



}