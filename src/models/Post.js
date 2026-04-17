import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    selectedSites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheet',
      },
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'GENERATING', 'GENERATED', 'POSTING', 'COMPLETED', 'FAILED'],
      default: 'DRAFT',
    },
    postingResults: [
      {
        site: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Sheet',
        },
        status: {
          type: String,
          enum: ['PENDING', 'SUCCESS', 'FAILED'],
          default: 'PENDING',
        },
        postUrl: String,
        errorMessage: String,
        postedAt: Date,
      },
    ],
    metadata: {
      seoTitle: String,
      seoDescription: String,
      featuredImage: String,
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduledTime: Date,
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
