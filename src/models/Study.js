import mongoose from "mongoose";

const studySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 10,
    },
    password: {
      type: String,
      required: true,
      min: 4,
      max: 12,
    },
    bg: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    habits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Habit",
      },
    ],
    emojis: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Emoji",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Study = mongoose.model("Study", studySchema);

export default Study;
