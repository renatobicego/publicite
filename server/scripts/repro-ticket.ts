import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { InvoiceSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/invoice.schema';
import { PaymentSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/payment.schema';
import { SubscriptionSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema';
import { SubscriptionPlanSchema } from 'src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema';
import { MpInvoiceRepository } from 'src/contexts/module_webhook/mercadopago/infastructure/repository/mp-invoice.repository';
import { MpInvoiceService } from 'src/contexts/module_webhook/mercadopago/application/service/mp-invoice.service';
import { UserModel } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const INVOICE_ID = '6a42f9511b80289270273bad';
const CVETIC_ID = '67f9630ddcd2de495602d54d';

(async () => {
  await mongoose.connect(process.env.DATABASE_URI!);

  // Registrar modelos como lo hace Nest (forFeature)
  const Invoice = mongoose.models['Invoice'] || mongoose.model('Invoice', InvoiceSchema);
  mongoose.models['Payment'] || mongoose.model('Payment', PaymentSchema);
  mongoose.models['Subscription'] || mongoose.model('Subscription', SubscriptionSchema as any);
  mongoose.models['SubscriptionPlan'] || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema as any);

  const logger: any = { log: (m: any) => console.log('[log]', m), error: (m: any, e?: any) => console.log('[error]', m, e?.message ?? e), warn: (m: any) => console.log('[warn]', m) };

  const User = mongoose.models['User'] || UserModel;

  const repo = new MpInvoiceRepository(Invoice as any, User as any, logger);

  // paymentService stub: si hiciera falta el fallback, lo veremos
  const paymentServiceStub: any = {
    findApprovedPaymentByReference: async (...args: any[]) => {
      console.log('[paymentService.findApprovedPaymentByReference] llamado con', args);
      return null;
    },
  };

  const service = new MpInvoiceService(logger, repo as any, null as any, paymentServiceStub);

  console.log('=== Probando generateInvoiceTicket (camino real del backend) ===');
  try {
    const pdf = await service.generateInvoiceTicket(INVOICE_ID, CVETIC_ID);
    console.log('OK ✅ PDF generado, bytes:', pdf.length);
  } catch (e: any) {
    console.log('FALLÓ ❌');
    console.log('  name   :', e?.name);
    console.log('  status :', e?.status);
    console.log('  message:', e?.message);
    console.log('  stack  :', e?.stack?.split('\n').slice(0, 4).join('\n'));
  }

  await mongoose.disconnect();
})();
