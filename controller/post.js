// importing neccessary models
const Post = require("../model/post");
const ApiFeatures = require("../utils/ApiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/apiError");
const socket = require("../socket");
const factory = require("./factory");
const multer = require("multer");
const sharp = require("sharp");
// Getting the posts

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // consol.log();
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(null, new AppError(" The file should be an image"));
  }
};

const upload = multer({ storage, fileFilter });
exports.uploadPostImages = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizePostImage = catchAsync(async (req, res, next) => {
  if (!req.files.coverImage || !req.files.images) return next();

  // processing the cover image
  req.body.coverImage = `post-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.coverImage[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/posts/${req.body.coverImage}`);

  req.body.images = [];
  // processing the post images
  await Promise.all(
    req.files.images.map(async (data, index) => {
      const filename = `post-${
        req.params.id
      }-${Date.now()}-image-${index}.jpeg`;
      await sharp(data.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/posts/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});
exports.getPosts = catchAsync(async (req, res, next) => {
  const query = new ApiFeatures(Post.find(), req.query)
    .Filter()
    .Sort()
    .FieldLimit()
    .Paginate();

  const totalDocs = await Post.countDocuments();

  const posts = await query.query.find();
  // const totalDocs = posts.length;

  res.status(totalDocs ? 200 : 204).json({
    status: "success",
    message: "Posts retrieved successfully",
    data: totalDocs ? posts : "No Posts found",
    totalDocs,
    // page,
    // limit,
    // hasNextPage: totalDocs >= skip,
  });
});

// creating a post

exports.createPost = catchAsync(async (req, res, next) => {
  const findDuplicate = await Post.findOne({ title: req.body.title });
  if (findDuplicate) {
    const error = new Error("post with same title already exist");
    error.statusCode = 422;
    error.status = "fail";
    throw error;
  }
  const response = await Post.create(req.body);
  socket.getIO().emit("post", response);
  res.status(201).json({
    status: "created",
    message: "Post created successfully",
    data: response,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;

  const response = await Post.findById(postId);

  if (!response) {
    return next(new AppError("No post found with the ID", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Post retrieved successfully",
    data: response,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;

  const response = await Post.findByIdAndUpdate(postId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!response) {
    return next(new AppError("No post found with the ID", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Post updated successfully",
    data: response,
  });
});

exports.deletePost = factory.deleteOne(Post);

exports.getTopPosts = (req, res, next) => {
  req.query.limit = 2;
  req.query.sort = "-createdAt";
  next();
};

exports.getPostsStats = catchAsync(async (req, res, next) => {
  const stats = await Post.aggregate([
    {
      $match: { ratings: { $gte: 0 } },
    },
    {
      $group: {
        _id: "$category",
        avgRatings: { $avg: "$ratings" },
        maxRatings: { $max: "$ratings" },
        minRatings: { $min: "$ratings" },
        numRatings: { $sum: "$ratings" },
        numPosts: { $sum: 1 },
      },
    },
    {
      $sort: { $avgRatings: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    stats,
  });
});

exports.getDailyPosts = catchAsync(async (req, res, next) => {
  const year = +req.params.year;

  const stats = await Post.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        numOfPosts: { $sum: 1 },
        posts: {
          $push: "$title",
        },
      },
    },
    {
      $addFields: {
        day: "$_id",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    message: "Daily Statistics fetched successfully",
    stats,
  });
});
