import { Router } from "express";
import mongoose from "mongoose";
import Timer from "../models/Timer.js";
import Study from "../models/Study.js";

const router = Router();

// 수정된 포인트 계산 함수 - 최소 10분 기준
function calculateEarnedPoints(duration) {
  const minRequiredTime = 10 * 60; // 10분 (600초)

  // 완료한 시간이 10분 미만이면 포인트 없음
  if (duration < minRequiredTime) {
    return 0;
  }

  const basePoints = 3;
  const bonusPoints = Math.floor(duration / (10 * 60)); // 10분당 1포인트
  return basePoints + bonusPoints;
}

router.get("/", async (req, res) => {
  try {
    const timers = await Timer.find().populate("studyId");
    res.json(timers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/study/:studyId", async (req, res) => {
  try {
    const timers = await Timer.find({ studyId: req.params.studyId }).sort({
      createdAt: -1,
    });
    res.json(timers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id).populate("studyId");

    if (!timer) {
      return res
        .status(404)
        .json({ message: "타이머 기록을 찾을 수 없습니다" });
    }
    res.json(timer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.body.duration || !req.body.studyId) {
      return res.status(400).json({
        message: "duration, studyId는 필수 입력값입니다",
      });
    }

    const study = await Study.findById(req.body.studyId);

    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    // 수정된 포인트 계산 로직 적용 - 최소 10분 기준
    const earnedPoints = calculateEarnedPoints(req.body.duration);

    const timer = new Timer({
      duration: req.body.duration,
      earnedPoints: earnedPoints,
      studyId: req.body.studyId,
    });

    const newTimer = await timer.save();

    // 스터디 포인트 업데이트 (포인트가 0이어도 기록은 저장)
    study.points += earnedPoints;
    await study.save();

    // populate해서 반환
    const populatedTimer = await Timer.findById(newTimer._id).populate(
      "studyId"
    );

    res.status(201).json(populatedTimer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 타이머 기록 업데이트
router.patch("/:id", async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id);
    if (!timer) {
      return res
        .status(404)
        .json({ message: "타이머 기록을 찾을 수 없습니다" });
    }

    const oldEarnedPoints = timer.earnedPoints;

    if (req.body.duration !== undefined) {
      timer.duration = req.body.duration;
      // 수정된 포인트 계산 로직으로 포인트 재계산
      timer.earnedPoints = calculateEarnedPoints(req.body.duration);
    }

    if (req.body.earnedPoints !== undefined) {
      timer.earnedPoints = req.body.earnedPoints;
    }

    const updatedTimer = await timer.save();

    // 포인트가 변경되었다면 스터디 포인트도 업데이트
    if (oldEarnedPoints !== updatedTimer.earnedPoints) {
      const study = await Study.findById(timer.studyId);
      study.points = study.points - oldEarnedPoints + updatedTimer.earnedPoints;
      await study.save();
    }

    const populatedTimer = await Timer.findById(updatedTimer._id).populate(
      "studyId"
    );

    res.json(populatedTimer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 타이머 기록 삭제
router.delete("/:id", async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id);
    if (!timer) {
      return res
        .status(404)
        .json({ message: "타이머 기록을 찾을 수 없습니다" });
    }

    // 스터디 포인트에서 해당 포인트 차감
    const study = await Study.findById(timer.studyId);
    if (study) {
      study.points = Math.max(0, study.points - timer.earnedPoints); // 음수 방지
      await study.save();
    }

    await Timer.findByIdAndDelete(req.params.id);
    res.json({ message: "타이머 기록이 삭제되었습니다" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 스터디의 총 공부 시간 조회
router.get("/stats/study/:studyId", async (req, res) => {
  try {
    const stats = await Timer.aggregate([
      { $match: { studyId: new mongoose.Types.ObjectId(req.params.studyId) } },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: "$duration" },
          totalSessions: { $sum: 1 },
          totalPoints: { $sum: "$earnedPoints" },
        },
      },
    ]);

    res.json(
      stats[0] || { totalDuration: 0, totalSessions: 0, totalPoints: 0 }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
