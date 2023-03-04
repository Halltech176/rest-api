// installed modules
const express = require("express");
const mongoose = require("mongoose");
const AppError = require("./utils/apiError");
const { globalError } = require("./controller/error");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
// Custom Files Import
const PostRoutes = require("./routes/post");
const AuthRoutes = require("./routes/auth");
const UserRoutes = require("./routes/user");
const commentRoutes = require("./routes/comment");
const adminRoutes = require("./routes/admin");
const checkoutRoutes = require("./routes/checkout");

const app = express();

app.use(helmet());
const Limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    "Too many request from this IP address please try again later in an hours time",
});

// Rate limting
app.use("/api", Limiter);
// body Parser middleware

app.use(bodyParser.json({ limit: "10kb" }));

// Data sanitization against NOSQl Quer Injection
app.use(mongoSanitize());

// Data sanitization again XSS
app.use(xss());

// parameter polution
app.use(
  hpp({
    whitelist: ["duration", "title", "content", "ratings"],
  })
);

// working with CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, PUT"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use(`${process.env.BASE_URL}/auth`, AuthRoutes);
app.use(`${process.env.BASE_URL}`, PostRoutes);
app.use(`${process.env.BASE_URL}/user`, UserRoutes);
app.use(`${process.env.BASE_URL}`, commentRoutes);
app.use(`${process.env.BASE_URL}/users`, adminRoutes);
app.use(`${process.env.BASE_URL}`, checkoutRoutes);

// handling notfound routes
app.all("*", (req, res, next) => {
  const err = new AppError(`cannot find ${req.originalUrl}`, 404);
  next(err);
});

// Global Error handling Middleware

app.use(globalError);

module.exports = app;
