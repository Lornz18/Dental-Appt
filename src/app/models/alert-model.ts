import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface representing an Alert document in MongoDB.
 */
export interface IAlert extends Document {
    message: string;
    type: 'new-appointment' | 'cancellation' | 'confirmation' | 'system-info' | 'general';
    read: boolean;
    recipient?: mongoose.Types.ObjectId; // Optional: ID of the user this alert is for (e.g., a specific admin or patient)
    link?: string; // Optional: A URL to navigate to when the alert is clicked (e.g., /admin/appointments/some-id)
    createdAt: Date;
    updatedAt: Date;
}

const AlertSchema: Schema = new Schema({
    /**
     * The main content of the alert message.
     * e.g., "New pending appointment from John Doe."
     */
    message: {
        type: String,
        required: [true, 'Alert message is required.'],
        trim: true,
        maxlength: [500, 'Alert message cannot exceed 500 characters.']
    },

    /**
     * The category of the alert. Useful for filtering and displaying different icons/colors in the UI.
     */
    type: {
        type: String,
        enum: {
            values: ['new-appointment', 'cancellation', 'confirmation', 'system-info', 'general'],
            message: '{VALUE} is not a valid alert type.'
        },
        required: [true, 'Alert type is required.']
    },

    /**
     * The read status of the alert. Defaults to false.
     * The UI can update this to true when an admin views the notification.
     */
    read: {
        type: Boolean,
        default: false,
    },

    /**
     * (Optional but Recommended for Scaling)
     * A reference to the User model. This allows you to target alerts to specific users.
     * If all alerts are global for all admins, this can be omitted.
     */
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assumes you have a 'User' model for admins/patients
    },

    /**
     * (Optional) An action link associated with the alert.
     * Makes notifications more interactive.
     * e.g., "/admin/dashboard?highlight=appointment_123"
     */
    link: {
        type: String,
        trim: true,
    },
}, {
    /**
     * Automatically adds `createdAt` and `updatedAt` fields, managed by Mongoose.
     */
    timestamps: true
});

/**
 * This pattern prevents Mongoose from redefining the model on every hot-reload
 * in a Next.js development environment.
 */
export default mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);