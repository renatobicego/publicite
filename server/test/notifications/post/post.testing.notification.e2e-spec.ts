import { Test } from "@nestjs/testing";
import { Connection, Types } from "mongoose";
import { AppModule } from "src/app.module";
import * as request from 'supertest';
import * as dotenv from 'dotenv';


import { DatabaseService } from "src/contexts/module_shared/database/infrastructure/database.service";
import { createNotificationPost_testing, NotificationPostType_testing } from "../model/notification.test.model";
import createTestingPost_e2e from "../../../test/functions_e2e_testing/create.post";
import createTestingUser_e2e from "../../../test/functions_e2e_testing/create.user";
// 'notification_post_new_reaction',         // han reaccionado a un post
// 'notification_post_new_comment',          // han comentado tu post
// 'notification_post_new_comment_response'  // han respondido tu comentario




describe('Post Comments', () => {

    let dbConnection: Connection;
    let httpServer: any;
    let app: any;
    let PUBLICITE_SOCKET_API_KEY: string;

    beforeAll(async () => {
        dotenv.config({ path: '.env.test' });
        PUBLICITE_SOCKET_API_KEY = process.env.PUBLICITE_SOCKET_API_KEY!;

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        dbConnection = moduleRef
            .get<DatabaseService>(DatabaseService)
            .getDBHandle();
        httpServer = app.getHttpServer();




    })

    afterEach(async () => {
        await dbConnection.collection('users').deleteMany({});
        await dbConnection.collection('posts').deleteMany({});
        await dbConnection.collection('notifications').deleteMany({});
        await dbConnection.collection('postcomments').deleteMany({})
        await dbConnection.collection('postreactions').deleteMany({})

    })


    afterAll(async () => {
        await dbConnection.close();
        await app.close();
    })


    it('Create comment  in post and send notification to user', async () => {
        const postId = new Types.ObjectId();
        const userIdTo = new Types.ObjectId();
        const userIdFrom = new Types.ObjectId();

        const post = await createTestingPost_e2e({
            _id: postId,
            title: "post con comment",
            author: userIdTo.toString(),

        }, dbConnection)

        await createTestingUser_e2e({
            _id: userIdTo,
            username: "test",
            notifications: [],
            posts: [postId]
        }, dbConnection)


        const notification = createNotificationPost_testing({
            event: 'notification_post_new_comment',
            backData: {
                userIdTo: userIdTo.toString(),
                userIdFrom: userIdFrom.toString(),
            },
            type: "post_notifications",
            frontData: {
                postActivity: {
                    notificationPostType: NotificationPostType_testing.comment,
                    postComment: {
                        comment: 'comment'
                    },
                    post: {
                        _id: postId.toString(),
                        title: post.title!,
                        imageUrl: post.imagesUrls![0],
                        postType: post.postType!
                    },
                    postReaction: undefined,
                    user: {
                        username: "test"
                    }
                }
            },

        })


        const response = await request(httpServer)
            .post('/socket/post')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(201);

        const user: any = await dbConnection.collection('users').findOne({ _id: userIdTo })
        expect(user).toBeTruthy();
        expect(user.notifications.length).toBe(1);

        const post_ = await dbConnection.collection('posts').findOne({ _id: postId })
        if (!post_) {
            throw new Error("Post not found")
        }
        expect(post_).toBeTruthy();
        expect(post_.comments!.length).toBe(1);




    })


    it('Create reaction in post and send notification to user', async () => {
        const postId = new Types.ObjectId();
        const userIdTo = new Types.ObjectId();
        const userIdFrom = new Types.ObjectId();

        const post = await createTestingPost_e2e({
            _id: postId,
            title: "post con reaction",
            author: userIdTo.toString(),

        }, dbConnection)

        await createTestingUser_e2e({
            _id: userIdTo,
            username: "test",
            notifications: [],
            posts: [postId]
        }, dbConnection)


        const notification = createNotificationPost_testing({
            event: 'notification_post_new_reaction',
            backData: {
                userIdTo: userIdTo.toString(),
                userIdFrom: userIdFrom.toString(),
            },
            type: "post_notifications",
            frontData: {
                postActivity: {
                    notificationPostType: NotificationPostType_testing.reaction,
                    post: {
                        _id: postId.toString(),
                        title: post.title!,
                        imageUrl: post.imagesUrls![0],
                        postType: post.postType!
                    },
                    postReaction: {
                        emoji: '👍'
                    },
                    user: {
                        username: "test"
                    }
                }
            },

        })


        const response = await request(httpServer)
            .post('/socket/post')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(201);

        const user: any = await dbConnection.collection('users').findOne({ _id: userIdTo })
        expect(user).toBeTruthy();
        expect(user.notifications.length).toBe(1);

        const post_ = await dbConnection.collection('posts').findOne({ _id: postId })
        if (!post_) {
            throw new Error("Post not found")
        }
        expect(post_).toBeTruthy();
        expect(post_.comments!.length).toBe(0);
        expect(post_.reactions!.length).toBe(1);


        const reaction = await dbConnection.collection('postreactions').findOne({ user: userIdFrom })
        expect(reaction).toBeTruthy();
        if (!reaction) {
            throw new Error("Reaction not found")
        }
        expect(reaction.reaction).toEqual('👍');




    })


    it('Create response in post and send notification to user', async () => {
        const postId = new Types.ObjectId();
        const userIdTo = new Types.ObjectId();
        const ownerPost = new Types.ObjectId();
        const commentId = new Types.ObjectId();

        const post = await createTestingPost_e2e({
            _id: postId,
            title: "post con reaction",
            author: ownerPost.toString(),
            comments: [commentId]

        }, dbConnection)

        await createTestingUser_e2e({
            _id: userIdTo,
            username: "test",
            notifications: [],
        }, dbConnection)

        await dbConnection.collection('postcomments').insertOne({
            _id: commentId,
            user: userIdTo.toString(),
            isEdited: false,
            createdAt: new Date(),
        })

        const notification = createNotificationPost_testing({
            event: 'notification_post_new_reaction',
            backData: {
                userIdTo: userIdTo.toString(),
                userIdFrom: ownerPost.toString(),
            },
            type: "post_notifications",
            frontData: {
                postActivity: {
                    notificationPostType: NotificationPostType_testing.response,
                    post: {
                        _id: postId.toString(),
                        title: post.title!,
                        imageUrl: post.imagesUrls![0],
                        postType: post.postType!
                    },
                    postResponse: {
                        author: ownerPost.toString(),
                        commentId: commentId.toString(),
                        response: 'Esta es una respuesta'
                    },
                    user: {
                        username: "test"
                    }
                }
            },

        })


        const response = await request(httpServer)
            .post('/socket/post')
            .set('Authorization', PUBLICITE_SOCKET_API_KEY)
            .send(notification);

        expect(response.status).toBe(201);

        const user: any = await dbConnection.collection('users').findOne({ _id: userIdTo })
        expect(user).toBeTruthy();
        expect(user.notifications.length).toBe(1);

        const post_ = await dbConnection.collection('posts').findOne({ _id: postId })
        if (!post_) {
            throw new Error("Post not found")
        }
        expect(post_).toBeTruthy();
        expect(post_.comments!.length).toBe(1);
        expect(post_.reactions!.length).toBe(0);

        const comment = await dbConnection.collection('postcomments').findOne({ _id: commentId })
        if (!comment) {
            throw new Error("comment not found")
        }
        console.log(comment)
        const responseId = comment.response
        const response_r = await dbConnection.collection('postcomments').findOne({ _id: responseId })
        if (!response_r) {
            throw new Error("response_r not found")
        }
        expect(response_r.comment).toEqual("Esta es una respuesta");








    })


});