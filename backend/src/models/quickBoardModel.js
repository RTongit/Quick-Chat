import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true, min: 0, max: 1 },
    y: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const strokeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    kind: {
      type: String,
      enum: ["path", "eraser", "line", "rect", "text"],
      required: true,
    },
    color: { type: String, required: true },
    width: { type: Number, required: true, min: 0, max: 0.08 },
    points: { type: [pointSchema], required: true },
    text: { type: String, maxlength: 200 },
  },
  { _id: false },
);

const quickBoardSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    strokes: { type: [strokeSchema], default: [] },
  },
  { timestamps: true },
);

const QuickBoard = mongoose.model("QuickBoard", quickBoardSchema);

export default QuickBoard;
