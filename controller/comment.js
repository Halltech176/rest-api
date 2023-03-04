const Comment = require("../model/comment");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/apiError");
const jwt = require("jsonwebtoken");
const factory = require("./factory");

exports.createComment = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { comment, rating } = req.body;
  const response = await Comment.create({
    comment,
    rating,
    post: id,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "created",
    data: {
      comment: response,
    },
  });
});

exports.getComments = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const comments = await Comment.find({ post: id });

  res.status(200).json({
    status: "success",
    message: "comment fetched successfully",
    data: {
      comments,
    },
  });
});

exports.deleteComment = factory.deleteOne(Comment);
