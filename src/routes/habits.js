import { Router } from "express";
import Habit from "../models/Habit.js";
import Study from "../models/Study.js";

const router = Router();
// 모든 습관 조회
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find().populate("studyId");
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 스터디의 습관들 조회
router.get("/study/:studyId", async (req, res) => {
  try {
    const habits = await Habit.find({ studyId: req.params.studyId });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 습관 조회
router.get("/:id", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id).populate("studyId");
    if (!habit) {
      return res.status(404).json({ message: "습관을 찾을 수 없습니다" });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 새 습관 생성
router.post("/", async (req, res) => {
  try {
    // 스터디가 존재하는지 확인
    const study = await Study.findById(req.body.studyId);
    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    const habit = new Habit({
      title: req.body.title,
      studyId: req.body.studyId,
      checked: req.body.checked || false,
    });

    const newHabit = await habit.save();

    // 스터디의 habits 배열에 추가
    study.habits.push(newHabit._id);
    await study.save();

    res.status(201).json(newHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 습관 체크 상태 토글
router.patch("/:id/toggle", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ message: "습관을 찾을 수 없습니다" });
    }

    habit.checked = !habit.checked;
    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 습관 정보 업데이트
router.patch("/:id", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ message: "습관을 찾을 수 없습니다" });
    }

    if (req.body.title) habit.title = req.body.title;
    if (req.body.checked !== undefined) habit.checked = req.body.checked;

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 습관 삭제
router.delete("/:id", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ message: "습관을 찾을 수 없습니다" });
    }

    // 스터디의 habits 배열에서 제거
    await Study.findByIdAndUpdate(habit.studyId, {
      $pull: { habits: habit._id },
    });

    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "습관이 삭제되었습니다" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
