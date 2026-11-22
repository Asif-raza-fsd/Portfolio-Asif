const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    heroIntro: {
      type: String,
      default: 'Hi I am',
    },
    heroName: {
      type: String,
      default: 'Asif Raza',
    },
    heroTitle: {
      type: String,
      default: 'Video Editor & Colorist',
    },
    heroPortraitUrl: {
      type: String,
      default: 'assets/images/hero-portrait.png',
    },
    heroBio: {
      type: String,
      default:
        'Crafting cinematic narratives with precision pacing and world-class color grading in DaVinci Resolve.',
    },
    cvUrl: {
      type: String,
      default: 'assets/docs/asif-raza-resume.pdf',
    },
    experienceYears: {
      type: String,
      default: '2+',
    },
    projectsDone: {
      type: String,
      default: '50+',
    },
    happyClients: {
      type: String,
      default: '20+',
    },
    socialLinks: {
      instagram: {
        type: String,
        default: 'https://instagram.com/asifraza',
      },
      youtube: {
        type: String,
        default: 'https://youtube.com/@asifraza',
      },
      linkedin: {
        type: String,
        default: 'https://linkedin.com/in/asifraza',
      },
      behance: {
        type: String,
        default: 'https://behance.net/asifraza',
      },
    },
    contactEmail: {
      type: String,
      default: 'contact@asifraza.com',
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    location: {
      type: String,
      default: 'Available Worldwide (Remote)',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
