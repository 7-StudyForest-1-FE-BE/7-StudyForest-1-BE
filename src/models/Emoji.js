const mongoose = require("mongoose");

const emojiSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    studyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Study",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Emoji", emojiSchema);
