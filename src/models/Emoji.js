import mongoose from "mongoose";

const emojiSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
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
