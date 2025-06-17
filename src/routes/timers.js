const express = require("express");
const router = express.Router();
const Timer = require("../models/Timer");
const User = require("../models/User");
const Study = require("../models/Study");

// 모든 타이머 기록 조회
router.get("/", async (req, res) => {
  try {
    const timers = await Timer.find().populate("studyId").populate("userId");
    res.json(timers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 사용자의 타이머 기록 조회
router.get("/user/:userId", async (req, res) => {
  try {
    const timers = await Timer.find({ userId: req.params.userId })
      .populate("studyId")
      .sort({ createdAt: -1 }); // 최신순 정렬
    res.json(timers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 스터디의 타이머 기록 조회
router.get("/study/:studyId", async (req, res) => {
  try {
    const timers = await Timer.find({ studyId: req.params.studyId })
      .populate("userId")
      .sort({ createdAt: -1 }); // 최신순 정렬
    res.json(timers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 사용자의 특정 스터디 타이머 기록 조회
router.get("/user/:userId/study/:studyId", async (req, res) => {
  try {
    const timers = await Timer.find({
      userId: req.params.userId,
      studyId: req.params.studyId,
    })
      .populate("studyId")
      .sort({ createdAt: -1 });
    res.json(timers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 타이머 기록 조회
router.get("/:id", async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id)
      .populate("studyId")
      .populate("userId");

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

// 새 타이머 기록 생성
router.post("/", async (req, res) => {
  try {
    // 사용자와 스터디가 존재하는지 확인
    const user = await User.findById(req.body.userId);
    const study = await Study.findById(req.body.studyId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }
    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    // 포인트 계산 로직 (예: 1분당 1포인트)
    const earnedPoints = Math.floor(req.body.duration / 60); // duration이 초단위라고 가정

    const timer = new Timer({
      duration: req.body.duration,
      earnedPoints: earnedPoints,
      studyId: req.body.studyId,
      userId: req.body.userId,
    });

    const newTimer = await timer.save();

    // 사용자 포인트 업데이트
    user.points += earnedPoints;
    await user.save();

    // populate해서 반환
    const populatedTimer = await Timer.findById(newTimer._id)
      .populate("studyId")
      .populate("userId");

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
      // 포인트 재계산
      timer.earnedPoints = Math.floor(req.body.duration / 60);
    }

    if (req.body.earnedPoints !== undefined) {
      timer.earnedPoints = req.body.earnedPoints;
    }

    const updatedTimer = await timer.save();

    // 포인트가 변경되었다면 사용자 포인트도 업데이트
    if (oldEarnedPoints !== updatedTimer.earnedPoints) {
      const user = await User.findById(timer.userId);
      user.points = user.points - oldEarnedPoints + updatedTimer.earnedPoints;
      await user.save();
    }

    const populatedTimer = await Timer.findById(updatedTimer._id)
      .populate("studyId")
      .populate("userId");

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

    // 사용자 포인트에서 해당 포인트 차감
    const user = await User.findById(timer.userId);
    user.points -= timer.earnedPoints;
    await user.save();

    await Timer.findByIdAndDelete(req.params.id);
    res.json({ message: "타이머 기록이 삭제되었습니다" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 사용자의 총 공부 시간 조회
router.get("/stats/user/:userId", async (req, res) => {
  try {
    const stats = await Timer.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
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

module.exports = router;
