import mongoose from "mongoose";

const matchResultSchema = new mongoose.Schema(
  {
    candidateId: {
      type: Number,
      required: true,
      index: true
    },

    jobId: {
      type: Number,
      required: true,
      index: true
    },

    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    reasoning: {
      type: String,
      required: true,
      trim: true
    },

    strengths: {
      type: [String],
      default: []
    },

    gaps: {
      type: [String],
      default: []
    },

    interviewQuestions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    collection: "matchResults"
  }
);

matchResultSchema.index(
  {
    candidateId: 1,
    jobId: 1
  },
  {
    unique: true
  }
);

const MatchResult =
  mongoose.models.MatchResult ||
  mongoose.model(
    "MatchResult",
    matchResultSchema
  );

export default MatchResult;