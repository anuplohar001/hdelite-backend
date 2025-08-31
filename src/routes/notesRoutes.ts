import express, { Request, Response } from "express";
import Note from "../models/note";
import User from "../models/user";
import { AuthenticatedRequest } from "../types/auth";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

/** GET /api/notes — notes for the logged-in user */
router.get("/", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const email = req.jwt?.email;
        if (!email) return res.status(401).json({ success: false, message: "anup" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const notes = await Note.find({ createdBy: user._id }).sort({ createdAt: -1 });
        res.json({ success: true, notes });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
});

/** POST /api/notes — create note for logged-in user */
router.post("/", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const email = req.jwt?.email;
        const { note } = req.body;
        if (!email) return res.status(401).json({ success: false, message: "anup" });
        if (!note) return res.status(400).json({ success: false, message: "Note is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const newNote = await Note.create({ note, createdBy: user._id });
        res.status(201).json({ success: true, note: newNote });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
});

/** DELETE /api/notes/:id — delete note by id for logged-in user */
router.delete("/:id", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const email = req.jwt?.email;
        const { id } = req.params;
        console.log("Delete note id: ", id);
        if (!email) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const deleted = await Note.findOneAndDelete({ _id: id, createdBy: user._id });
        if (!deleted) return res.status(404).json({ success: false, message: "Note not found" });

        res.json({ success: true, message: "Note deleted", note: deleted });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
});

export default router;
