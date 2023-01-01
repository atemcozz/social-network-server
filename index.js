const express = require("express");
const userRouter = require("./Database/routes/user.routes");
const postRouter = require("./Database/routes/post.routes");
const authRouter = require("./Database/routes/auth.routes");
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware");
const cloudinary = require("cloudinary").v2;
// const cookieParser = require("cookie-parser");
require("dotenv").config();
cloudinary.config({
  cloud_name: "aqemcozz",
  api_key: "136287691914888",
  api_secret: "ZEWy_ik__AS86njecDGK-2_fQk0",
});

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://social-network-client-red.vercel.app",
      "https://social-network-client-red.vercel.app",
      "https://social-network-client-atemcozz.vercel.app",
      "https://social-network-client-3l8f5xhl4-atemcozz.vercel.app",
      "https://social-network-client-git-master-atemcozz.vercel.app",
      "https://falco.vercel.app",
    ],
  })
);

// app.use(cookieParser());
app.use("/api", userRouter);
app.use("/api", postRouter);
app.use("/api", authRouter);
app.use(express.static("public"));
app.use(errorMiddleware);

app.listen(process.env.PORT || 4000, (err) => {
  console.clear();
  console.log(`Server running at http://localhost:${process.env.PORT || 4000}`);
});
process.on("uncaughtException", (err) => {
  console.log(err);
});
