import { Inject } from "@nestjs/common";
import { GroupNotificatorInterface } from "../../domain/service/group.notificator.interface";
import { GroupServiceInterface } from "src/contexts/module_group/group/domain/service/group.service.interface";
import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";

export class GroupNotificator implements GroupNotificatorInterface {

    constructor(
        private readonly logger: MyLoggerService,
        @Inject('GroupServiceInterface')
        private readonly groupService: GroupServiceInterface
    ) { }
    async sendNotificationToGroup(
        notification: any,
        event: string,
        session?: any,
    ): Promise<any> {
        try {
            const { _id } = notification.frontData.group; //Id del grupo
            const { backData } = notification.notification;
            this.logger.log('Sending new notification to Group');
            await this.groupService.pushNotificationToGroup(
                _id,
                backData,
                event,
                session,
            );
        } catch (error: any) {
            this.logger.error('An error occurred while sending notification to user');
            this.logger.error(error);
            throw error;
        }
    }

}