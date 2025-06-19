import mongoose from "mongoose";

const timerSchema = new mongoose.Schema(
  {
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    earnedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    studyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Study",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Timer = mongoose.model("Timer", timerSchema);

export default Timer;
