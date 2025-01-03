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
            provide: 'NotificationMagazineServiceInterface',
            useClass: NotificationService,
        },
        {
            provide: 'NotificationUserServiceInterface',
            useClass: NotificationService,
        }, {
            provide: 'NotificationPostServiceInterface',
            useClass: NotificationService,
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