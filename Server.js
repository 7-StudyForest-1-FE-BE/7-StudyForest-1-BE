const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/study-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB 연결 성공 1"))
  .catch((err) => console.error("MongoDB 연결 실패:", err));

// Routes 연결
app.use("/api/users", require("./src/routes/users"));
app.use("/api/studies", require("./src/routes/studies"));
app.use("/api/habits", require("./src/routes/habits"));
app.use("/api/emojis", require("./src/routes/emojis"));
app.use("/api/timers", require("./src/routes/timers"));

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ message: "Study App API Server" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
