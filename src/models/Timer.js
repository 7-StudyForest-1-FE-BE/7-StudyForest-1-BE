const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Timer", timerSchema);
