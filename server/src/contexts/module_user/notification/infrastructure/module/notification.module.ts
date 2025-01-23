import { forwardRef, Module } from "@nestjs/common";
import { NotificationService } from "../../application/service/notification.service";
import { NotificationRepository } from "../repository/notification.repository";
import { MongooseModule } from "@nestjs/mongoose";
import NotificationModel from "../schemas/notification.schema";
import { NotificationGroupModel } from "../schemas/notification.group.schema";
import { UserModule } from "src/contexts/module_user/user/infrastructure/module/user.module";
import { GroupModule } from "src/contexts/module_group/group/infrastructure/module/group.module";
import { NotificationMagazineModel } from "../schemas/notification.magazine.schema";
import { MagazineModule } from "src/contexts/module_magazine/magazine/infrastructure/module/magazine.module";
import { NotificationAdapter } from "../adapter/notification.adapter";
import { NotificationResolver } from "../resolver/notification.resolver";
import { NotificationUserModel } from "../schemas/notification.user.schema";
import { PostModule } from "src/contexts/module_post/post/infraestructure/module/post.module";
import { NotificationPostModel } from "../schemas/notification.post.schema";
import { NotificationGroupService } from "../../application/service/notification.group.service";
import { NotificationMagazineService } from "../../application/service/notification.magazine.service";
import { NotificationUserService } from "../../application/service/notification.user.service";
import { NotificationPostService } from "../../application/service/notification.post.service";
import { NotificationSubscriptionService } from "../../application/service/notification.subscription.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: NotificationModel.modelName,
                schema: NotificationModel.schema,
                discriminators: [
                    { name: NotificationGroupModel.modelName, schema: NotificationGroupModel.schema },
                    { name: NotificationMagazineModel.modelName, schema: NotificationMagazineModel.schema },
                    { name: NotificationUserModel.modelName, schema: NotificationUserModel.schema },
                    { name: NotificationPostModel.modelName, schema: NotificationPostModel.schema },
                ],
            },
        ]),
        UserModule,
        MagazineModule,
        PostModule,
        forwardRef(() => GroupModule)
    ],
    providers: [
        NotificationResolver,
        {
            provide: 'NotificationGroupServiceInterface',
            useClass: NotificationService
        },
        {
            provide: 'NotificationGroupServiceInterface',
            useClass: NotificationGroupService
        },
        {
            provide: 'NotificationMagazineServiceInterface',
            useClass: NotificationService,
        },
        {
            provide: 'NotificationMagazineServiceInterface',
            useClass: NotificationMagazineService,
        },
        {
            provide: 'NotificationUserServiceInterface',
            useClass: NotificationService,
        },
        {
            provide: 'NotificationUserServiceInterface',
            useClass: NotificationUserService,
        }, {
            provide: 'NotificationPostServiceInterface',
            useClass: NotificationService,
        },
        {
            provide: 'NotificationPostServiceInterface',
            useClass: NotificationPostService,
        }, {
            provide: 'NotificationRepositoryInterface',
            useClass: NotificationRepository
        }, {
            provide: 'NotificationAdapterInterface',
            useClass: NotificationAdapter
        }, {
            provide: 'NotificationServiceInterface',
            useClass: NotificationService
        }
        , {
            provide: 'NotificationHandlerServiceInterface',
            useClass: NotificationService
        }, {
            provide: 'NotificationSubscriptionServiceInterface',
            useClass: NotificationSubscriptionService
        }



    ],
    exports: [
        'NotificationGroupServiceInterface',
        'NotificationMagazineServiceInterface',
        'NotificationUserServiceInterface',
        'NotificationPostServiceInterface',
        'NotificationRepositoryInterface'
    ]
})

export class NotificationModule { }