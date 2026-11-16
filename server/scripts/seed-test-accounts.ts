import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

/*
Cuentas de prueba para recorrer regalos, Hacete Amigo, packs y planes en local
(con MercadoPago simulado). Crea cada cuenta en Clerk (instancia de DESARROLLO)
y en la base de QA, igual que el onboarding: usuario Person + contacto +
suscripción gratuita + metadata de Clerk (mongoId, onboardingComplete).

Sin contraseña: se entra con el email y el código. En desarrollo, Clerk acepta
siempre el código 424242 para los emails con "+clerk_test" (no manda mails).

  npx ts-node scripts/seed-test-accounts.ts           # crea / completa
  npx ts-node scripts/seed-test-accounts.ts --remove  # borra todo lo de estas cuentas

Usa .env.qa y se niega si la base es la de producción o si la clave de Clerk no
es de desarrollo (sk_test_).
*/

dotenv.config({ path: path.resolve(process.cwd(), '.env.qa') });

const PROD_CLUSTER = 'publicitecluster';
const CLERK_API = 'https://api.clerk.com/v1';
const TEMPLATE_POST_ID = '6a81d4293de5e1d312cd5a90';

interface TestAccount {
  key: string;
  firstName: string;
  lastName: string;
  withPost: boolean;
  /** mpPreapprovalPlanId de un plan que ya tiene (de seed-mp-mock-plans.ts). */
  plan: string | null;
  note: string;
}

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    key: 'ana',
    firstName: 'Ana',
    lastName: 'Prueba',
    withPost: true,
    plan: null,
    note: 'Sin plan, con un anuncio. Arma el grupo de Hacete Amigo.',
  },
  {
    key: 'bruno',
    firstName: 'Bruno',
    lastName: 'Prueba',
    withPost: true,
    plan: null,
    note: 'Sin plan, con un anuncio. Se suma al grupo y puede pagar.',
  },
  {
    key: 'carla',
    firstName: 'Carla',
    lastName: 'Prueba',
    withPost: false,
    plan: null,
    note: 'Sin plan y sin anuncios: en el grupo aparece "Falta publicar".',
  },
  {
    key: 'dario',
    firstName: 'Dario',
    lastName: 'Prueba',
    withPost: true,
    plan: 'mock_premium',
    note: 'Con Premium (simulado): no puede sumarse a un grupo ni recibir regalos; sí regalar.',
  },
];

/** Para regalar a alguien sin cuenta: se registra después con este email. */
export const EMAIL_WITHOUT_ACCOUNT = 'eva+clerk_test@example.com';

const emailOf = (account: TestAccount) => `${account.key}+clerk_test@example.com`;
const usernameOf = (account: TestAccount) => `${account.key}_prueba`;

function clerkKey(): string {
  const key = process.env.CLERK_SECRET_KEY ?? '';
  if (!key.startsWith('sk_test_')) {
    throw new Error('CLERK_SECRET_KEY de .env.qa no es de desarrollo (sk_test_): no se toca.');
  }
  return key;
}

