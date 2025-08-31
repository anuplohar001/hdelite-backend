import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
    note: string;
    createdBy: mongoose.Types.ObjectId; // Reference to User
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
    {
        note: {
            type: String,
            required: true,
            trim: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",   // assumes you already have a User model
            required: true,
        },
    },
    { timestamps: true } // automatically adds createdAt & updatedAt
);

export default mongoose.model<INote>("Note", NoteSchema);
