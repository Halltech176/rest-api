const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/apiError");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Post = require("../model/post");

exports.checkoutSession = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/checkout`,
    cancel_url: `${req.protocol}://${req.get("host")}/post/${req.params.id}`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 300,

          product_data: {
            name: post.title,

            description: post.content,
          },
        },
      },
    ],
  });
  res.status(200).json({
    status: "success",
    session,
  });
});
