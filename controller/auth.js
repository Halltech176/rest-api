const User = require("../model/user");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const Email = require("../utils/email");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/apiError");
const crypto = require("crypto");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (statusCode, user, message, res) => {
  const token = createToken(user._id);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 3600 * 1000
    ),
    // secure: true,
  });
  if (process.env.NODE_ENV === "production") {
    res.cookie.secure = true;
  }
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    message,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, password, confirmPassword, photo, passwordChangeAt, email } =
    req.body;
  const user = await User.create(req.body);
  user.password = undefined;
  createSendToken(201, user, "user created successfully", res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password is provided

  if (!email || !password) {
    return next(new AppError("email and password are required", 401));
  }

  //   check if the details provided is in the database
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("invalid credentials provided", 401));
  }
  //  await new Email(user, "new url").sendWelcome();

  createSendToken(200, user, "user logged in successfully", res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // check if the user pass an authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("No Authorization header found", 401));
  }

  //   verify if the token passed is valid token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //   check if the user with the token still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("The token belong to this user does no longer exist")
    );
  }

  //   Check if the password was changed
  if (user.changePasswordAt(decoded.iat)) {
    return next(
      new AppError("The password is recently changed please log in again", 401)
    );
  }
  req.user = user;
  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission for this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError("There is no user with this particular email address", 404)
    );
  }
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${token}`;

  const message = `Forgot your password ? please click the this link to reset to your password ${resetUrl}.\n If you did not forgot your password, Please ignore this.`;
  //   sendin email
  try {
    await new Email(user, "password reset").resetPassword(message);
    res.status(200).json({
      status: "success",
      message: "Check your e-mail to reset your password",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "something went wrong please retry again.",
    });
  }
  //   const mailSent
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get the provided token from the user
  const passwordResetToken = req.params.token;

  const hashedToken = crypto
    .createHash("sha256")
    .update(passwordResetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("invalid token or the token as expired", 401));
  }
  const { password, confirmPassword } = req.body;

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save({ validateBeforeSave: true });

  createSendToken(200, user, "password reset successfully", res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //  Get the user from the collection
  const user = await User.findOne(req.user._id).select("+password");

  const { password, newPassword, confirmPassword } = req.body;

  if (!(await user.comparePassword(password, user.password))) {
    return next(new AppError("You entered an invalid password", 402));
  }

  user.password = newPassword;
  user.confirmPassword = confirmPassword;

  await user.save({ validateBeforeSave: true });

  createSendToken(200, user, "password change succesfully", res);
});
