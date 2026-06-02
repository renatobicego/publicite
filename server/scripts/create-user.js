/* Crea un usuario Person "similar a Renato" pero con la cuenta de Maxi.
   - Clona la forma del contact y de la subscription FREE de Renato (con _id nuevos).
   - NO arrastra relaciones, posts, grupos ni magazines de Renato.
   - Aborta si ya existe el email o el username (índices únicos).
   Uso: node scripts/create-user.js */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.qa') });
const mongoose = require('mongoose');

const NEW = {
  clerkId: 'user_3EYu5jMuZL0VzjTsGk3au3W2bC5',
  email: 'cveticmaxi97@gmail.com',
  username: 'maximan',
  name: 'Maxi',
  lastName: 'Cattaneo Cvetic',
  finder: 'Maxi Cattaneo Cvetic',
  dni: '40123456',
  gender: 'M',
  birthDate: '1997-01-01',
  countryRegion: 'Mendoza, Argentina',
};

async function main() {
  await mongoose.connect(process.env.DATABASE_URI);
  const db = mongoose.connection.db;
  const { ObjectId } = mongoose.mongo;
  console.log('DB activa:', db.databaseName);

  const users = db.collection('users');

  // Guardas de unicidad
  const dupe = await users.findOne({ $or: [{ email: NEW.email }, { username: NEW.username }] });
  if (dupe) {
    console.error('ABORTADO: ya existe un usuario con ese email o username:', {
      _id: dupe._id, email: dupe.email, username: dupe.username,
    });
    await mongoose.disconnect();
    process.exit(1);
  }

  const now = new Date().toISOString().slice(0, 19);
  const userId = new ObjectId();
  const contactId = new ObjectId();
  const subId = new ObjectId();

  // 1) Contact propio (clon de la forma de Renato)
  const contact = {
    _id: contactId,
    phone: '0000000000',
    phoneVisibility: 'contacts',
    instagramVisibility: 'public',
    facebookVisibility: 'public',
    xVisibility: 'public',
    websiteVisibility: 'friends',
    __v: 0,
    description: { text: 'Cuenta de prueba (Maxi)', visibility: 'public' },
    profesion: { label: '', visibility: 'contacts' },
    facebook: '',
    instagram: '',
    links: [],
    website: '',
    x: '',
  };

  // 2) Subscription FREE propia (clon)
  const subscription = {
    _id: subId,
    mpPreapprovalId: 'FREE SUBSCRIPTION',
    payerId: 'FREE SUBSCRIPTION',
    status: 'authorized',
    subscriptionPlan: new ObjectId('67fa89c183b42c825ccc0295'),
    startDate: 'free',
    endDate: 'free',
    external_reference: '--',
    timeOfUpdate: 'FREE SUBSCRIPTION',
    nextPaymentDate: 'FREE SUBSCRIPTION',
    paymentMethodId: 'FREE SUBSCRIPTION',
    cardId: 'FREE SUBSCRIPTION',
    __v: 0,
  };

  // 3) Usuario Person
  const user = {
    _id: userId,
    clerkId: NEW.clerkId,
    email: NEW.email,
    username: NEW.username,
    description: '',
    profilePhotoUrl: '',
    countryRegion: NEW.countryRegion,
    isActive: true,
    dni: NEW.dni,
    addressPrivacy: 'contacts',
    contact: contactId,
    createdTime: now,
    subscriptions: [subId],
    groups: [],
    magazines: [],
    posts: [],
    userRelations: [],
    userType: 'Person',
    name: NEW.name,
    lastName: NEW.lastName,
    finder: NEW.finder,
    userPreferences: { searchPreference: [] },
    notifications: [],
    friendRequests: [],
    activeRelations: [],
    gender: NEW.gender,
    birthDate: NEW.birthDate,
    __v: 0,
  };

  await db.collection('contacts').insertOne(contact);
  await db.collection('subscriptions').insertOne(subscription);
  await users.insertOne(user);

  console.log('\n✅ Usuario creado:');
  console.log(JSON.stringify({ _id: userId, clerkId: NEW.clerkId, email: NEW.email, username: NEW.username, contact: contactId, subscription: subId }, null, 2));

  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
