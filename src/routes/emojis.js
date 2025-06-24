import { Router } from "express";
import Emoji from "../models/Emoji.js";
import Study from "../models/Study.js";

const router = Router();

// 모든 이모지 조회
router.get("/", async (req, res) => {
  try {
    const emojis = await Emoji.find().populate("studyId");
    res.json(emojis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 스터디의 이모지들 조회
router.get("/study/:studyId", async (req, res) => {
  try {
    const emojis = await Emoji.find({ studyId: req.params.studyId });
    res.json(emojis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 이모지 조회
router.get("/:id", async (req, res) => {
  try {
    const emoji = await Emoji.findById(req.params.id).populate("studyId");
    if (!emoji) {
      return res.status(404).json({ message: "이모지를 찾을 수 없습니다" });
    }
    res.json(emoji);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 새 이모지 생성
router.post("/", async (req, res) => {
  try {
    // 스터디가 존재하는지 확인
    const study = await Study.findById(req.body.studyId);
    if (!study) {
      return res.status(404).json({ message: "스터디를 찾을 수 없습니다" });
    }

    const emoji = new Emoji({
      emoji: req.body.emoji,
      studyId: req.body.studyId,
      checked: req.body.checked || false,
    });

    const newEmoji = await emoji.save();

    // 스터디의 emojis 배열에 추가
    study.emojis.push(newEmoji._id);
    await study.save();

    res.status(201).json(newEmoji);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 스터디 관련 이모지
router.post("/add", async (req, res) => {
  try {
    console.log("📦 받은 바디:", req.body);
    const { studyId, emoji, action } = req.body;

    const study = await Study.findById(req.body.studyId);
    // ✅ emoji 값이 숫자여도 문자열로 변환
    const safeEmoji = String(emoji);

    let existing = await Emoji.findOne({ studyId, emoji: safeEmoji });

    if (action === "increase") {
      if (existing) {
        existing.count += 1;
        await existing.save();
      } else {
        const newEmoji = new Emoji({
          studyId,
          emoji: safeEmoji,
          count: 1, // ⭐️ 바로 count = 1
        });
        await newEmoji.save();

        study.emojis.push(newEmoji._id);
        await study.save();
      }
    }

    // 업데이트된 이모지 목록 반환
    const emojis = await Emoji.find({ studyId, count: { $gt: 0 } });
    res.json(emojis);
  } catch (err) {
    console.error("이모지 등록 실패:", err);
    res.status(500).json({ message: "이모지 등록 실패" });
  }
});

// 스터디 관련 이모지
router.post("/react", async (req, res) => {
  try {
    const { studyId, emoji, action } = req.body;

    // ✅ emoji 값이 숫자여도 문자열로 변환
    const safeEmoji = String(emoji);

    const update =
      action === "increase" ? { $inc: { count: 1 } } : { $inc: { count: -1 } };

    const updated = await Emoji.findOneAndUpdate(
      { studyId, emoji: safeEmoji },
      update,
      { upsert: true, new: true }
    );
    console.log("✅ 업데이트 결과:", updated);
    res.json(updated);
  } catch (err) {
    console.error("이모지 업데이트 실패:", err);
    res.status(500).json({ error: "이모지 업데이트 실패" });
  }
});

// 이모지 정보 업데이트
router.patch("/:id", async (req, res) => {
  try {
    const emoji = await Emoji.findById(req.params.id);
    if (!emoji) {
      return res.status(404).json({ message: "이모지를 찾을 수 없습니다" });
    }

    if (req.body.emoji) emoji.emoji = req.body.emoji;
    if (req.body.checked !== undefined) emoji.checked = req.body.checked;

    const updatedEmoji = await emoji.save();
    res.json(updatedEmoji);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 이모지 삭제
router.delete("/:id", async (req, res) => {
  try {
    const emoji = await Emoji.findById(req.params.id);
    if (!emoji) {
      return res.status(404).json({ message: "이모지를 찾을 수 없습니다" });
    }

    // 스터디의 emojis 배열에서 제거
    await Study.findByIdAndUpdate(emoji.studyId, {
      $pull: { emojis: emoji._id },
    });

    await Emoji.findByIdAndDelete(req.params.id);
    res.json({ message: "이모지가 삭제되었습니다" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
