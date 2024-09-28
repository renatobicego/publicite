import { ObjectId, Types } from 'mongoose';
import {
  UserPersonRequest,
  UserBusinessRequest,
} from 'src/contexts/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import {
  Gender,
  UserType,
} from 'src/contexts/user/domain/entity/enum/user.enums';

export const userSub = (): UserPersonRequest => {
  return {
    clerkId: '5f9d8f5e9d8f5e9d8f5e9d8f',
    email: 'asdasdaaaaaaasd@gmail.com',
    username: 'aaaaa',
    description: 'I like to code',
    profilePhotoUrl: 'https://your-bucket.com/profile.jpg',
    countryRegion: 'Argentina',
    isActive: true,
    name: 'Renato',
    lastName: 'Bicego',
    contact: {
      phone: '2151651',
      instagram: '@asd',
      facebook: '',
      x: '',
      website: '',
    },
    createdTime: '2024-10-10T00:00:00Z',
    userType: UserType.Person,
    userPreferences: {
      searchPreference: ['66e608531f76fc4dda965554' as unknown as ObjectId],
      backgroundColor: 12,
    },
    gender: Gender.Male,
    birthDate: '2024-10-10',
  };
};

export const userSubBusiness = (): UserBusinessRequest => {
  return {
    clerkId: '5f9d8f5e9d8f5e9d8f5e9d8f',
    email: 'juan@gmail.com',
    username: 'juancho',
    description: 'I like to code',
    profilePhotoUrl: 'https://your-bucket.com/profile.jpg',
    countryRegion: 'Argentina',
    isActive: true,
    contact: {
      phone: '2151651',
      instagram: '@asd',
      facebook: '',
      x: '',
      website: '',
    },
    createdTime: '2024-10-10T00:00:00Z',
    name: 'Maxi',
    lastName: 'Cvetic',
    userType: UserType.Business,
    userPreferences: {
      searchPreference: [],
      backgroundColor: 12,
    },
    sector: '66d2177dda11f93d8647cf3a' as unknown as ObjectId,
    businessName: 'Dutsiland',
  };
};

export const userSub_id = (): any => {
  return {
    _id: new Types.ObjectId('66e608531f76fc4dda965554'),
    clerkId: '5f9d8f5e9d8f5e9d8f5e9d8f',
    email: '222222@gmail.com',
    username: 'maxi22222',
    description: 'I like to code',
    profilePhotoUrl: 'https://your-bucket.com/profile.jpg',
    countryRegion: 'Argentina',
    isActive: true,
    contact: '66e608531f76fc4dda965551',
    createdTime: '2024-10-10T00:00:00Z',
    subscriptions: [],
    groups: [],
    magazines: [],
    board: undefined,
    post: [],
    userRelations: [],
    userType: 'Person',
    name: 'Renato',
    lastName: 'Bicego',
    userPreferences: {
      searchPreference: [],
      backgroundColor: '',
    },
    kind: 'UserPerson',
    gender: 'M',
    birthDate: '2024-10-10',
    __v: 0,
  };
};
