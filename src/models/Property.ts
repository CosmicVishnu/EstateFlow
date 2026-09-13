import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PropertyStatus = 'available' | 'sold';

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  location: string;
  status: PropertyStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Property price is required'],
      min: [0, 'Price cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Property location is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'sold'],
        message: '{VALUE} is not a valid property status',
      },
      default: 'available',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Property creator is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({ status: 1, price: 1 });
propertySchema.index({ title: 'text', description: 'text', location: 'text' });

export const Property: Model<IProperty> = mongoose.model<IProperty>(
  'Property',
  propertySchema
);
export default Property;
