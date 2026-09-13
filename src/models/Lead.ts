import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'closed';

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  status: LeadStatus;
  property?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Lead name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Lead phone number is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'qualified', 'lost', 'closed'],
        message: '{VALUE} is not a valid lead status',
      },
      default: 'new',
      index: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ status: 1, createdAt: 1 });

export const Lead: Model<ILead> = mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
