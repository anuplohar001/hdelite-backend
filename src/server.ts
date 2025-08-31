// server.ts
import express from 'express';
import mongoose, {Types} from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notesRoutes';
import passport from "passport";
import jwt from "jsonwebtoken";
import session from "express-session";
import cookieParser from "cookie-parser";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User, { IUser } from './models/user';
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "https://hdelite-frontend.vercel.app", credentials: true }));
app.use(cookieParser());
app.use(
    session({ secret: "secret", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

declare global {
    namespace Express {
        interface User {
            _id: string | Types.ObjectId;
            name: string;
            email: string;
        }
    }
}


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
            callbackURL: "http://localhost:5000/api/auth/callback/google",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails?.[0].value });

                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails?.[0].value,
                    });
                    await user.save();
                }

                return done(null, user.toObject());  // ✅ FIXED
            } catch (err) {
                return done(err as any, undefined);  // ✅ FIXED
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
});

app.get("/", (req, res) => {
    res.send("Backend is running on Vercel!");
});
// --- Routes ---
app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }),
    (req, res) => {
        console.log("Google auth initiated")
    }
);


app.get(
    "/api/auth/callback/google",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        // const { name, email, dateOfBirth, otp } = req.body;
        const token = jwt.sign(
            {
                id: req.user?._id,
                displayName: req.user?.name,
                email: req.user?.email,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        res.redirect(
            `https://hdelite-frontend.vercel.app/dashboard?token=${token}&name=${req.user?.name}&email=${req.user?.email}`
        );

    }
);


// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI as string);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/notes", notesRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'HD Backend API is running!',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Start server
const startServer = async () => {
    await connectDB();
};

startServer();

export default app;