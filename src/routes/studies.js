import { Router } from "express";
import Study from "../models/Study.js";
import Habit from "../models/Habit.js";
import Emoji from "../models/Emoji.js";
import Timer from "../models/Timer.js";
import bgThemes from "../config/bgThemes.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const studies = await Study.find().populate("habits").populate("emojis");

    const studiesWithThemes = studies.map((study) => {
      const studyObj = study.toObject();
      studyObj.theme = bgThemes[study.bg] || null;
      return studyObj;
    });

    res.json(studiesWithThemes);
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

    const studyObj = study.toObject();
    studyObj.theme = bgThemes[study.bg] || null;

    res.json(studyObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

export default router;