async function clerk(method: string, pathname: string, body?: unknown): Promise<any> {
  const response = await fetch(`${CLERK_API}${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${clerkKey()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`Clerk ${method} ${pathname}: ${response.status} ${text.slice(0, 300)}`);
  }
  return data;
}

async function findClerkUser(email: string): Promise<any | null> {
  const users = await clerk('GET', `/users?email_address=${encodeURIComponent(email)}`);
  return users?.[0] ?? null;
}

async function seed(db: any) {
  const { ObjectId } = mongoose.mongo;
  const users = db.collection('users');
  const template =
    (await db.collection('posts').findOne({ _id: new ObjectId(TEMPLATE_POST_ID) })) ??
    (await db.collection('posts').findOne({ kind: 'PostGood' }));

  for (const account of TEST_ACCOUNTS) {
    const email = emailOf(account);
    const username = usernameOf(account);
    const fullName = `${account.firstName} ${account.lastName}`;

    // 1) Clerk (sin contraseña: entra con email + código)
    let clerkUser = await findClerkUser(email);
    if (!clerkUser) {
      clerkUser = await clerk('POST', '/users', {
        email_address: [email],
        username,
        first_name: account.firstName,
        last_name: account.lastName,
        skip_password_requirement: true,
      });
    }

    // 2) Base: usuario + contacto, como el onboarding. El plan Gratis no va en
    //    User.subscriptions: es una sola suscripción compartida (external_reference FREE).
    let user = await users.findOne({ $or: [{ clerkId: clerkUser.id }, { email }] });
    if (!user) {
      const now = new Date().toISOString().slice(0, 19);
      const contactText = `Cuenta de prueba (${fullName})`;
      // Si una corrida anterior quedó a medias, se reutiliza su contacto.
      const leftover = await db.collection('contacts').findOne({ 'description.text': contactText });
      const contactId = leftover?._id ?? new ObjectId();
      if (!leftover) {
        await db.collection('contacts').insertOne({
          _id: contactId,
          phone: '0000000000',
          phoneVisibility: 'contacts',
          instagramVisibility: 'public',
          facebookVisibility: 'public',
          xVisibility: 'public',
          websiteVisibility: 'friends',
          description: { text: contactText, visibility: 'public' },
          profesion: { label: '', visibility: 'contacts' },
          facebook: '',
          instagram: '',
          links: [],
          website: '',
          x: '',
          __v: 0,
        });
      }
      const userId = new ObjectId();
      await users.insertOne({
        _id: userId,
        clerkId: clerkUser.id,
        email,
        username,
        description: '',
        profilePhotoUrl: '',
        countryRegion: 'Mendoza, Argentina',
        isActive: true,
        dni: String(Math.floor(10000000 + Math.random() * 89999999)),
        addressPrivacy: 'contacts',
        contact: contactId,
        createdTime: now,
        subscriptions: [],
        groups: [],
        magazines: [],
        posts: [],
        productions: [],
        userRelations: [],
        userType: 'Person',
        name: account.firstName,
        lastName: account.lastName,
        finder: fullName,
        userPreferences: { searchPreference: [] },
        notifications: [],
        friendRequests: [],
        activeRelations: [],
        gender: 'X',
        birthDate: '1995-01-01',
        __v: 0,
      });
      user = await users.findOne({ _id: userId });
    }
    const mongoId = String(user._id);

    // 3) Metadata de Clerk: lo mismo que deja el onboarding
    await clerk('PATCH', `/users/${clerkUser.id}/metadata`, {
      public_metadata: { onboardingComplete: true, userType: 'Person', mongoId },
    });

    // 4) Un anuncio (copia de uno de QA) para quien lo necesita
    if (account.withPost && (user.posts ?? []).length === 0 && template) {
      const postId = new ObjectId();
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      const title = `Anuncio de prueba de ${account.firstName}`;
      const { _id, ...rest } = template;
      await db.collection('posts').insertOne({
        ...rest,
        _id: postId,
        author: user._id,
        title,
        searchTitle: title.toLowerCase(),
        visibility: { post: 'public', socialMedia: 'public' },
        comments: [],
        reactions: [],
        reviews: [],
        recomendations: [],
        isActive: true,
        endDate,
        createAt: typeof template.createAt === 'string' ? new Date().toISOString() : new Date(),
      });
      await users.updateOne({ _id: user._id }, { $addToSet: { posts: postId } });
    }

    // 5) Plan pago simulado para quien ya "tiene plan"
    if (account.plan) {
      const plan = await db.collection('subscriptionplans').findOne({ mpPreapprovalPlanId: account.plan });
      if (!plan) throw new Error(`Falta el plan ${account.plan}: corré antes seed-mp-mock-plans.ts`);
      const has = await db.collection('subscriptions').findOne({
        _id: { $in: user.subscriptions ?? [] },
        subscriptionPlan: plan._id,
        status: 'authorized',
      });
      if (!has) {
        const subId = new ObjectId();
        const next = new Date();
        next.setMonth(next.getMonth() + 1);
        await db.collection('subscriptions').insertOne({
          _id: subId,
          mpPreapprovalId: `mock_pre_seed_${account.key}_${subId}`,
          payerId: '999999',
          status: 'authorized',
          subscriptionPlan: plan._id,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: next.toISOString().slice(0, 10),
          external_reference: mongoId,
          timeOfUpdate: new Date().toISOString(),
          nextPaymentDate: next.toISOString(),
          paymentMethodId: 'visa',
          cardId: '',
          kind: 'mp',
          payerUser: user._id,
          __v: 0,
        });
        await users.updateOne({ _id: user._id }, { $addToSet: { subscriptions: subId } });
      }
    }

    console.log(`OK ${fullName.padEnd(14)} ${email.padEnd(32)} @${username}  — ${account.note}`);
  }
  console.log(`\nSin cuenta (para regalar a un email): ${EMAIL_WITHOUT_ACCOUNT}`);
  console.log('Para entrar: el email y, cuando pida el código, 424242.');
}

async function remove(db: any) {
  const users = db.collection('users');
  for (const account of TEST_ACCOUNTS) {
    const email = emailOf(account);
    const user = await users.findOne({ email });
    if (user) {
      const id = user._id;
      await db.collection('posts').deleteMany({ author: id });
      await db.collection('friendgroups').deleteMany({ 'members.user': id });
      await db.collection('plangifts').deleteMany({ $or: [{ giver: id }, { recipient: id }] });
      // Las compartidas de Hacete Amigo se borran con su grupo; las demás, por dueño.
      await db.collection('subscriptions').deleteMany({
        $or: [{ _id: { $in: user.subscriptions ?? [] }, kind: { $ne: 'friendGroup' } }, { payerUser: id }],
      });
      await db.collection('notifications').deleteMany({ 'backData.userIdTo': String(id) });
      if (user.contact) await db.collection('contacts').deleteOne({ _id: user.contact });
      await users.deleteOne({ _id: id });
    }
    const clerkUser = await findClerkUser(email);
    if (clerkUser) await clerk('DELETE', `/users/${clerkUser.id}`);
    console.log(`Borrada ${email}`);
  }
}

(async () => {
  const uri = process.env.DATABASE_URI;
  if (!uri) throw new Error('Falta DATABASE_URI en .env.qa');
  if (uri.includes(PROD_CLUSTER)) throw new Error('.env.qa apunta a producción: no se toca.');
  clerkKey();
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  if (process.argv.includes('--remove')) await remove(db);
  else await seed(db);
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
