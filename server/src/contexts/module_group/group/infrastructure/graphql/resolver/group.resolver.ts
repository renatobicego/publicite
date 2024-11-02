import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';
import { GroupRequest } from '../../../application/adapter/dto/HTTP-REQUEST/group.request';
import { GroupUpdateRequest } from '../../../application/adapter/dto/HTTP-REQUEST/group.update.request';
import {
  GroupResponse,
  GroupListResponse,
  GroupResponseById,
} from '../../../application/adapter/dto/HTTP-RESPONSE/group.response';
import { GroupAdapterInterface } from '../../../application/adapter/group.adapter.interface';

@Resolver('Group')
export class GroupResolver {
  constructor(
    @Inject('GroupAdapterInterface')
    private readonly groupAdapter: GroupAdapterInterface,
  ) {}

  @Mutation(() => String, {
    nullable: true,
    description: 'Aceptar la invitacion a un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async acceptGroupInvitation(
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      const token = context.req.headers.authorization;
      const userRequestId = PubliciteAuth.getIdFromClerkToken(token);
      await this.groupAdapter.acceptGroupInvitation(groupId, userRequestId);
      return 'Invitation accepted';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar admins un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async addAdminsToGroupByGroupId(
    @Args('newAdmins', { type: () => [String] })
    newAdmins: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.addAdminsToGroup(newAdmins, groupId, groupAdmin);
      return 'Admins added';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description:
      'Aceptar la invitacion de un miembro a un grupo- Solo admins o creadores pueden aceptar',
  })
  @UseGuards(ClerkAuthGuard)
  async acceptJoinGroupRequest(
    @Args('newMember', { type: () => String })
    newMember: string,
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.acceptJoinGroupRequest(
        newMember,
        groupId,
        groupAdmin,
      );
      return 'Member added';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar revistas a un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async addMagazinezToGroupByGroupId(
    @Args('newMagazines', { type: () => [String] })
    newMagazines: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.addMagazinesToGroup(
        newMagazines,
        groupId,
        groupAdmin,
      );
      return 'Magazines added';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => GroupResponse, {
    nullable: true,
    description: 'Crear un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async createNewGroup(
    @Args('groupDto', { type: () => GroupRequest }) groupDto: GroupRequest,
    @Context() context: any,
  ): Promise<GroupResponse> {
    try {
      const token = context.req.headers.authorization;
      const groupCreator = PubliciteAuth.getIdFromClerkToken(token);
      return await this.groupAdapter.saveGroup(groupDto, groupCreator);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar admins un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async removeAdminsFromGroupByGroupId(
    @Args('adminsToDelete', { type: () => [String] })
    adminsToDelete: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.removeAdminsFromGroupByGroupId(
        adminsToDelete,
        groupId,
        groupAdmin,
      );
      return 'Users deleted';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar miembros un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteMembersFromGroupByGroupId(
    @Args('membersToDelete', { type: () => [String] })
    membersToDelete: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.deleteMembersToGroup(
        membersToDelete,
        groupId,
        groupAdmin,
      );
      return 'Users deleted';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar revistas de un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteMagazinesFromGroupByGroupId(
    @Args('magazinesToDelete', { type: () => [String] })
    magazinesToDelete: string[],
    @Args('groupAdmin', { type: () => String })
    groupAdmin: string,
    @Args('groupId', { type: () => String })
    groupId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupAdmin);
      await this.groupAdapter.deleteMagazinesFromGroup(
        magazinesToDelete,
        groupId,
        groupAdmin,
      );
      return 'Magazines deleted';
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => GroupResponseById, {
    nullable: true,
    description: 'Busca un grupo por su id',
  })
  @UseGuards(ClerkAuthGuard)
  async getGroupById(
    @Args('id', { type: () => String })
    groupId: string,
    @Context() context: any,
  ): Promise<GroupResponseById> {
    try {
      const token = context.req.headers.authorization;
      const userRequest = PubliciteAuth.getIdFromClerkToken(token);
      return await this.groupAdapter.findGroupById(groupId, userRequest);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => GroupListResponse, {
    nullable: true,
    description: 'Busca un grupo por su nombre o alias',
  })
  @UseGuards(ClerkAuthGuard)
  async getGroupByNameOrAlias(
    @Args('name', {
      type: () => String,
      description: 'nombre del grupo o el alias',
    })
    name: string,
    @Args('limit', { type: () => Number }) limit: number,
    @Args('page', { type: () => Number }) page: number,
    @Context() context: any,
  ): Promise<GroupListResponse> {
    try {
      const token = context.req.headers.authorization;
      const userRequest = PubliciteAuth.getIdFromClerkToken(token);
      return await this.groupAdapter.findGroupByNameOrAlias(
        name,
        limit,
        page,
        userRequest,
      );
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Actualizar un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async updateGroupById(
    @Args('groupToUpdate', { type: () => GroupUpdateRequest })
    groupToUpdate: GroupUpdateRequest,
    @Context() context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupToUpdate.admin);
      return await this.groupAdapter.updateGroupById(groupToUpdate);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar un grupo por su id',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteGroupById(
    @Args('groupId', { type: () => String })
    groupId: string,
    @Args('groupCreator', { type: () => String })
    groupCreator: string,
    @Context() context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, groupCreator);
      await this.groupAdapter.deleteGroupById(groupId, groupCreator);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => Boolean, {
    nullable: true,
    description: 'Buscar si existe un grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async isThisGroupExist(
    @Args('alias', { type: () => String })
    alias: string,
  ): Promise<boolean> {
    try {
      return await this.groupAdapter.isThisGroupExist(alias);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description:
      'Salir de un grupo - En el caso de que sea el creador debera asignar otro creador',
  })
  @UseGuards(ClerkAuthGuard)
  async exitGroupById(
    @Args('groupId', { type: () => String })
    groupId: string,
    @Args('member', { type: () => String })
    member: string,
    @Context() context: any,
    @Args('creator', { type: () => String, nullable: true })
    creator?: string,
    @Args('newCreator', { type: () => String, nullable: true })
    newCreator?: string,
  ): Promise<any> {
    try {
      if (creator) {
        if (!newCreator) {
          throw new Error('newCreator is required');
        }
      }
      PubliciteAuth.authorize(context, creator ?? member);
      await this.groupAdapter.exitGroupById(
        groupId,
        member,
        creator,
        newCreator,
      );
    } catch (error: any) {
      throw error;
    }
  }
}
