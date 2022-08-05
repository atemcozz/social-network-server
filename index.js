const express = require("express");
const userRouter = require("./routes/user.routes");
const postRouter = require("./routes/post.routes");
const PORT = 4000;

const app = express();
app.use(express.json());
app.use("/api", userRouter);
app.use("/api", postRouter);

app.listen(PORT, () => {
  console.clear();
  console.log(`Server running at http://localhost:${PORT}`);
});
