import mongoose, { Schema, Document, models } from 'mongoose';

// Define the interface for a Service document
export interface IService extends Document {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Define the Mongoose Schema for Services
const ServiceSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Service description cannot exceed 500 characters'],
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    validate: {
      validator: function(v: number) {
        // Optional: Ensure duration is a reasonable number (e.g., not excessively large)
        return v <= 1440; // e.g., maximum 24 hours
      },
      message: (props: { value: number }) => `${props.value} minutes is too long for a service duration.`,
    },
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    // You might want to add a validation for decimal places if needed, e.g., for currency
    // validate: {
    //   validator: function(v: number) {
    //     return /^\d+(\.\d{1,2})?$/.test(v.toString());
    //   },
    //   message: (props: { value: number }) => `${props.value} is not a valid price format. Use up to two decimal places.`,
    // },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Mongoose's default behavior for updatedAt is often tied to a timestamp plugin or manual updates
  },
}, {
  timestamps: true // This option automatically adds createdAt and updatedAt fields
});

// If the model already exists, use it; otherwise, create a new model.
// This is common practice in Next.js with API routes to prevent Mongoose overwriting issues.
export default models.Service
  ? mongoose.model<IService>('Service')
  : mongoose.model<IService>('Service', ServiceSchema);