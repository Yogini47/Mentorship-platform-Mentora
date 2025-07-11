// Earnings Schema
import mongoose from "mongoose";
const EarningsSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
  totalEarnings: { type: Number, default: 0 },
  transactions: [
    {
      amount: Number,
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ["pending", "paid"], default: "pending" },
    },
  ],
});
export const Earnings = mongoose.model("Earnings", EarningsSchema);