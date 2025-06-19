import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Study from "./src/models/Study.js";
import Habit from "./src/models/Habit.js";
import Emoji from "./src/models/Emoji.js";
import usersRouter from "./src/routes/users.js";
import studiesRouter from "./src/routes/studies.js";
import habitsRouter from "./src/routes/habits.js";
import emojisRouter from "./src/routes/emojis.js";
import timersRouter from "./src/routes/timers.js";
import { studyMock } from "./mock.js";

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
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 실패:", err));
/**
await Study.deleteMany();
await Habit.deleteMany();
await Emoji.deleteMany();
for (const study of studyMock) {
  const createdStudy = await Study.create({
    id: study.id,
    password: study.password,
    nickname: study.nickname,
    title: study.title,
    description: study.description,
    points: study.points,
    theme: study.theme,
    habits: [],
    emojis: [],
    createdAt: new Date(study.createdAt),
    createdBy: study.createdBy,
  });

  // Step 2: habits 생성 → studyId 포함
  const habitDocs = await Habit.insertMany(
    study.habits.map((h) => ({
      title: h.title,
      checkedDays: h.checkedDays,
      studyId: createdStudy._id, // ✅ 이거 중요!
    }))
  );

  // Step 3: emojiReactions 생성
  const emojiList = study.emojis || [];
  const emojiDocs = await Emoji.insertMany(
    emojiList.map((e) => ({
      emoji: e.emoji,
      count: e.count,
      studyId: createdStudy._id,
    }))
  );

  // Step 4: Study에 habit/emoji 참조 업데이트
  await Study.findByIdAndUpdate(createdStudy._id, {
    $set: {
      habits: habitDocs.map((h) => h._id),
      emojis: emojiDocs.map((e) => e._id),
    },
  });
}

console.log("📦 스터디/습관/이모지 더미데이터 모두 삽입 완료!");
 */
// Routes 연결
app.use("/api/users", usersRouter);
app.use("/api/studies", studiesRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/emojis", emojisRouter);
app.use("/api/timers", timersRouter);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ message: "Study App API Server" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
