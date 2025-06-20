import { Router } from "express";
import Study from "../models/Study.js";
import Habit from "../models/Habit.js";
import Emoji from "../models/Emoji.js";
import Timer from "../models/Timer.js";
import mongoose from "mongoose";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 6;

    const studies = await Study.find()
      .skip(offset)
      .limit(limit)
      .populate("habits")
      .populate("emojis");

    res.json(studies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 스터디 조회 (habits, emojis 포함 + theme 추가)
router.get("/:id", async (req, res) => {
  try {
    const study = await Study.findById(req.params.id)
      .populate("habits")
      .populate("emojis");

    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    res.json(study);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 비밀번호 확인
router.post("/:id/check-password", async (req, res) => {
  const { password } = req.body;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "유효하지 않은 스터디 ID입니다." });
  }

  try {
    const study = await Study.findById(id);
    if (!study)
      return res
        .status(404)
        .json({ message: "존재하지 않는 스터디가 없습니다." });

    if ((study.password || "").trim() !== (password || "").trim()) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }
    console.log("서버 수신 비밀번호:", password);
    console.log("DB 비밀번호:", study.password);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// 새 스터디 생성
router.post("/", async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ message: "제목은 필수 입력값입니다" });
    }

    const study = new Study({
      title: req.body.title,
      description: req.body.description,
      nickname: req.body.nickname,
      password: req.body.password,
      bg: req.body.bg || 0,
    });

    const newStudy = await study.save();
    res.status(201).json(newStudy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 스터디 정보 업데이트
router.patch("/:id", async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    if (req.body.title) study.title = req.body.title;
    if (req.body.description !== undefined)
      study.description = req.body.description;
    if (req.body.bg !== undefined) study.bg = req.body.bg;

    const updatedStudy = await study.save();
    res.json(updatedStudy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 스터디 삭제
router.delete("/:id", async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    // 관련 데이터 삭제
    await Habit.deleteMany({ studyId: req.params.id });
    await Emoji.deleteMany({ studyId: req.params.id });
    await Timer.deleteMany({ studyId: req.params.id });

    await Study.findByIdAndDelete(req.params.id);

    res.json({ message: "스터디와 관련 데이터가 삭제되었습니다" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/test/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }
    const study = await Study.findById(id);
    if (!study) return res.status(404).send("Not found");
    res.json(study);
  } catch (error) {
    console.error("스터디 조회 중 에러:", error);
    res.status(500).send("서버 에러 발생");
  }
});

export default router;
