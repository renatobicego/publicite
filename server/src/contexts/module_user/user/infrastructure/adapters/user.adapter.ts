import { AdAgentProfile, normalizeAdAgentRegistration } from '../../application/functions/adAgent';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from '../../domain/service/user.service.interface';
import { UserFindAllResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import {
  UserBusinessRequest,
  UserPersonRequest,
  UserPreferencesRequest,
  UserRequest,
} from '../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { businessAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.business.request.UPDATE';
import { personalAccountUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/user.personal.request.UPDATE';
import { UserPersonalInformationResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.information.response';
import { UserPreferenceResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.preferences.response';
import { UserFactory } from '../../application/service/user.factory';
import { OnEvent } from '@nestjs/event-emitter';
import { downgrade_plan_contact } from 'src/contexts/module_shared/event-emmiter/events';
import { UserType } from '../../domain/entity/enum/user.enums';
import { IDENTITY_VERIFICATION_SERVICE } from 'src/contexts/module_user/identity/domain/identity.verifier.interface';
import { IdentityVerificationServiceInterface } from 'src/contexts/module_user/identity/application/service/identity.verification.service';

@Injectable()
export class UserAdapter implements UserAdapterInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @Inject(IDENTITY_VERIFICATION_SERVICE)
    private readonly identityVerificationService: IdentityVerificationServiceInterface,
  ) {}
  async getUsersOfAllApp(): Promise<any> {
    try {
      return await this.userService.getUsersOfAllApp();
    } catch (error: any) {
      throw error;
    }
  }

  async createUser(newUserRequest: UserRequest): Promise<any> {
    if (!newUserRequest.userType) {
      throw new Error('UserType missing');
    }

    try {
      // Personas: el DNI se verifica con RENAPER ANTES de crear nada. Si no
      // aprueba, lanza y no se crea la cuenta.
      const isPerson =
        String(newUserRequest.userType).toLowerCase() === UserType.Person;
      const person = newUserRequest as UserPersonRequest & { dni: string };
      const identityVerification = isPerson
        ? await this.identityVerificationService.verifyPersonForRegistration({
            dni: person.dni,
            gender: person.gender,
            birthDate: person.birthDate,
            clerkId: person.clerkId,
          })
        : null;

      // Cuenta Empresa / Agente: valida web, foto, localización, descripción,
      // CUIT e impuestos antes de crear nada.
      const business = newUserRequest as UserBusinessRequest;
      if (business.adAgent) {
        if (String(newUserRequest.userType).toLowerCase() !== UserType.Business) {
          throw new BadRequestException('Sólo una cuenta Empresa puede ser agente.');
        }
        const { adAgent, dni } = normalizeAdAgentRegistration(business as any);
        business.adAgent = adAgent;
        (business as any).dni = dni;
      }

      const factory = UserFactory.getInstance(this.logger);
      const user = factory.createUser(newUserRequest.userType, newUserRequest);
      return await this.userService.createUser(
        user,
        newUserRequest?.contact,
        identityVerification,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteAccount(id: string): Promise<any> {
    try {
      return await this.userService.deleteAccount(id);
    } catch (error: any) {
      throw error;
    }
  }

  @OnEvent(downgrade_plan_contact)
  async downgradeplan(userId: string): Promise<any> {
    try {
      return await this.userService.removeActiveRelationOfUser(userId);
    } catch (error: any) {
      throw error;
    }
  }

  async findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse> {
    try {
      return await this.userService.findAllUsers(user, limit, page);
    } catch (error: any) {
      throw error;
    }
  }

  async findUserById(_id: string, userRequestId: string): Promise<any> {
    try {
      console.log(_id);
      console.log(userRequestId);
      if (_id == userRequestId) {
        this.logger.log(
          'User id and user id from are the same, visiting own profile',
        );
        return await this.userService.findUserByIdByOwnUser(_id);
      }
      this.logger.log('User id and user id from are not the same');
      return await this.userService.findProfileUserByExternalUserById(
        _id,
        userRequestId,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getUserPreferencesByUsername(username: string): Promise<any> {
    try {
      const userPreference =
        await this.userService.getUserPreferencesByUsername(username);
      if (!userPreference)
        return {
          searchPreference: [],
          backgroundColor: undefined,
        };
      const userPreferenceResponse: UserPreferenceResponse = {
        searchPreference: userPreference?.searchPreference ?? [],
        backgroundColor: userPreference?.backgroundColor ?? undefined,
      };
      return userPreferenceResponse;
    } catch (error: any) {
      throw error;
    }
  }

  async getUserPersonalInformationByUsername(
    username: string,
  ): Promise<UserPersonalInformationResponse> {
    try {
      return await this.userService.getUserPersonalInformationByUsername(
        username,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getActiveRelationsOfUser(userRequestId: string): Promise<any> {
    try {
      return await this.userService.getActiveRelationOfUser(userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async removeFriend(
    relationId: string,
    friendRequestId?: string,
  ): Promise<any> {
    try {
      return await this.userService.removeFriend(relationId, friendRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  async setNewActiveUserRelations(
    activeRelations: string[],
    userRequestId: string,
  ): Promise<any> {
    try {
      return await this.userService.setNewActiveUserRelations(
        activeRelations,
        userRequestId,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateCredential(
    userRequestId: string,
    input: { credentialPhotoUrl?: string | null; credentialColor?: string | null },
  ): Promise<{
    credentialPhotoUrl: string | null;
    credentialColor: string | null;
    previousCredentialPhotoUrl: string | null;
  }> {
    return await this.userService.updateCredential(userRequestId, input);
  }

  async getAdAgentProfile(userId: string): Promise<AdAgentProfile | null> {
    return await this.userService.getAdAgentProfile(userId);
  }

  async updateAdAgent(
    userRequestId: string,
    input: { website?: string; taxCondition?: string; taxNote?: string },
  ): Promise<AdAgentProfile> {
    return await this.userService.updateAdAgent(userRequestId, input);
  }

  async getPayoutAccounts(
    userRequestId: string,
  ): Promise<{ label: string | null; aliasCbu: string }[]> {
    return await this.userService.getPayoutAccounts(userRequestId);
  }

  async updatePayoutAccounts(
    userRequestId: string,
    accounts: { label?: string | null; aliasCbu: string }[],
  ): Promise<{ label: string | null; aliasCbu: string }[]> {
    return await this.userService.updatePayoutAccounts(userRequestId, accounts);
  }

  async updateUser(
    username: string,
    req: businessAccountUpdateRequest | personalAccountUpdateRequest,
    type: UserType,
  ): Promise<any> {
    this.logger.log('Start udpate process in the adapter: Update');

    if (type === UserType.Person) {
      return await this.userService.updateUser(username, req, type);
    } else if (UserType.Business) {
      return await this.userService.updateUser(username, req, type);
    } else {
      throw new Error('Invalid user type');
    }
  }

  async updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesRequest,
  ): Promise<any> {
    try {
      this.logger.log(
        'Start process in the adapter: Update preferences - Sending request to the service',
      );
      const userPreferencesUpdated =
        await this.userService.updateUserPreferencesByUsername(
          username,
          userPreference,
        );
      if (!userPreferencesUpdated) return null;
      return userPreferencesUpdated;
    } catch (error: any) {
      throw error;
    }
  }
}
