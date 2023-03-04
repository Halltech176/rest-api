const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A post must have a title"],
      unique: true,
      trim: true,
      maxlength: [50, "Title cannot be more than 50 characers"],
      minlength: [5, "Title cannot be less than 5 characers"],
      // validate: [validator.isAlpha, "Title name should contain only characters"],
    },
    content: {
      type: String,
      required: [true, "A post must have a content"],
    },
    friends: [Array],
    category: {
      type: String,
      unique: true,
      enum: {
        values: ["technology", "education", "social"],
        message:
          "{VALUE} is not accepted, category can only be technology, education or social",
      },
      required: [true, "Please select a post category"],
      default: "social",
    },
    slug: String,

    ratings: {
      type: Number,
      default: 2,
      max: [5, "ratings must be atmost 5"],
      min: [0, "ratings must be atleast 0"],
    },
    coverImage: String,
    reference: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
  { timestamps: true }
);

postSchema.virtual("ratingsPercentage").get(function () {
  this.ratingsPercentage = (ratings / 5) * 100;
});

// Document Middleware

// runs for only create() and save() methods
postSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Query Middleware

// runs for find() methods
postSchema.pre(/^find/, function (next) {
  this.find({ secretPost: { $ne: true } });
  next();
});

// Aggregate middleware
postSchema.pre("aggregate", function (next) {
  next();
});

module.exports = mongoose.model("Post", postSchema);
