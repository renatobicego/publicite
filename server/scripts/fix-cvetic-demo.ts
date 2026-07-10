import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const FREE_PLAN_ID = '67fa89c183b42c825ccc0295'; // "Publicité Gratis." isFree:true
const SUB_ID = '6a42f9511b80289270273bac'; // suscripcion demo de cvetic
const INVOICE_ID = '6a42f9511b80289270273bad'; // invoice demo de cvetic

(async () => {
  await mongoose.connect(process.env.DATABASE_URI!);
  const db = mongoose.connection.db!;

  // 1) Suscripcion de cvetic -> GRATUITA (patron free, con todos los campos no-nullables de GraphQL)
  const subRes = await db.collection('subscriptions').updateOne(
    { _id: new mongoose.Types.ObjectId(SUB_ID) },
    {
      $set: {
        subscriptionPlan: new mongoose.Types.ObjectId(FREE_PLAN_ID),
        status: 'authorized',
        startDate: 'free',
        endDate: 'free',
        nextPaymentDate: 'FREE SUBSCRIPTION',
        timeOfUpdate: 'FREE SUBSCRIPTION',
        paymentMethodId: 'FREE SUBSCRIPTION',
        cardId: 'FREE SUBSCRIPTION',
      },
    },
  );
  console.log('Subscription -> free | matched:', subRes.matchedCount, 'modified:', subRes.modifiedCount);

  // 2) Invoice demo -> agregar campos requeridos por GraphQL (nextRetryDay)
  const invRes = await db.collection('invoices').updateOne(
    { _id: new mongoose.Types.ObjectId(INVOICE_ID) },
    {
      $set: {
        nextRetryDay: 'No data, please check',
        rejectionCode: 'No data, please check',
      },
    },
  );
  console.log('Invoice -> nextRetryDay | matched:', invRes.matchedCount, 'modified:', invRes.modifiedCount);

  // Verificacion
  const sub = await db.collection('subscriptions').findOne({ _id: new mongoose.Types.ObjectId(SUB_ID) });
  const inv = await db.collection('invoices').findOne({ _id: new mongoose.Types.ObjectId(INVOICE_ID) });
  console.log('\n--- Subscription ahora ---');
  console.log(JSON.stringify({ plan: sub?.subscriptionPlan?.toString(), status: sub?.status, startDate: sub?.startDate, nextPaymentDate: sub?.nextPaymentDate, cardId: sub?.cardId }, null, 2));
  console.log('--- Invoice ahora ---');
  console.log(JSON.stringify({ paymentStatus: inv?.paymentStatus, reason: inv?.reason, monto: inv?.transactionAmount, nextRetryDay: inv?.nextRetryDay, retryAttempts: inv?.retryAttempts, timeOfUpdate: inv?.timeOfUpdate, subscriptionId: inv?.subscriptionId?.toString(), paymentId: inv?.paymentId?.toString() }, null, 2));

  // Comparar timeOfUpdate con un invoice REAL para confirmar formato
  const realInv = await db.collection('invoices').findOne({ _id: new mongoose.Types.ObjectId('6887bdf69f6c463815e4e7c5') });
  console.log('\ntimeOfUpdate REAL :', JSON.stringify(realInv?.timeOfUpdate));
  console.log('timeOfUpdate DEMO :', JSON.stringify(inv?.timeOfUpdate));

  await mongoose.disconnect();
})();
