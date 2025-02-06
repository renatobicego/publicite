import { throwDeprecation } from "process"; import { forwardRef, Module } from "@nestjs/common";
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
import { NotificationContactSellerService } from "../../application/service/notification.contactSeller.service";
import { NotificationContactSellerModel } from "../schemas/notification.contactSeller.schema";
import { NotificationPaymentModel } from "../schemas/notification.payment.schema";
import { NotificationRequestCalificationService } from "../../application/service/notification.requestCalification.service";

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
                    { name: NotificationContactSellerModel.modelName, schema: NotificationContactSellerModel.schema },
                    { name: NotificationPaymentModel.modelName, schema: NotificationPaymentModel.schema },
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
            provide: 'NotificationServiceInterface',
            useClass: NotificationService
        },
        {
            provide: 'NotificationGroupServiceInterface',
            useClass: NotificationGroupService
        },
        {
            provide: 'NotificationMagazineServiceInterface',
            useClass: NotificationMagazineService,
        },
        {
            provide: 'NotificationUserServiceInterface',
            useClass: NotificationUserService,
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
        },
        {
            provide: 'NotificationSubscriptionServiceInterface',
            useClass: NotificationSubscriptionService
        }, {
            provide: 'NotificationContactSellerServiceInterface',
            useClass: NotificationContactSellerService
        }
        , {
            provide: 'NotificationRequestCalificationServiceInterface',
            useClass: NotificationRequestCalificationService
        }




    ],
    exports: [
        'NotificationGroupServiceInterface',
        'NotificationMagazineServiceInterface',
        'NotificationUserServiceInterface',
        'NotificationPostServiceInterface',
        'NotificationRepositoryInterface',
        'NotificationSubscriptionServiceInterface',
        'NotificationContactSellerServiceInterface',
        'NotificationRequestCalificationServiceInterface'

    ]
})

export class NotificationModule { }