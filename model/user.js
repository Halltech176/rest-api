const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "A Name must not be less than 3 characters"],
      max: [30, "A Name must not be less than 30 characters"],
      required: [true, "The name field is required"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "super-admin"],
        message: "Role can either be a user, admin or super-admin",
      },

      default: "user",
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "The name email field is required"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "The password field is required"],
      minlength: 8,
      select: false,
    },
    photo: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "confirm password is required"],
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "Password Confirmation failed",
      },
    },
    passwordChangeAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

UserSchema.methods.comparePassword = async function (
  providedPassword,
  dbPassword
) {
  return await bcrypt.compare(providedPassword, dbPassword);
};

UserSchema.methods.changePasswordAt = function (jwtTime) {
  if (this.passwordChangeAt) {
    const parsedTime = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
    return jwtTime < parsedTime;
  }

  return false;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
module.exports = mongoose.model("User", UserSchema);
