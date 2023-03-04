const User = require("../model/user");
const AppError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./factory");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("This file type is not accepted", 409), false);
  }
};

const upload = multer({ storage, fileFilter });

const FilterObj = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach((data) => {
    if (fields.includes(data)) {
      newObj[data] = obj[data];
    }
  });

  return newObj;
};

exports.uploadPhoto = upload.single("photo");
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "Please use the update password route to update your password",
        401
      )
    );
  }
  const acceptedFields = FilterObj(req.body, "name", "email");
  if (req.file) acceptedFields.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, acceptedFields, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    message: "user updated successfully",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(200).json({
    status: "success",
    message: "user deleted successfully",
  });
});

exports.deteteUser = factory.deleteOne(User);
