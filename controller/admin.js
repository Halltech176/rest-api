const User = require("../model/user");
const catchAsync = require("../utils/catchAsync");
const factory = require("./factory");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.deleteUser = factory.deleteOne(User);
