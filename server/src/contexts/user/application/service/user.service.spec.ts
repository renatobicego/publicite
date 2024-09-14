import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ClientSession, Connection, ObjectId, Types } from 'mongoose';
import { UserService } from './user.service';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { UserPersonDto } from '../../infraestructure/controller/dto/user.person.DTO';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { ContactServiceInterface } from 'src/contexts/contact/domain/service/contact.service.interface';
import { ContactRequestDto } from 'src/contexts/contact/infraestructure/controller/request/contact.request';
import { Gender } from '../../infraestructure/controller/dto/enums.request';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepositoryInterface;
  let contactService: ContactServiceInterface;
  let logger: MyLoggerService;
  let connection: Connection;
  let session: ClientSession;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepositoryInterface',
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: 'ContactServiceInterface',
          useValue: {
            createContact: jest.fn(),
          },
        },
        {
          provide: MyLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: getConnectionToken(),
          useValue: {
            startSession: jest.fn().mockResolvedValue({
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              abortTransaction: jest.fn(),
              endSession: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepositoryInterface>(
      'UserRepositoryInterface',
    );
    contactService = module.get<ContactServiceInterface>(
      'ContactServiceInterface',
    );
    logger = module.get<MyLoggerService>(MyLoggerService);
    connection = module.get<Connection>(getConnectionToken());
    session = await connection.startSession();
  });

  describe('createUser', () => {
    it('should create a personal user successfully', async () => {
      const contact = new ContactRequestDto();
      contact.phone = '15421645';
      contact.instagram = '@Maxi';

      const userPersonDto = new UserPersonDto(
        '5f9d8f5e9d8f5e9d8f5e9d8f', // clerkId
        '222222@gmail.com', // email
        'maxi22222', // username
        'I like to code', // description
        'https://your-bucket.com/profile.jpg', // profilePhotoUrl
        'Argentina', // countryRegion
        true, // isActive
        contact, // contact
        '2022-10-10', // createdTime
        'Renato', // name
        'Bicego', // lastName
        Gender.Male, // gender
        '2024-10-10', // birthDate
      );

      const contactId = new Types.ObjectId();

      jest
        .spyOn(contactService, 'createContact')
        .mockResolvedValue(contactId as any);

      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(userPersonDto as any);

      const result = await userService.createUser(userPersonDto, 0);

      expect(contactService.createContact).toHaveBeenCalledWith(
        userPersonDto.contact,
        { session },
      );

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          clerkId: userPersonDto.clerkId,
          email: userPersonDto.email,
          username: userPersonDto.username,
        }),
        0,
        session,
      );

      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();

      expect(result).toEqual(userPersonDto);
    });

    it('should throw BadRequestException for invalid user type', async () => {
      const invalidDto = {} as UserPersonDto;

      await expect(userService.createUser(invalidDto, 2)).rejects.toThrow(
        BadRequestException,
      );

      expect(session.abortTransaction).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'Error in service. The user has not been created',
      );
    });

    it('should create a business user successfully', async () => {
      const contact = new ContactRequestDto();
      contact.phone = '15421645';
      contact.instagram = '@Maxi';

      const sectorId = new Types.ObjectId();

      const businessAccount = new UserBusinessDto(
        '5f9d8f5e9d8f5e9d8f5e9d8f', // clerkId
        '222222@gmail.com', // email
        'maxi22222', // username
        'I like to code', // description
        'https://your-bucket.com/profile.jpg', // profilePhotoUrl
        'Argentina', // countryRegion
        true, // isActive
        contact,
        '2022-10-10', // createdTime
        sectorId as unknown as ObjectId, // sector (ajustado a ObjectId)
        'Maxi',
        'cvetic',
        'Dustiland',
      );

      const contactId = new Types.ObjectId();
      jest
        .spyOn(contactService, 'createContact')
        .mockResolvedValue(contactId as any);

      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(businessAccount as any);

      const result = await userService.createUser(businessAccount, 1);

      expect(contactService.createContact).toHaveBeenCalledWith(
        businessAccount.contact,
        { session },
      );

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          clerkId: businessAccount.clerkId,
          email: businessAccount.email,
          username: businessAccount.username,
        }),
        1,
        session,
      );

      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();

      expect(result).toEqual(businessAccount);
    });
  });
});
