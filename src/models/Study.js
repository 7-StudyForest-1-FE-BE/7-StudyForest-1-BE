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
    bg: {
      type: String,
      default: "#ffffff",
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
