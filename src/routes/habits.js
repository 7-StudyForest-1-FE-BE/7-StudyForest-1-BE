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
// router.patch("/:id/toggle", async (req, res) => {
//   try {
//     const habit = await Habit.findById(req.params.id);
//     if (!habit) {
//       return res.status(404).json({ message: "습관을 찾을 수 없습니다" });
//     }

//     habit.checked = !habit.checked;
//     const updatedHabit = await habit.save();
//     res.json(updatedHabit);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// 요일별 체크 상태 토글
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { day } = req.body; // 요일(day) 정보 받기
    if (!day) return res.status(400).json({ message: "요일(day) 필요함" });

    const habit = await Habit.findById(req.params.id);
    if (!habit)
      return res.status(404).json({ message: "습관을 찾을 수 없습니다" });

    const checkedDays = habit.checkedDays || new Map();

    const current = checkedDays.get(day) || false;
    checkedDays.set(day, !current);

    habit.checkedDays = checkedDays;

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

// 습관 조회
router.post("/today", async (req, res) => {
  try {
    const { studyId, password } = req.body;

    const study = await Study.findById(studyId).populate("habits");
    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    if (study.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
    }

    res.json({ habits: study.habits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 스터디 상세 조회
router.get("/:studyId", async (req, res) => {
  try {
    const { studyId } = req.params;
    const { populateHabits } = req.query;
    let studyQuery = Study.findById(studyId);
    if (populateHabits === "true") {
      studyQuery = studyQuery.populate("habits");
    }
    const study = await studyQuery.exec();

    if (!study)
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });

    res.json(study);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/study/:studyId/habits", async (req, res) => {
  try {
    console.log("studyId:", req.params.studyId);
    console.log("habits:", req.body.habits);

    const { studyId } = req.params;
    const { habits } = req.body;

    const study = await Study.findById(studyId);
    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    // 기존 스터디 관련 습관 모두 삭제
    await Habit.deleteMany({ studyId });

    // 새 습관들 생성 및 study.habits 업데이트
    const newHabits = await Promise.all(
      habits.map(async (title) => {
        const newHabit = new Habit({ title, studyId });
        await newHabit.save();
        return newHabit._id;
      })
    );

    study.habits = newHabits;
    await study.save();

    res.json({ message: "습관 목록이 성공적으로 업데이트 되었습니다." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 00시 기준으로 습관 목록 체크 표시(색변한거) 초기화
export async function resetAllHabitsCheckedDays() {
  try {
    await Habit.updateMany({}, { $set: { checkedDays: {} } });
    console.log("모든 습관의 checkedDays 초기화 완료");
  } catch (error) {
    console.error("습관 초기화 중 오류 발생:", error);
  }
}

export default router;
