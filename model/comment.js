const mongoose = require("mongoose");
const Post = require("./post");
const commentSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "A comment is required"],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A comment must have a sender ID"],
    },
    rating: {
      type: Number,
      min: [1, "A rating value cannot be less than 1"],
      max: [5, "A rating value cannot be greater than 5"],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: [true, "The post ID is required"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
  { timestamps: true }
);

commentSchema.statics.calcStats = async function (postId) {
  const stats = await this.aggregate([
    {
      $match: { post: postId },
    },
    {
      $group: {
        _id: "$post",
        numRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  await Post.findByIdAndUpdate(postId, {
    ratings: stats[0].numRating,
  });
};

commentSchema.index({ post: 1, user: 1 }, { unique: true });
commentSchema.post("save", function (next) {
  this.constructor.calcStats(this.post);
});

// Note this should be use for pre( delete - update) middleware

module.exports = mongoose.model("Comment", commentSchema);
