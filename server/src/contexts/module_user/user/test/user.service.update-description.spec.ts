import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';

import { UserService } from '../application/service/user.service';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserType } from '../domain/entity/enum/user.enums';
import { Visibility } from '../../contact/domain/entity/visibility.enum';

describe('UserService.updateUser - ruteo de description', () => {
  let service: UserService;
  let userRepoMock: any;
  let contactServiceMock: any;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(async () => {
    userRepoMock = {
      getContactIdByUsername: jest.fn(),
      update: jest.fn().mockResolvedValue({ ok: true }),
    };
    contactServiceMock = {
      updateContact: jest.fn().mockResolvedValue(undefined),
      createContact: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepositoryInterface', useValue: userRepoMock },
        { provide: 'ContactServiceInterface', useValue: contactServiceMock },
        MyLoggerService,
        { provide: getConnectionToken(), useValue: {} },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    const logger = module.get<MyLoggerService>(MyLoggerService);
    loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    jest.spyOn(logger, 'log').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  it('si description viene en el payload, llama a contactService.updateContact con el contactId resuelto', async () => {
    userRepoMock.getContactIdByUsername.mockResolvedValue('contact-id-123');

    await service.updateUser(
      'maxi',
      {
        name: 'Maxi',
        description: { text: 'nueva desc', visibility: Visibility.FRIENDS },
      } as any,
      UserType.Person,
    );

    expect(userRepoMock.getContactIdByUsername).toHaveBeenCalledWith('maxi');
    expect(contactServiceMock.updateContact).toHaveBeenCalledWith(
      'contact-id-123',
      {
        description: { text: 'nueva desc', visibility: Visibility.FRIENDS },
      },
    );
  });

  it('NO incluye description en el payload que va a userRepository.update', async () => {
    userRepoMock.getContactIdByUsername.mockResolvedValue('contact-id-123');

    await service.updateUser(
      'maxi',
      {
        name: 'Maxi',
        description: { text: 'nueva', visibility: Visibility.PUBLIC },
      } as any,
      UserType.Person,
    );

    expect(userRepoMock.update).toHaveBeenCalledTimes(1);
    const updatePayload = userRepoMock.update.mock.calls[0][1];
    expect(updatePayload).not.toHaveProperty('description');
    expect(updatePayload).toHaveProperty('name', 'Maxi');
  });

  it('si description NO viene, no se llama ni a getContactIdByUsername ni a contactService', async () => {
    await service.updateUser(
      'maxi',
      { name: 'Maxi' } as any,
      UserType.Person,
    );

    expect(userRepoMock.getContactIdByUsername).not.toHaveBeenCalled();
    expect(contactServiceMock.updateContact).not.toHaveBeenCalled();
    expect(userRepoMock.update).toHaveBeenCalled();
  });

  it('si user no tiene contactId asociado, loguea warn y NO llama a contactService.updateContact', async () => {
    userRepoMock.getContactIdByUsername.mockResolvedValue(null);

    await service.updateUser(
      'maxi',
      {
        name: 'Maxi',
        description: { text: 'algo', visibility: Visibility.PUBLIC },
      } as any,
      UserType.Person,
    );

    expect(contactServiceMock.updateContact).not.toHaveBeenCalled();
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('skipping description update'),
    );
    expect(userRepoMock.update).toHaveBeenCalled();
  });

  it('funciona igual para UserType.Business', async () => {
    userRepoMock.getContactIdByUsername.mockResolvedValue('contact-id-999');

    await service.updateUser(
      'business-x',
      {
        name: 'Negocio',
        description: { text: 'desc business', visibility: Visibility.PUBLIC },
      } as any,
      UserType.Business,
    );

    expect(contactServiceMock.updateContact).toHaveBeenCalledWith(
      'contact-id-999',
      {
        description: { text: 'desc business', visibility: Visibility.PUBLIC },
      },
    );
    expect(userRepoMock.update).toHaveBeenCalledWith(
      'business-x',
      expect.not.objectContaining({ description: expect.anything() }),
      UserType.Business,
    );
  });

  it('si description = null (cliente quiere limpiar), igual rutea a contactService', async () => {
    userRepoMock.getContactIdByUsername.mockResolvedValue('contact-id-123');

    await service.updateUser(
      'maxi',
      { description: null } as any,
      UserType.Person,
    );

    expect(contactServiceMock.updateContact).toHaveBeenCalledWith(
      'contact-id-123',
      { description: null },
    );
  });
});
