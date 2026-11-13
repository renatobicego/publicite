import { Schema } from 'mongoose';

import NotificationModel, { NotificationDocument } from "./notification.schema";
import { PlanNotificationFrontData } from '../../domain/entity/plan.events';

interface INotificationPlan extends NotificationDocument {
    frontData: {
        plan: PlanNotificationFrontData
    }
}

// Regalos de planes y Hacete Amigo (ver plan.events.ts).
const NotificationPlanSchema = new Schema<INotificationPlan>({
    frontData: {
        plan: {
            kind: { type: String, required: true },
            entityId: { type: String, required: true },
            actorName: { type: String, default: null },
            planReason: { type: String, default: null },
            months: { type: Number, default: null },
            reason: { type: String, default: null },
            isPayer: { type: Boolean, default: null },
        }
    }
})

const NotificationPlanModel = NotificationModel.discriminator('NotificationPlan', NotificationPlanSchema);

export { NotificationPlanModel, INotificationPlan };
