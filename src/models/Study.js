const mongoose = require("mongoose");

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

module.exports = mongoose.model("Study", studySchema);
