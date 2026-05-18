const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true
    },
    firstname: {
      type: String,
      trim: true
    },
    lastname: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    mobile: {
      type: String,
      trim: true
    },
    role_id: {
      type: Number,
      default: 2 // default to vendor/staff
    },
    status: {
      type: Number,
      default: 1
    },
    organisation_id: {
      type: Number,
      default: 1
    },
    company_id: {
      type: Number,
      default: 26
    },
    location_id: {
      type: Number,
      default: 30
    },
    usertype: Number,
    is_approved_by_admin: {
      type: Number,
      default: 1
    },
    login_type: String,
    parent_id: String,
    api_token: String,
    remember_token: String,
    email_verified_at: Date
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (canditatePassword) {
  return bcrypt.compare(canditatePassword, this.password);
};

module.exports = mongoose.model("user_master", UserSchema, "users");
