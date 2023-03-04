const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true, "The post ID is required"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "The user ID is required"],
  },
  price: {
    type: Number,
    required: [true, "A booking must have a price"],
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

module.exports = bookingSchema.model("Booking", bookingSchema);
