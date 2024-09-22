import { ObjectId, Types } from 'mongoose';
import { Gender } from 'src/contexts/user/domain/entity/enum/enums.request';

export const userSub = (): UserPersonDto => {
  return {
    clerkId: '5f9d8f5e9d8f5e9d8f5e9d8f',
    email: '222222@gmail.com',
    username: 'maxi22222',
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
    name: 'Renato',
    lastName: 'Bicego',
    gender: Gender.Male,
    birthDate: '2024-10-10',
  };
};

export const userSubBusiness = (): UserBusinessDto => {
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
    sector: '66d2177dda11f93d8647cf3a' as unknown as ObjectId,
    name: 'Maxi',
    lastName: 'Cvetic',
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
    board: [],
    post: [],
    userRelations: [],
    userType: 'Personal',
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
