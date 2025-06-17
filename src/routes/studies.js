const express = require("express");
const router = express.Router();
const Study = require("../models/Study");
const Habit = require("../models/Habit");
const Emoji = require("../models/Emoji");

// 모든 스터디 조회 (habits, emojis 포함)
router.get("/", async (req, res) => {
  try {
    const studies = await Study.find().populate("habits").populate("emojis");
    res.json(studies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 스터디 조회 (habits, emojis 포함)
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

// 새 스터디 생성
router.post("/", async (req, res) => {
  try {
    const study = new Study({
      title: req.body.title,
      description: req.body.description,
      bg: req.body.bg || "#ffffff",
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
    if (req.body.bg) study.bg = req.body.bg;

    const updatedStudy = await study.save();
    res.json(updatedStudy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 스터디 삭제 (관련된 habits, emojis도 함께 삭제)
router.delete("/:id", async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    // 관련된 habits와 emojis 삭제
    await Habit.deleteMany({ studyId: req.params.id });
    await Emoji.deleteMany({ studyId: req.params.id });

    // 스터디 삭제
    await Study.findByIdAndDelete(req.params.id);

    res.json({ message: "스터디와 관련 데이터가 삭제되었습니다" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
