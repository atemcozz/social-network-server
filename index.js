const express = require("express");
const userRouter = require("./routes/user.routes");
const postRouter = require("./routes/post.routes");
const authRouter = require("./routes/auth.routes");
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware");
require("dotenv").config();

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
