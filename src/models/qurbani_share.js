const mongoose = require("mongoose");

const QurbaniShareSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    booking_id: mongoose.Schema.Types.ObjectId,
    share_reg_no: String,
    beneficiary_name: {
      type: String,
      trim: true
    },
    beneficiary_mobile: String,
    objective: {
      type: String,
      default: "Qurbani"
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

module.exports = mongoose.model("qurbani_share", QurbaniShareSchema, "qurbani_shares");
