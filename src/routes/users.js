import { Router } from "express";
import User from "../models/User.js";

const router = Router();
// 모든 사용자 조회
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 사용자 조회
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 새 사용자 생성
router.post("/", async (req, res) => {
  try {
    const user = new User({
      points: req.body.points || 0,
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 사용자 포인트 업데이트
router.patch("/:id/points", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }

    user.points = req.body.points;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 사용자 포인트 추가 (기존 포인트에 더하기)
router.patch("/:id/add-points", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }

    user.points += req.body.points || 0;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 사용자 삭제
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "사용자가 삭제되었습니다" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
