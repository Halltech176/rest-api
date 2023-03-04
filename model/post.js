const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
// const User = require("./user");

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
    mentionFriends: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      enum: {
        values: ["technology", "education", "social", "politics"],
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
      set: (val) => Math.round(val * 10) / 10,
    },
    coverImage: String,
    reference: String,
    images :[String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
  { timestamps: true }
);
postSchema.index({ rating: 1 });
postSchema.virtual("ratingsPercentage").get(function () {
  return (this.ratingsPercentage = (this.ratings / 5) * 100);
});

// viirtual populate
postSchema.virtual("comment", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});
// Document Middleware

// runs for only create() and save() methods
postSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

postSchema.pre(/^find/, function (next) {
  // this.populate("mentionFriends")
  // this.populate("comment");
  next();
});
// Data modelling by embedding

// postSchema.pre("save", async function (next) {
//   const friends = this.mentionFriends.map(
//     async (id) => await User.findById(id)
//   );
//   this.mentionFriends = await Promise.all(friends);
//   next();
// });

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
