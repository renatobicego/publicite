import { AdAgentData } from '../../application/functions/adAgent';
import { ObjectId } from 'mongoose';
import { User } from './user.entity';
import { UserType } from './enum/user.enums';

export interface UB_update {
  businessName?: string;
  sector?: ObjectId;
  countryRegion?: string;
  description?: string;
}

export class UserBusiness extends User {
  private businessName: string;
  private sector: ObjectId;
  private adAgent: AdAgentData | null;

  constructor(
    user: User,
    sector: ObjectId,
    businessName: string,
    adAgent?: AdAgentData | null,
  ) {
    super(
      user.getClerkId,
      user.getEmail,
      user.getUsername,
      user.getDescription,
      user.getProfilePhotoUrl,
      user.getCountryRegion,
      user.getIsActive,
      user.getDni,
      user.getaddressPrivacy,
      user.getName,
      user.getLastName,
      user.getUserType ?? UserType.Business,
      user.getContact,
      user.getCreatedTime ?? '',
      user.getSubscriptions ?? [],
      user.getGroups ?? [],
      user.getMagazines ?? [],
      user.getBoard ?? undefined,
      user.getPost ?? [],
      user.getUserRelations ?? [],
      user.getUserPreferences ?? {
        searchPreference: [],
        backgroundColor: undefined,
      },
      user.getId,
      user.getNotifications,
      user.getFriendRequests,
      user.getActiveRelations,
      user.getProductions,
      user.getCredentialId,
    );
    this.sector = sector;
    this.businessName = businessName;
    this.adAgent = adAgent ?? null;
  }

  get getAdAgent(): AdAgentData | null {
    return this.adAgent;
  }

  get getSector(): ObjectId {
    return this.sector;
  }

  get getBusinessName(): string {
    return this.businessName;
  }
}
