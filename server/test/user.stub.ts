import { ObjectId } from 'mongoose';
import { Gender } from 'src/contexts/user/infraestructure/controller/dto/enums.request';
import { UserBusinessDto } from 'src/contexts/user/infraestructure/controller/dto/user.business.DTO';
import { UserPersonDto } from 'src/contexts/user/infraestructure/controller/dto/user.person.DTO';

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
