import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      enum: [
        'USER_CREATED',
        'USER_DELETED',
        'USER_UPDATED',
        'SHEET_UPLOADED',
        'POST_CREATED',
        'POST_DELETED',
        'POST_POSTED',
        'LOGIN',
        'LOGOUT',
      ],
      required: true,
    },
    resource: {
      type: String,
      enum: ['USER', 'SHEET', 'POST', 'AUTH'],
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
