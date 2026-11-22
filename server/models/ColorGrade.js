const mongoose = require('mongoose');

const colorGradeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Comparison title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    beforeImageUrl: {
      type: String,
      required: [true, 'Before image URL (RAW / LOG) is required'],
      trim: true,
    },
    afterImageUrl: {
      type: String,
      required: [true, 'After image URL (Graded Look) is required'],
      trim: true,
    },
    camera: {
      type: String,
      default: 'ARRI Alexa Mini / Sony FX3',
      trim: true,
    },
    colorSpace: {
      type: String,
      default: 'DaVinci Wide Gamut / Rec.709',
      trim: true,
    },
    notes: {
      type: String,
      default: 'Custom film print emulation with natural skin tones',
      trim: true,
    },
    featured: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ColorGrade', colorGradeSchema);
