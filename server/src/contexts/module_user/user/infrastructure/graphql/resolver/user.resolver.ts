import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';


import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { GROUP_notification_graph_model_get_all } from '../../../application/adapter/dto/HTTP-RESPONSE/notifications/user.notifications.response';
import { UserAdapterInterface } from '../../../application/adapter/userAdapter.interface';
import { User_Full_Grapql_Model } from '../../../domain/entity/models_graphql/user.full.grapql.model';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';

//´Provee instrucciones para transformar las insttrucciones provenientes del cliente en data que graph puede utilizar
// Los resolvers son similareas a los controladores traicionales de un rest enpoint. SON PROVIDERS para nest

@Resolver()
export class UserResolver {
  constructor(
    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
  ) { }

  @Query(() => User_Full_Grapql_Model, {
    nullable: true,
    description: 'Obtiene un usuario por su nombre de usuario ',
  })
  @UseGuards(ClerkAuthGuard)
  async findUserByUsername(
    @Args('username', { type: () => String }) username: string,
  ): Promise<User_Full_Grapql_Model | null> {
    try {
      return await this.userAdapter.findUserByUsername(username);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => GROUP_notification_graph_model_get_all, {
    nullable: true,
    description: 'obtener todas las notificaciones de un usuario por su Id',
  })
  @UseGuards(ClerkAuthGuard)
  async getAllNotificationsFromUserById(
    @Args('limit', { type: () => Number }) limit: number,
    @Args('page', { type: () => Number }) page: number,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<GROUP_notification_graph_model_get_all> {
    const userRequestId = context.req.userRequestId;
    try {
      return await this.userAdapter.getAllNotificationsFromUserById(
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
    description: 'Cambia el estado de una notificacion a "vista o no vista"',
  })
  @UseGuards(ClerkAuthGuard)
  async changeNotificationStatus(
    @Args('notificationId', { type: () => String }) notificationId: string,
    @Args('view', { type: () => Boolean }) view: boolean,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<string> {
    const userRequestId = context.req.userRequestId;
    try {
      await this.userAdapter.changeNotificationStatus(userRequestId, notificationId, view);
      return 'Notification status is: ' + view
    } catch (error: any) {
      throw error;
    }
  }
}
