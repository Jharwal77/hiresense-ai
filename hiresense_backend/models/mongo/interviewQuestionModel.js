import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
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
    questions: {
      type: [String],
      required: true,
      validate: {
        validator: (value) =>
          value.length === 5,
        message: "Exactly 5 questions are required"
      }
    }
  },
  {
    timestamps: true,
    collection: "interviewQuestions"
  }
);

interviewQuestionSchema.index(
  {
    candidateId: 1,
    jobId: 1
  },
  {
    unique: true
  }
);

const InterviewQuestion =
  mongoose.model(
    "InterviewQuestion",
    interviewQuestionSchema
  );

export default InterviewQuestion;