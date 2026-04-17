import mongoose from 'mongoose';

const sheetsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      trim: true,
      default: 'Imported Site'
    },
    siteUrl: {
      type: String,
      required: [true, 'Site URL is required'],
      validate: {
        validator(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL',
      },
    },
    credentials: {
      username: String,
      password: String,
      apiKeyOrToken: String,
    },
    type: {
      type: String,
      enum: ['WORDPRESS', 'CUSTOM', 'WOO_COMMERCE'],
      default: 'WORDPRESS',
    },
    visibility: {
      type: String,
      enum: ['PLATFORM', 'PRIVATE'],
      default: 'PRIVATE',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      description: String,
      category: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Sheet', sheetsSchema);
