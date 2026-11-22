const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    projectType: {
      type: String,
      required: [true, 'Project type is required'],
      enum: [
        'Short-form Reels / Shorts',
        'Commercial / YouTube Long-Form',
        'Color Grading Only',
        'Full Post-Production',
        'Other Inquiry',
      ],
      default: 'Short-form Reels / Shorts',
    },
    budget: {
      type: String,
      default: 'Flexible / Discuss',
    },
    message: {
      type: String,
      required: [true, 'Project details / message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
