import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

/*
Planes para probar en local con MercadoPago SIMULADO (MP_MOCK=true).
Carga en la base de QA (.env.qa) dos planes mensuales y dos packs con ids
`mock_...` (no existen en MercadoPago: sólo sirven con el modo simulado) y marca
como gratuito el plan "Gratis" si quedó con isFree en false.

  npx ts-node scripts/seed-mp-mock-plans.ts           # carga / actualiza
  npx ts-node scripts/seed-mp-mock-plans.ts --remove  # borra los planes mock_

Nunca corre contra producción: sólo usa .env.qa y se niega si la base es la de prod.
*/

dotenv.config({ path: path.resolve(process.cwd(), '.env.qa') });

const PROD_CLUSTER = 'publicitecluster';
const BASE = { isActive: true, isFree: false, features: ['Plan de prueba (MercadoPago simulado)'] };

const PLANS = [
  {
    ...BASE,
    mpPreapprovalPlanId: 'mock_premium',
    reason: 'Premium (simulado)',
    description: 'Plan mensual de prueba para el modo simulado',
    intervalTime: 30,
    price: 1000,
    isPack: false,
    postsLibresCount: 10,
    postsAgendaCount: 10,
    maxContacts: 100,
    personalBlogsLibreCount: 2,
    personalBlogsAgendaCount: 2,
    groupBlogsCount: 2,
    tokensCount: 1000,
  },
  {
    ...BASE,
    mpPreapprovalPlanId: 'mock_gold',
    reason: 'Gold (simulado)',
    description: 'Plan mensual de prueba para el modo simulado',
    intervalTime: 30,
    price: 5000,
    isPack: false,
    postsLibresCount: 40,
    postsAgendaCount: 40,
    maxContacts: 500,
    personalBlogsLibreCount: 5,
    personalBlogsAgendaCount: 5,
    groupBlogsCount: 5,
    tokensCount: 5000,
  },
  {
    ...BASE,
    mpPreapprovalPlanId: 'mock_pack_posts',
    reason: 'Pack +5 anuncios (simulado)',
    description: 'Pack de prueba para el modo simulado',
    intervalTime: 30,
    price: 500,
    isPack: true,
    postsLibresCount: 5,
    postsAgendaCount: 5,
  },
  {
    ...BASE,
    mpPreapprovalPlanId: 'mock_pack_tokens',
    reason: 'Pack +2000 tokens (simulado)',
    description: 'Pack de prueba para el modo simulado',
    intervalTime: 30,
    price: 700,
    isPack: true,
    tokensCount: 2000,
  },
];

(async () => {
  const uri = process.env.DATABASE_URI;
  if (!uri) throw new Error('Falta DATABASE_URI en .env.qa');
  if (uri.includes(PROD_CLUSTER)) throw new Error('.env.qa apunta a producción: no se toca.');
  await mongoose.connect(uri);
  const plans = mongoose.connection.db!.collection('subscriptionplans');

  if (process.argv.includes('--remove')) {
    const removed = await plans.deleteMany({ mpPreapprovalPlanId: /^mock_/ });
    console.log(`Borrados ${removed.deletedCount} planes mock_.`);
  } else {
    for (const plan of PLANS) {
      await plans.updateOne(
        { mpPreapprovalPlanId: plan.mpPreapprovalPlanId },
        { $set: plan },
        { upsert: true },
      );
      console.log(`OK ${plan.reason} (${plan.mpPreapprovalPlanId}) $${plan.price}`);
    }
    const free = await plans.updateMany(
      { price: 0, isPack: { $ne: true }, isFree: { $ne: true }, reason: /gratis/i },
      { $set: { isFree: true } },
    );
    console.log(`Plan Gratis marcado como gratuito: ${free.modifiedCount}.`);
  }
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
