// routes/trips.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Trip = require("../models/trip");

const ensureObjectId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ message: "유효하지 않은 ID형식입니다." });
    return false;
  }
  return true;
};

// CREATE: POST /api/trips
router.post("/", async (req, res) => {
  try {
    const { name, date, dayNo, isCompleted } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "name은 필수입니다." });
    }

    const newTrip = new Trip({
      name: String(name).trim(),
      date: date ? new Date(date) : Date.now(),
      ...(dayNo !== undefined ? { dayNo } : {}),
      ...(typeof isCompleted === "boolean" ? { isCompleted } : {})
    });

    const trip = await newTrip.save();
    return res.status(201).json({ trip });
  } catch (error) {
    console.error("post 실패",error);
    return res.status(400).json({ error: "여행을 저장하지 못했습니다." });
  }
});

// READ ALL: GET /api/trips
router.get("/", async (_req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    return res.status(200).json({ trips });
  } catch (error) {
    console.error("",error);
    return res.status(400).json({ error: "데이터를 불러오지 못했습니다." });
  }
});

router.use((req, _res, next) => {
  console.log('[TRIPS]', req.method, req.originalUrl, 'body=', req.body);
  next();
});

// READ ONE: GET /api/trips/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ensureObjectId(id, res)) return;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: "해당 Id의 trip가 없습니다." });
    }
    return res.status(200).json({ trip });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "데이터를 불러오지 못했습니다." });
  }
});

// UPDATE (전체): PUT /api/trips/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ensureObjectId(id, res)) return;

    const { name, date, dayNo, isCompleted } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (date !== undefined) updateData.date = new Date(date);
    if (dayNo !== undefined) updateData.dayNo = dayNo;
    if (typeof isCompleted === "boolean") updateData.isCompleted = isCompleted;

    const trip = await Trip.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!trip) {
      return res.status(404).json({ message: "해당 Id의 trip가 없습니다." });
    }
    return res.status(200).json({ trip });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "데이터를 수정하지 못했습니다." });
  }
});

// DELETE: DELETE /api/trips/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ensureObjectId(id, res)) return;

    const deleted = await Trip.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "해당 Id의 trip가 없습니다." });
    }

    const trips = await Trip.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "1개 삭제하기 성공",
      deletedId: deleted._id,
      trips,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "데이터를 불러오지 못했습니다." });
  }
});

// PATCH 체크 토글: PATCH /api/trips/:id/check
router.patch("/:id/check", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ensureObjectId(id, res)) return;

    const { isCompleted } = req.body;
    if (typeof isCompleted !== "boolean") {
      return res
        .status(400)
        .json({ message: "isCompleted는 반드시 boolean이어야 합니다." });
    }

    const trip = await Trip.findByIdAndUpdate(
      id,
      { isCompleted },
      { new: true, runValidators: true, context: "query" }
    );

    if (!trip) {
      return res.status(404).json({ message: "해당 Id의 trip가 없습니다." });
    }
    return res.status(200).json({ trip });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "데이터를 수정하지 못했습니다." });
  }
});

// PATCH 이름만 수정: PATCH /api/trips/:id/name
router.patch("/:id/name", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ensureObjectId(id, res)) return;

    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "name은 필수입니다." });
    }

    const trip = await Trip.findByIdAndUpdate(
      id,
      { name: String(name).trim() },
      { new: true, runValidators: true, context: "query" }
    );

    if (!trip) {
      return res.status(404).json({ message: "해당 Id의 trip가 없습니다." });
    }
    return res.status(200).json({ trip });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "데이터를 수정하지 못했습니다." });
  }
});

module.exports = router;
