const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const QurbaniBookingSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    uuid: {
      type: String,
      default: uuidv4,
      unique: true
    },
    customer_name: {
      type: String,
      trim: true
    },
    customer_phone: String,
    customer_email: String,
    vendor_name: String,
    total_shares: {
      type: Number,
      default: 0
    },
    share_code: String,
    booking_date: {
      type: Date,
      default: Date.now
    },
    total_amount: {
      type: Number,
      default: 0
    },
    payment_mode: String,
    status: {
      type: String,
      default: "Pending"
    },
    company_id: {
      type: Number,
      default: 26
    },
    location_id: {
      type: Number,
      default: 30
    },
    qurbani_date: {
      type: String,
      trim: true
    },
    is_approved_by_admin: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

module.exports = mongoose.model("qurbani_booking", QurbaniBookingSchema, "qurbani_bookings");
