import mongoose, { model, Schema } from 'mongoose';


export const ErrorSchema = new Schema({
    user: { type: String, required: true },
    code: { type: String, required: true },
    message: { type: String, required: true },
    result: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    event: { type: String }
});

export interface ErrorDocument extends Document {
    user: string;
    code: string;
    message: string;
    result: any;
    timestamp: Date;
    event: string
}


const ErrorModel = model<ErrorDocument>('Error', ErrorSchema);
export default ErrorModel;