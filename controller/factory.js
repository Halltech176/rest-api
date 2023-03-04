const catchAsync = require("../utils/catchAsync");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const response = await Model.findByIdAndDelete(id);
    if (!response) {
      return next(new AppError("No dccument found with the ID", 404));
    }
    res.status(200).json({
      status: "success",
      message: "data successfully deleted",
    });
  });
