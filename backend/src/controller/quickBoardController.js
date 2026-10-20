import mongoose from "mongoose";
import QuickBoard from "../models/quickBoardModel.js";
import User from "../models/userModel.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const MAX_STROKES = 100;
const MAX_POINTS = 2000;
const STROKE_KINDS = new Set(["path", "eraser", "line", "rect", "text"]);

function getBoardConversation(req, res) {
  const { peerId } = req.params;
  const userId = req.user._id.toString();

  if (!mongoose.Types.ObjectId.isValid(peerId) || peerId === userId) {
    res.status(400).json({ message: "Choose a valid chat to open its board." });
    return null;
  }

  const normalizedPeerId = new mongoose.Types.ObjectId(peerId).toString();
  const participants = [userId, normalizedPeerId].sort();
  return { peerId: normalizedPeerId, participants, key: participants.join(":") };
}

function validateStroke(stroke) {
  if (!stroke || typeof stroke !== "object") return null;
  if (typeof stroke.id !== "string" || stroke.id.length < 1 || stroke.id.length > 80) return null;
  if (!STROKE_KINDS.has(stroke.kind)) return null;
  if (typeof stroke.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(stroke.color)) return null;
  if (!Number.isFinite(stroke.width) || stroke.width <= 0 || stroke.width > 0.08) return null;
  if (!Array.isArray(stroke.points) || stroke.points.length < 1 || stroke.points.length > MAX_POINTS) return null;

  const points = stroke.points.map((point) => {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
    if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return null;
    return { x: point.x, y: point.y };
  });
  if (points.some((point) => point === null)) return null;

  if (stroke.kind === "text" && (typeof stroke.text !== "string" || !stroke.text.trim() || stroke.text.length > 200)) {
    return null;
  }
  if (stroke.kind !== "path" && stroke.kind !== "eraser" && stroke.kind !== "text" && points.length > 2) {
    return null;
  }

  return {
    id: stroke.id,
    kind: stroke.kind,
    color: stroke.color,
    width: stroke.width,
    points,
    ...(stroke.kind === "text" ? { text: stroke.text.trim() } : {}),
  };
}

async function ensurePeerExists(peerId) {
  return User.exists({ _id: peerId });
}

export async function getQuickBoard(req, res) {
  try {
    const conversation = getBoardConversation(req, res);
    if (!conversation) return;
    if (!(await ensurePeerExists(conversation.peerId))) {
      return res.status(404).json({ message: "Chat user not found." });
    }

    const board = await QuickBoard.findOne({ key: conversation.key }, { strokes: 1 }).lean();
    return res.status(200).json(board?.strokes ?? []);
  } catch (error) {
    console.error(`Error loading QuickBoard: ${error.message}`);
    return res.status(500).json({ message: "Could not load the shared board." });
  }
}

export async function saveQuickBoardStroke(req, res) {
  try {
    const conversation = getBoardConversation(req, res);
    if (!conversation) return;
    if (!(await ensurePeerExists(conversation.peerId))) {
      return res.status(404).json({ message: "Chat user not found." });
    }

    const stroke = validateStroke(req.body?.stroke);
    if (!stroke) {
      return res.status(400).json({ message: "The drawing could not be saved. Please try again." });
    }

    await QuickBoard.updateOne(
      { key: conversation.key },
      {
        $setOnInsert: { key: conversation.key, participants: conversation.participants },
        $push: { strokes: { $each: [stroke], $slice: -MAX_STROKES } },
      },
      { upsert: true, runValidators: true },
    );

    const receiverSocketId = getReceiverSocketId(conversation.peerId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("quickboard:stroke-saved", {
        fromUserId: req.user._id.toString(),
        stroke,
      });
    }

    return res.status(201).json(stroke);
  } catch (error) {
    console.error(`Error saving QuickBoard stroke: ${error.message}`);
    return res.status(500).json({ message: "Could not save that drawing." });
  }
}

export async function clearQuickBoard(req, res) {
  try {
    const conversation = getBoardConversation(req, res);
    if (!conversation) return;
    if (!(await ensurePeerExists(conversation.peerId))) {
      return res.status(404).json({ message: "Chat user not found." });
    }

    await QuickBoard.updateOne(
      { key: conversation.key },
      {
        $set: { strokes: [] },
        $setOnInsert: { key: conversation.key, participants: conversation.participants },
      },
      { upsert: true, runValidators: true },
    );

    const receiverSocketId = getReceiverSocketId(conversation.peerId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("quickboard:cleared", {
        fromUserId: req.user._id.toString(),
      });
    }

    return res.status(200).json({ message: "Shared board cleared." });
  } catch (error) {
    console.error(`Error clearing QuickBoard: ${error.message}`);
    return res.status(500).json({ message: "Could not clear the shared board." });
  }
}
