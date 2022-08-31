const express = require("express");
const userRouter = require("./Database/routes/user.routes");
const postRouter = require("./Database/routes/post.routes");
const authRouter = require("./Database/routes/auth.routes");
const cors = require("cors");

const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
app.use("/api", userRouter);
app.use("/api", postRouter);
app.use("/api", authRouter);
app.use(express.static("public"));

app.listen(process.env.PORT || 4000, () => {
  console.clear();
  console.log(`Server running at http://localhost:${process.env.PORT || 4000}`);
});
