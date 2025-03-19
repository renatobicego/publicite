import { InjectConnection } from "@nestjs/mongoose";
import { NotificationPost } from "../../domain/entity/notification.post.entity";
import { NotificationPostServiceInterface } from "../../domain/service/notification.post.service.interface";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { Connection } from "mongoose";
import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { PostServiceInterface } from "src/contexts/module_post/post/domain/service/post.service.interface";
import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";


export class NotificationPostService implements NotificationPostServiceInterface {
    constructor(
        @InjectConnection()
        private readonly connection: Connection,
        private readonly logger: MyLoggerService,
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('PostServiceInterface')
        private readonly postService: PostServiceInterface,
        @Inject('UserServiceInterface')
        private readonly userService: UserServiceInterface,


    ) {

    }

    async saveNotificationPostReactionAndSendToUser(notificationPost: NotificationPost) {
        const postId = notificationPost.getPostId;
        const reaction = notificationPost.getPostReactionEmoji;
        const userIdFrom = notificationPost.getbackData.userIdFrom;
        const userIdTo = notificationPost.getbackData.userIdTo;

        if (!postId || !reaction || !userIdFrom || !userIdTo) {
            throw new Error(
                `Mission postId, reaction, userIdFrom or userIdTo are undefined`
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
                    userIdFrom,
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
    async saveNotificationPostCommentAndSendToUser(notificationPostComment: NotificationPost): Promise<any> {
        const { getComment: comment, getPostId: postId, getbackData } = notificationPostComment;
        const { userIdFrom: userIdFrom, userIdTo } = getbackData;


        if (!comment || !userIdFrom || !postId || !userIdTo) {
            throw new Error(
                "Missing comment, userIdFrom, postId, or userIdTo."
            );
        }

        const session = await this.connection.startSession();
        try {
            this.logger.log(`Iniciando transacción para el comentario en el post ID: ${postId}`);

            const postComment = await session.withTransaction(async () => {



                if (userIdFrom != userIdTo) {
                    const notificationId = await this.notificationRepository.savePostNotification(
                        notificationPostComment,
                        session
                    );
                    await this.userService.pushNotificationToUserArrayNotifications(
                        notificationId,
                        userIdTo,
                        userIdFrom,
                        session
                    );
                }



                return await this.postService.makeCommentSchemaAndPutCommentInPost(
                    postId,
                    userIdFrom,
                    comment,
                    session
                );
            });

            this.logger.log(`Transacción completada con éxito para el post ID: ${postId}`);
            return { body: postComment };
        } catch (error) {
            this.logger.error(`Error al procesar el comentario en el post ID: ${postId}`, error.stack);
            throw new Error(`Error al guardar la notificación y comentario: ${error.message}`);
        } finally {
            session.endSession();
        }
    }


    async saveNotificationPostResponseAndSendToUser(notificationPostResponse: NotificationPost): Promise<any> {
        const { author, commentId, response } = notificationPostResponse.getCommentResponse ?? undefined;
        const userIdFrom = notificationPostResponse.getbackData.userIdFrom;
        const userIdTo = notificationPostResponse.getbackData.userIdTo;

        if (author != userIdFrom) {
            throw new UnauthorizedException(
                "Only author can make a response"
            );
        }
        if (!author || !commentId || !response || !userIdTo || !userIdFrom) {
            throw new Error(
                "Missing author, commentId or response."
            );
        }
        const session = await this.connection.startSession();
        try {
            this.logger.log(`Iniciando transacción para la respuesta del comentario con ID: ${commentId}`);

            const commentResponse = await session.withTransaction(async () => {

                if (userIdFrom != userIdTo) {
                    const notificationId = await this.notificationRepository.savePostNotification(
                        notificationPostResponse,
                        session
                    );

                    await this.userService.pushNotificationToUserArrayNotifications(
                        notificationId,
                        userIdTo,
                        userIdFrom,
                        session
                    );

                }

                return await this.postService.makeResponseAndPutResponseInComment(
                    author,
                    commentId,
                    response,
                    session
                );
            });

            this.logger.log(`Transacción completada con éxito para el comentario ID: ${commentId}`);
            return { body: commentResponse };
        } catch (error) {
            this.logger.error(`Error al procesar el comentario en el comentario ID: ${commentId}`, error.stack);
            throw new Error(`Error al guardar la notificación y comentario: ${error.message}`);
        } finally {

            session.endSession();
        }
    }

}