import { Schema } from 'mongoose';

import NotificationModel, { NotificationDocument } from "./notification.schema";
import { ProductionTicketNotificationFrontData } from '../../domain/entity/production-ticket.events';

interface INotificationProductionTicket extends NotificationDocument {
    frontData: {
        productionTicket: ProductionTicketNotificationFrontData
    }
}


const NotificationProductionTicketSchema = new Schema<INotificationProductionTicket>({
    frontData: {
        productionTicket: {
            audience: { type: String, required: true },
            purchaseId: { type: String, required: true },
            productionId: { type: String, required: true },
            productionTitle: { type: String, required: true },
            targetId: { type: String, default: null },
            targetName: { type: String, default: null },
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'ARS' },
            creatorPayoutAmount: { type: Number, default: null },
            commissionAmount: { type: Number, default: null },
            reason: { type: String, default: null },
        }
    }
})

const NotificationProductionTicketModel = NotificationModel.discriminator('NotificationProductionTicket', NotificationProductionTicketSchema);

export { NotificationProductionTicketModel, INotificationProductionTicket };
