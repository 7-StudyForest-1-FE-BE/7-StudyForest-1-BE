import mongoose from "mongoose";

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

const Emoji = mongoose.model("Emoji", emojiSchema);

export default Emoji;
