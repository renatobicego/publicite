import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Schema, Types, model } from 'mongoose';

import { ContactSchema } from '../../contact/infrastructure/schema/contact.schema';
import { Visibility } from '../../contact/domain/entity/visibility.enum';
import { applyContactDescriptionFallback } from '../infrastructure/repository/apply-contact-description-fallback';

/**
 * Spec integración del flujo de lectura User + populate(contact)
 * + applyContactDescriptionFallback. Replica el patrón usado por
 * UserRepository.getUserPersonalInformationByUsername / findUserByIdByOwnUser.
 */
describe('Read User con populate(contact) + applyContactDescriptionFallback', () => {
  let mongod: MongoMemoryServer;
  let UserModel: any;
  let ContactModel: any;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    const SimpleUserSchema = new Schema(
      {
        username: { type: String, required: true, unique: true },
        description: { type: String },
        contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
      },
      { collection: 'users-test' },
    );

    UserModel = model('UserTest', SimpleUserSchema);
    ContactModel = model('Contact', ContactSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
    await ContactModel.deleteMany({});
  });

  it('caso A: Contact.description.text gana sobre User.description legacy y se copia top-level', async () => {
    const contact = await ContactModel.create({
      phone: '+5491111',
      description: { text: 'desc del contact', visibility: Visibility.FRIENDS },
    });
    await UserModel.create({
      username: 'user-a',
      description: 'legacy vieja - debería ser pisada',
      contact: contact._id,
    });

    const found: any = await UserModel.findOne({ username: 'user-a' })
      .populate('contact')
      .lean();

    applyContactDescriptionFallback(found);

    expect(found.contact.description).toEqual({
      text: 'desc del contact',
      visibility: Visibility.FRIENDS,
    });
    expect(found.description).toBe('desc del contact');
  });

  it('caso B: User.description legacy + Contact sin description → fallback a {text, visibility:public}', async () => {
    const contact = await ContactModel.create({ phone: '+5492222' });
    await UserModel.create({
      username: 'user-b',
      description: 'descripción legacy desde el user',
      contact: contact._id,
    });

    const found: any = await UserModel.findOne({ username: 'user-b' })
      .populate('contact')
      .lean();

    applyContactDescriptionFallback(found);

    expect(found.contact.description).toEqual({
      text: 'descripción legacy desde el user',
      visibility: 'public',
    });
    expect(found.description).toBe('descripción legacy desde el user');
  });

  it('caso C: ni legacy ni contact.description → no setea nada', async () => {
    const contact = await ContactModel.create({ phone: '+5493333' });
    await UserModel.create({ username: 'user-c', contact: contact._id });

    const found: any = await UserModel.findOne({ username: 'user-c' })
      .populate('contact')
      .lean();

    applyContactDescriptionFallback(found);

    expect(found.contact.description).toBeUndefined();
    expect(found.description).toBeUndefined();
  });

  it('caso D: usuario sin contact poblado → no rompe', async () => {
    await UserModel.create({
      username: 'user-d',
      description: 'algo legacy',
    });

    const found: any = await UserModel.findOne({ username: 'user-d' })
      .populate('contact')
      .lean();

    expect(() => applyContactDescriptionFallback(found)).not.toThrow();
    expect(found.description).toBe('algo legacy');
  });

  it('verifica que el método getContactIdByUsername (patrón findOne+select+lean) devuelve el contact id correcto', async () => {
    const contact = await ContactModel.create({ phone: '+5494444' });
    await UserModel.create({ username: 'user-e', contact: contact._id });

    const result: any = await UserModel.findOne({ username: 'user-e' })
      .select('contact')
      .lean();

    expect(result?.contact).toBeDefined();
    expect(result.contact.toString()).toBe(
      (contact._id as Types.ObjectId).toString(),
    );
  });

  it('si el user no tiene contact asociado, getContactIdByUsername-style devuelve null', async () => {
    await UserModel.create({ username: 'user-f' });

    const result: any = await UserModel.findOne({ username: 'user-f' })
      .select('contact')
      .lean();

    expect(result?.contact).toBeUndefined();
  });
});
