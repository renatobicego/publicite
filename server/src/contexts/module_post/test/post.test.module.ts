import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import * as dotenv from 'dotenv';


import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { PostGoodModel } from "../post/infraestructure/schemas/post-types-schemas/post.good.schema";
import { PostPetitionModel } from "../post/infraestructure/schemas/post-types-schemas/post.petition.schema";
import { PostServiceModel } from "../post/infraestructure/schemas/post-types-schemas/post.service.schema";
import PostModel from "../post/infraestructure/schemas/post.schema";
import { PostService } from "../post/application/service/post.service";
import { PostRepository } from "../post/infraestructure/repository/post.repository";
import { UserModel, UserSchema } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { EmmiterModule } from "src/contexts/module_shared/event-emmiter/emiter.module";
import { LoggerModule } from "src/contexts/module_shared/logger/logger.module";
import PostReactionModel from "../post/infraestructure/schemas/post.reaction.schema";
import PostCommentModel from "../post/infraestructure/schemas/post.comment.schema";
import { UserModule } from "src/contexts/module_user/user/infrastructure/module/user.module";
import { SubscriptionPlanSchema } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema";
import { SubscriptionSchema } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema";
import { PostAdapter } from "../post/infraestructure/adapter/post.adapter";
import { PostComment } from "../post/domain/entity/postComment.entity";
import { PostReview } from "../PostReview/domain/review.entity";
import PostReviewModel from "../PostReview/infrastructure/schemas/review.schema";

const post_testing_module = async (): Promise<TestingModule> => {
    dotenv.config({ path: '.env.test' });
    const uri = process.env.DATABASE_URI;

    return Test.createTestingModule({
        imports: [
            EventEmitterModule.forRoot(
            ),
            UserModule,
            EmmiterModule,
            LoggerModule,
            MongooseModule.forRootAsync({

                useFactory: async () => {
                    return {
                        uri: uri,
                    };
                },
            }),
            MongooseModule.forFeature([
                {
                    name: PostModel.modelName,
                    schema: PostModel.schema,
                    discriminators: [
                        { name: PostGoodModel.modelName, schema: PostGoodModel.schema },
                        { name: PostServiceModel.modelName, schema: PostServiceModel.schema },
                        {
                            name: PostPetitionModel.modelName,
                            schema: PostPetitionModel.schema,
                        },
                    ],
                },
                { name: UserModel.modelName, schema: UserModel.schema },
                { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
                { name: 'Subscription', schema: SubscriptionSchema },
                { name: PostCommentModel.modelName, schema: PostCommentModel.schema },
                { name: PostReviewModel.modelName, schema: PostReviewModel.schema },
                { name: PostReactionModel.modelName, schema: PostReactionModel.schema },
            ]),

        ],
        providers: [
            MyLoggerService,
            {
                provide: 'PostRepositoryInterface',
                useClass: PostRepository,
            },
            {
                provide: 'PostServiceInterface',
                useClass: PostService,
            },
            {
                provide: 'PostAdapterInterface',
                useClass: PostAdapter,
            },
            {
                provide: 'PostMapperAdapterInterface',
                useValue: {},
            },

        ],
    }).compile();
};


const mapModuleTesting: Map<string, any> = new Map([
    ["post", post_testing_module],
]);

export default mapModuleTesting;