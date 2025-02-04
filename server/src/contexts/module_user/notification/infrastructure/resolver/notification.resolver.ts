import { Inject, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Resolver, Query } from "@nestjs/graphql";
import { NotificationAdapterInterface } from "../../domain/adapter/notification.adapter.interface";
import { ClerkAuthGuard } from "src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard";
import { CustomContextRequestInterface } from "src/contexts/module_shared/auth/custom_request/custom.context.request.interface";
import { notification_graph_model_get_all } from "../../application/dtos/getAll.notification.dto";

@Resolver()
export class NotificationResolver {
    constructor(
        @Inject('NotificationAdapterInterface')
        private readonly notificationAdapter: NotificationAdapterInterface,
    ) { }

    @Mutation(() => String, {
        nullable: true,
        description: 'Cambia el estado de una notificacion a "vista o no vista"',
    })
    @UseGuards(ClerkAuthGuard)
    async changeNotificationStatus(
        @Args('notificationIds', { type: () => [String] }) notificationId: string[],
        @Args('view', { type: () => Boolean }) view: boolean,
        @Context() context: { req: CustomContextRequestInterface },
    ): Promise<string> {
        const userRequestId = context.req.userRequestId;
        try {
            await this.notificationAdapter.changeNotificationStatus(userRequestId, notificationId, view);
            return 'Notification status is: ' + view
        } catch (error: any) {
            throw error;
        }
    }

    @Query(() => notification_graph_model_get_all, {
        nullable: true,
        description: 'obtener todas las notificaciones de un usuario por su Id',
    })
    @UseGuards(ClerkAuthGuard)
    async getAllNotificationsFromUserById(
        @Args('limit', { type: () => Number }) limit: number,
        @Args('page', { type: () => Number }) page: number,
        @Context() context: { req: CustomContextRequestInterface },
    ): Promise<notification_graph_model_get_all> {
        const userRequestId = context.req.userRequestId;
        try {
            return await this.notificationAdapter.getAllNotificationsFromUserById(
                userRequestId,
                limit,
                page,
            );
        } catch (error: any) {
            throw error;
        }
    }

    @Mutation(() => String, {
        nullable: true,
        description: 'Elimina una notificacion por su Id',
    })
    @UseGuards(ClerkAuthGuard)
    async deleteNotificationById(
        @Args('event', { type: () => String }) event: string,
        @Args('_id', { type: () => String }) _id: string,
        @Context() context: { req: CustomContextRequestInterface },
    ): Promise<string> {
        const userRequestId = context.req.userRequestId;
        try {
            await this.notificationAdapter.deleteNotificationById(event, userRequestId, _id);
            return 'Notification deleted'
        } catch (error: any) {
            throw error;    
        }
    }




}