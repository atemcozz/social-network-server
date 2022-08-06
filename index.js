const express = require("express");
const userRouter = require("./Database/routes/user.routes");
const postRouter = require("./Database/routes/post.routes");
const authRouter = require("./Database/routes/auth.routes");
const cors = require("cors");
const PORT = 4000;

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", userRouter);
app.use("/api", postRouter);
app.use("/api", authRouter);

app.listen(PORT, () => {
  console.clear();
  console.log(`Server running at http://localhost:${PORT}`);
});
