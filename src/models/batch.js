const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    item_id: String,
    batch_number: {
      type: String,
      trim: true
    },
    qty: {
      type: Number,
      default: 0
    },
    current_in_stock: {
      type: Number,
      default: 0
    },
    expiry_date: Date
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

module.exports = mongoose.model("batch", BatchSchema, "batches");
