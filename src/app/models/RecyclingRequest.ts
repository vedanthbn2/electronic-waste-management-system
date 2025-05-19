import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecyclingRequest extends Document {
  userId: string;
  userEmail: string;
  recycleItem: string;
  pickupDate: string;
  pickupTime: string;
  deviceCondition: string;
  status: string;
  assignedReceiver: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverName: string;
  createdAt: Date;
}

const RecyclingRequestSchema: Schema<IRecyclingRequest> = new Schema({
  userId: { type: String, required: true, trim: true },
  userEmail: { type: String, required: true, trim: true },
  recycleItem: { type: String, required: true, trim: true },
  pickupDate: { type: String, required: true, trim: true },
  pickupTime: { type: String, required: true, trim: true },
  deviceCondition: { type: String, required: true, trim: true },
  status: { type: String, required: true, trim: true },
  assignedReceiver: { type: String, required: true, trim: true },
  receiverEmail: { type: String, required: true, trim: true },
  receiverPhone: { type: String, required: true, trim: true },
  receiverName: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const RecyclingRequest: Model<IRecyclingRequest> =
  mongoose.models.RecyclingRequest || mongoose.model<IRecyclingRequest>('RecyclingRequest', RecyclingRequestSchema);

export default RecyclingRequest;
