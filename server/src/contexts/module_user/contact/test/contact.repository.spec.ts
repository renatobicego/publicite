import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';

import {
  ContactSchema,
  ContactDocument,
} from '../infrastructure/schema/contact.schema';
import { ContactRepository } from '../infrastructure/repository/contact.repository';
import { Contact } from '../domain/entity/contact.entity';
import { Visibility } from '../domain/entity/visibility.enum';

describe('ContactRepository (integration con mongodb-memory-server)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: ContactRepository;
  let contactModel: Model<ContactDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: 'Contact', schema: ContactSchema }]),
      ],
      providers: [ContactRepository],
    }).compile();

    repository = module.get<ContactRepository>(ContactRepository);
    contactModel = module.get<Model<ContactDocument>>(getModelToken('Contact'));
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await contactModel.deleteMany({});
  });

  describe('createContact', () => {
    it('persiste todos los nuevos campos con sus visibilities', async () => {
      const contact = new Contact({
        phone: '+5491111111111',
        phoneVisibility: Visibility.PUBLIC,
        instagram: '@maxi',
        instagramVisibility: Visibility.FRIENDS,
        facebook: 'maxi.fb',
        facebookVisibility: Visibility.CONTACTS,
        x: '@maxi_x',
        xVisibility: Visibility.REGISTERED,
        website: 'https://maxi.dev',
        websiteVisibility: Visibility.PUBLIC,
        profesion: { label: 'Dev', visibility: Visibility.PUBLIC },
        curriculum: {
          ref: 'https://cv.com/maxi.pdf',
          visibility: Visibility.CONTACTS,
        },
        description: {
          text: 'Soy maxi, un programador.',
          visibility: Visibility.FRIENDS,
        },
        links: [
          {
            url: 'https://github.com/maxi',
            label: 'GitHub',
            visibility: Visibility.PUBLIC,
          },
          {
            url: 'https://linkedin.com/in/maxi',
            label: 'LinkedIn',
            visibility: Visibility.REGISTERED,
          },
        ],
      });

      const id = await repository.createContact(contact, undefined);
      expect(id).toBeDefined();
      expect(id).toBeInstanceOf(Types.ObjectId);

      const saved = await contactModel.findById(id).lean();
      expect(saved).toBeDefined();
      expect(saved!.phone).toBe('+5491111111111');
      expect(saved!.phoneVisibility).toBe(Visibility.PUBLIC);
      expect(saved!.instagramVisibility).toBe(Visibility.FRIENDS);
      expect(saved!.facebookVisibility).toBe(Visibility.CONTACTS);
      expect(saved!.xVisibility).toBe(Visibility.REGISTERED);
      expect(saved!.websiteVisibility).toBe(Visibility.PUBLIC);

      expect(saved!.profesion).toEqual({
        label: 'Dev',
        visibility: Visibility.PUBLIC,
      });
      expect(saved!.curriculum).toEqual({
        ref: 'https://cv.com/maxi.pdf',
        visibility: Visibility.CONTACTS,
      });
      expect(saved!.description).toEqual({
        text: 'Soy maxi, un programador.',
        visibility: Visibility.FRIENDS,
      });
      expect(saved!.links).toHaveLength(2);
      expect(saved!.links![0]).toEqual({
        url: 'https://github.com/maxi',
        label: 'GitHub',
        visibility: Visibility.PUBLIC,
      });
    });

    it('aplica default Visibility.PUBLIC en *Visibility cuando no se pasa', async () => {
      const contact = new Contact({
        phone: '+5491111111111',
        instagram: '@maxi',
      });

      const id = await repository.createContact(contact, undefined);
      const saved = await contactModel.findById(id).lean();

      expect(saved!.phoneVisibility).toBe(Visibility.PUBLIC);
      expect(saved!.instagramVisibility).toBe(Visibility.PUBLIC);
      expect(saved!.facebookVisibility).toBe(Visibility.PUBLIC);
      expect(saved!.xVisibility).toBe(Visibility.PUBLIC);
      expect(saved!.websiteVisibility).toBe(Visibility.PUBLIC);
    });

    it('si no se pasa profesion/curriculum/description/links, se guarda sin esos sub-docs', async () => {
      const contact = new Contact({ phone: '+5491111111111' });
      const id = await repository.createContact(contact, undefined);
      const saved = await contactModel.findById(id).lean();

      expect(saved!.profesion).toBeUndefined();
      expect(saved!.curriculum).toBeUndefined();
      expect(saved!.description).toBeUndefined();
      expect(saved!.links).toBeUndefined();
    });

    it('persiste description con visibility "topfriends" (todos los enums son válidos)', async () => {
      const contact = new Contact({
        description: {
          text: 'Solo top friends',
          visibility: Visibility.TOPFRIENDS,
        },
      });
      const id = await repository.createContact(contact, undefined);
      const saved = await contactModel.findById(id).lean();
      expect(saved!.description).toEqual({
        text: 'Solo top friends',
        visibility: Visibility.TOPFRIENDS,
      });
    });
  });

  describe('updateContact', () => {
    let existingId: string;

    beforeEach(async () => {
      const created = await contactModel.create({
        phone: '+5491111111111',
        phoneVisibility: Visibility.PUBLIC,
        instagram: '@old',
        instagramVisibility: Visibility.PUBLIC,
        description: { text: 'desc vieja', visibility: Visibility.PUBLIC },
        profesion: { label: 'Vieja prof', visibility: Visibility.PUBLIC },
      });
      existingId = (created._id as Types.ObjectId).toString();
    });

    it('actualiza solo los campos enviados, preservando los demás', async () => {
      const result = await repository.updateContact(existingId, {
        instagram: '@nuevo',
        instagramVisibility: Visibility.FRIENDS,
      });
      expect(result).toBe('Contact updated');

      const saved = await contactModel.findById(existingId).lean();
      expect(saved!.instagram).toBe('@nuevo');
      expect(saved!.instagramVisibility).toBe(Visibility.FRIENDS);
      expect(saved!.phone).toBe('+5491111111111');
      expect(saved!.description).toEqual({
        text: 'desc vieja',
        visibility: Visibility.PUBLIC,
      });
    });

    it('actualiza description (sub-doc completo) sin tocar el resto', async () => {
      await repository.updateContact(existingId, {
        description: {
          text: 'descripción nueva',
          visibility: Visibility.FRIENDS,
        },
      });

      const saved = await contactModel.findById(existingId).lean();
      expect(saved!.description).toEqual({
        text: 'descripción nueva',
        visibility: Visibility.FRIENDS,
      });
      expect(saved!.profesion).toEqual({
        label: 'Vieja prof',
        visibility: Visibility.PUBLIC,
      });
      expect(saved!.phone).toBe('+5491111111111');
    });

    it('puede agregar links donde antes no había', async () => {
      await repository.updateContact(existingId, {
        links: [
          {
            url: 'https://x.com/maxi',
            label: 'X',
            visibility: Visibility.PUBLIC,
          },
        ],
      });

      const saved = await contactModel.findById(existingId).lean();
      expect(saved!.links).toHaveLength(1);
      expect(saved!.links![0].label).toBe('X');
    });

    it('si el contactId no existe devuelve mensaje "No changes..."', async () => {
      const fakeId = new Types.ObjectId().toString();
      const result = await repository.updateContact(fakeId, {
        phone: '+5499999999999',
      });
      expect(result).toContain('No changes');
    });
  });
});
