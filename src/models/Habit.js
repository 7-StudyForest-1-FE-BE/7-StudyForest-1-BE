import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    checkedDays: {
      type: Map,
      of: Boolean,
      default: {
        월: false,
        화: false,
        수: false,
        목: false,
        금: false,
        토: false,
        일: false,
      },
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

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;
