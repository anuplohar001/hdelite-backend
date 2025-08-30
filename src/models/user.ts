// models/user.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
// Define the interface for User document
export interface IUser extends Document {
    name: string;
    email: string;
    dateOfBirth: Date;
    generateToken(): string;
}

// Define the schema
const userSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
        },
        dateOfBirth: {
            type: Date,
            required: [true, "Date of Birth is required"],
        },
    },
    { timestamps: true }
);

userSchema.methods.generateToken = function (): string {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // expires in 7 days
    );
};

// Export User model
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
