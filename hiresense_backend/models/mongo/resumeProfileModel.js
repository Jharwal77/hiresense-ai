import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      trim: true,
      default: ""
    },

    degree: {
      type: String,
      trim: true,
      default: ""
    },

    field: {
      type: String,
      trim: true,
      default: ""
    },

    startYear: {
      type: Number,
      min: 0,
      default: null
    },

    endYear: {
      type: Number,
      min: 0,
      default: null
    },

    details: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    _id: false
  }
);

const workHistorySchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      default: ""
    },

    role: {
      type: String,
      trim: true,
      default: ""
    },

    startDate: {
      type: String,
      trim: true,
      default: ""
    },

    endDate: {
      type: String,
      trim: true,
      default: ""
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    }
  },
  {
    _id: false
  }
);

const sourceDocumentSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true
    },

    secureUrl: {
      type: String,
      required: true
    },

    filename: {
      type: String,
      required: true
    },

    mimeType: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const resumeProfileSchema = new mongoose.Schema(
  {
    candidateId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      trim: true,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    experienceYears: {
      type: Number,
      min: 0,
      default: 0
    },

    education: {
      type: [educationSchema],
      default: []
    },

    workHistory: {
      type: [workHistorySchema],
      default: []
    },

    /*
     * Overall resume quality score.
     *
     * This is NOT a job match score.
     * It represents the quality/completeness of the
     * candidate resume/profile itself.
     */
    resumeScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },

    resumeStrengths: {
      type: [String],
      default: []
    },

    resumeGaps: {
      type: [String],
      default: []
    },

    sourceDocument: {
      type: sourceDocumentSchema,
      required: true
    },

    /*
     * Keep extracted resume text for:
     *
     * - retry
     * - manual review
     * - debugging
     * - future re-analysis
     */
    rawText: {
      type: String,
      required: true
    },

    aiStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "manual_review"
      ],
      default: "pending"
    },

    aiError: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "resumeProfiles"
  }
);

const ResumeProfile = mongoose.model(
  "ResumeProfile",
  resumeProfileSchema
);

export default ResumeProfile;