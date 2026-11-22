import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { ClerkAuthGuardOptional } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard.optional';
import { User_AdAgent_Graphql_Model } from '../../../domain/entity/models_graphql/user.adAgent.graphql';
import { AdAgentTaxCondition } from '../../../domain/entity/enum/adAgent.enums';

import { UserAdapterInterface } from '../../../application/adapter/userAdapter.interface';
import { User_Full_Grapql_Model } from '../../../domain/entity/models_graphql/user.full.grapql.model';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { user_active_relation } from '../../../domain/entity/models_graphql/user.activeRelation.graphql';
import { User_Credential_Graphql_Model } from '../../../domain/entity/models_graphql/user.credential.graphql';
import {
  User_PayoutAccount_Graphql_Model,
  User_PayoutAccount_Input,
} from '../../../domain/entity/models_graphql/user.payoutAccount.graphql';

@Resolver()
export class UserResolver {
  constructor(
    @Inject('UserAdapterInterface')
    private readonly userAdapter: UserAdapterInterface,
  ) {}

  @Query(() => User_Full_Grapql_Model, {
    nullable: true,
    description: 'Obtiene un usuario por su nombre de usuario ',
  })
  @UseGuards(ClerkAuthGuard)
  async findUserById(
    @Args('_id', { type: () => String }) _id: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<User_Full_Grapql_Model | null> {
    try {
      const userRequestId = context.req.userRequestId;
      return await this.userAdapter.findUserById(_id, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Remover una relacion de amistad entre dos usuarios',
  })
  @UseGuards(ClerkAuthGuard)
  async removeFriend(
    @Args('relationId', { type: () => String }) relationId: string,
    @Args('friendRequestId', { type: () => String, nullable: true })
    friendRequestId: string,
  ): Promise<any> {
    await this.userAdapter.removeFriend(relationId, friendRequestId);
    return 'Relation successfully deleted';
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Actualiza las relaciones activas del usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async setNewActiveUserRelations(
    @Args('activeRelations', { type: () => [String] })
    activeRelations: string[],
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<string> {
    try {
      const userRequestId = context.req.userRequestId;
      await this.userAdapter.setNewActiveUserRelations(
        activeRelations,
        userRequestId,
      );
      return 'Active relation  successfully updated';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => User_Credential_Graphql_Model, {
    description:
      'Actualiza la foto y el color de la credencial del usuario logueado. Vacío = quitar.',
  })
  @UseGuards(ClerkAuthGuard)
  async updateMyCredential(
    @Args('credentialPhotoUrl', { type: () => String, nullable: true })
    credentialPhotoUrl: string | null,
    @Args('credentialColor', { type: () => String, nullable: true })
    credentialColor: string | null,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<User_Credential_Graphql_Model> {
    const userRequestId = context.req.userRequestId;
    return await this.userAdapter.updateCredential(userRequestId, {
      credentialPhotoUrl,
      credentialColor,
    });
  }

  @Query(() => User_AdAgent_Graphql_Model, {
    nullable: true,
    description:
      'Perfil de una cuenta Empresa / Agente (web e impuestos). null si no es agente.',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async getAdAgentProfile(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<User_AdAgent_Graphql_Model | null> {
    return await this.userAdapter.getAdAgentProfile(userId);
  }

  @Mutation(() => User_AdAgent_Graphql_Model, {
    description:
      'Edita el sitio web y los impuestos de la cuenta Empresa / Agente logueada.',
  })
  @UseGuards(ClerkAuthGuard)
  async updateMyAdAgentProfile(
    @Args('website', { type: () => String }) website: string,
    @Args('taxCondition', { type: () => AdAgentTaxCondition })
    taxCondition: AdAgentTaxCondition,
    @Args('taxNote', { type: () => String }) taxNote: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<User_AdAgent_Graphql_Model> {
    return await this.userAdapter.updateAdAgent(context.req.userRequestId, {
      website,
      taxCondition,
      taxNote,
    });
  }

  @Query(() => [User_PayoutAccount_Graphql_Model], {
    description:
      'Cuentas de cobro (alias o CBU/CVU) guardadas por el usuario logueado.',
  })
  @UseGuards(ClerkAuthGuard)
  async getMyPayoutAccounts(
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<User_PayoutAccount_Graphql_Model[]> {
    return await this.userAdapter.getPayoutAccounts(context.req.userRequestId);
  }

  @Mutation(() => [User_PayoutAccount_Graphql_Model], {
    description:
      'Reemplaza las cuentas de cobro del usuario logueado. La primera es la predeterminada.',
  })
  @UseGuards(ClerkAuthGuard)
  async updateMyPayoutAccounts(
    @Args('accounts', { type: () => [User_PayoutAccount_Input] })
    accounts: User_PayoutAccount_Input[],
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<User_PayoutAccount_Graphql_Model[]> {
    return await this.userAdapter.updatePayoutAccounts(
      context.req.userRequestId,
      accounts,
    );
  }

  @Query(() => [user_active_relation], {
    nullable: true,
    description: 'Obtiene las relaciones activas del usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async getActiveRelationsOfUser(
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<user_active_relation[] | null> {
    try {
      const userRequestId = context.req.userRequestId;
      const activeRelations =
        (await this.userAdapter.getActiveRelationsOfUser(userRequestId)) ?? [];
      return activeRelations;
    } catch (error: any) {
      throw error;
    }
  }
}
