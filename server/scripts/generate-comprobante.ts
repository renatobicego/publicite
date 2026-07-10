import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { MpInvoiceService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-invoice.service';
import { getTodayDateTime } from 'src/contexts/module_shared/utils/functions/getTodayDateTime';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Instancia del service real solo para usar la generación de PDF (generatePdf no usa deps).
const service: any = new MpInvoiceService(
  { log() {}, error() {}, warn() {} } as any,
  null as any,
  null as any,
  null as any,
);

const OUT_DIR = path.resolve(process.cwd(), 'comprobantes-out');

async function buildPdf(invoice: any, subscription: any, payment: any, fileName: string) {
  invoice.subscriptionId = subscription ?? {};
  const pdf: Buffer = await service.generatePdf(invoice, payment ?? {});
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const full = path.join(OUT_DIR, fileName);
  fs.writeFileSync(full, pdf);
  console.log('PDF generado: ' + full + ' (' + pdf.length + ' bytes)');
  return full;
}

(async () => {
  const uri = process.env.DATABASE_URI;
  if (!uri) { console.error('No DATABASE_URI'); process.exit(1); }
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  console.log('DB:', db.databaseName);

  const generated: string[] = [];

  // ============================================================
  // PARTE A — Verificar con un comprobante REAL ya existente
  // ============================================================
  const realInvoiceId = '6887bdf69f6c463815e4e7c5'; // pago real de miguel (Gold)
  const realInv = await db.collection('invoices').findOne({ _id: new mongoose.Types.ObjectId(realInvoiceId) });
  if (realInv) {
    const realPay = realInv.paymentId
      ? await db.collection('payments').findOne({ _id: realInv.paymentId })
      : null;
    const realSub = realInv.subscriptionId
      ? await db.collection('subscriptions').findOne({ _id: realInv.subscriptionId })
      : null;
    const f = await buildPdf(realInv, realSub, realPay, 'comprobante-real-miguel.pdf');
    generated.push(f);
  } else {
    console.log('No se encontró el invoice real ' + realInvoiceId);
  }

  // ============================================================
  // PARTE B — Crear comprobante DEMO para cvetic
  // ============================================================
  const cveticId = '67f9630ddcd2de495602d54d';
  const cvetic = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(cveticId) });
  if (!cvetic) { console.error('Usuario cvetic no encontrado'); process.exit(1); }

  // ¿Ya existe un invoice demo para cvetic? Reusar para no duplicar.
  let demoInvoice = await db.collection('invoices').findOne({
    external_reference: cveticId,
    invoice_id: { $regex: '^DEMO-' },
  });

  const goldPlanId = new mongoose.Types.ObjectId('67f9985d8cb8a8d3cc5aadee'); // Publicité Gold 12500
  const nowStr = getTodayDateTime();

  if (!demoInvoice) {
    const preapprovalId = 'DEMO-PREAPPROVAL-CVETIC';
    const payerId = '111222333';

    // 1) Payment aprobado
    const paymentRes = await db.collection('payments').insertOne({
      mpPaymentId: 'DEMO-0000001',
      descriptionOfPayment: 'Suscripción Publicité Gold (DEMO)',
      mpPreapprovalId: preapprovalId,
      payerId: payerId,
      payerEmail: cvetic.email,
      paymentTypeId: 'account_money',
      paymentMethodId: 'account_money',
      transactionAmount: 12500,
      dateApproved: nowStr,
      external_reference: cveticId,
      status_detail: 'accredited',
      timeOfUpdate: nowStr,
      status: 'approved',
    });

    // 2) Subscription
    const subRes = await db.collection('subscriptions').insertOne({
      mpPreapprovalId: preapprovalId,
      payerId: payerId,
      status: 'authorized',
      subscriptionPlan: goldPlanId,
      startDate: nowStr,
      endDate: nowStr,
      external_reference: cveticId,
      timeOfUpdate: nowStr,
      nextPaymentDate: nowStr,
      paymentMethodId: 'account_money',
    });

    // 3) Invoice aprobado
    const invRes = await db.collection('invoices').insertOne({
      paymentId: paymentRes.insertedId,
      subscriptionId: subRes.insertedId,
      status: 'authorized',
      paymentStatus: 'approved',
      preapprovalId: preapprovalId,
      external_reference: cveticId,
      timeOfUpdate: nowStr,
      invoice_id: 'DEMO-' + Date.now(),
      transactionAmount: 12500,
      currencyId: 'ARS',
      reason: 'Publicité Gold',
      retryAttempts: 0,
    });

    demoInvoice = await db.collection('invoices').findOne({ _id: invRes.insertedId });
    console.log('Registros DEMO creados para cvetic.');
  } else {
    console.log('Ya existía un invoice DEMO para cvetic, se reutiliza.');
  }

  const demoPay = await db.collection('payments').findOne({ _id: demoInvoice!.paymentId });
  const demoSub = await db.collection('subscriptions').findOne({ _id: demoInvoice!.subscriptionId });
  const f2 = await buildPdf(demoInvoice, demoSub, demoPay, 'comprobante-demo-cvetic.pdf');
  generated.push(f2);

  console.log('\n=== RESUMEN ===');
  console.log('Usuario cvetic _id (external_reference): ' + cveticId);
  console.log('Invoice DEMO _id (para la URL): ' + demoInvoice!._id);
  console.log('URL endpoint: GET /invoices/' + demoInvoice!._id + '/ticket');
  console.log('PDFs generados:');
  generated.forEach((g) => console.log('  - ' + g));

  await mongoose.disconnect();
})();
